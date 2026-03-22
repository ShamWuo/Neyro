import { GoogleGenerativeAI } from '@google/generative-ai';
import { safeParseJSON } from '../utils/json';
import { Project, Area } from '../database/schema';
import { AdaptiveAIService } from './adaptiveAIService';

// NOTE: Ensure EXPO_PUBLIC_GEMINI_API_KEY is available

export interface ClassificationResult {
    intent: 'task' | 'project' | 'note' | 'event' | 'reminder';
    summary: string;
    urgency: 'high' | 'medium' | 'low';
    suggestedDestination: 'project' | 'area' | 'resource' | 'calendar';
    suggestedTargetId?: string; // ID of the Project/Area if matched
    suggestedTargetName?: string; // Name of the Project/Area
    confidence: number;
    requiresReview: boolean; // NEW: Flag for low-confidence classifications
    reasoning: string;
    actionable: boolean;
    dueDate?: string; // Suggested due date YYYY-MM-DD
    // Action Chunking: If input contains multiple distinct tasks
    actions?: Array<{
        summary: string;
        urgency: 'high' | 'medium' | 'low';
        suggestedDestination: 'project' | 'area' | 'resource' | 'calendar';
        suggestedTargetId?: string;
        suggestedTargetName?: string;
        dueDate?: string;
    }>;
    autoFile?: boolean; // New: Should this be auto-filed?
}

export const ClassifierService = {
    classifyContent: async (
        content: string,
        projects: Project[],
        areas: Area[],
        tier: 'free' | 'musician' | 'virtuoso' = 'free'
    ): Promise<ClassificationResult | null> => {
        if (!content || !content.trim()) return null;

        // Support both Expo (mobile) and Next.js (web) environment variables
        const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
        if (!API_KEY) {
            console.warn("ClassifierService: No API Key found in environment (checked EXPO_PUBLIC_GEMINI_API_KEY and NEXT_PUBLIC_GEMINI_API_KEY)");
            return null;
        }

        const genAI = new GoogleGenerativeAI(API_KEY);

        // Tiered Model Selection
        // All tiers: Gemini 2.5 Flash
        const modelName = "gemini-2.5-flash";

        // console.log(`[Classifier] Using model: ${modelName} for tier: ${tier}`);
        const modelInstance = genAI.getGenerativeModel({ model: modelName });

        const projectList = projects.map(p => `- ${p.title} (ID: ${p.id})`).join('\n');
        const areaList = areas.map(a => `- ${a.title} (ID: ${a.id})`).join('\n');

        // Fetch user preferences (with error handling for web app)
        let constraints: any[] = [];
        let styleMirrors: any[] = [];
        try {
            constraints = await AdaptiveAIService.getNegativeConstraints('user_default'); // In real app, pass actual userId
            styleMirrors = await AdaptiveAIService.getStyleMirrors('user_default');
        } catch (e) {
            // Database not available (e.g., in web app without proper setup)
            console.warn('Could not fetch user preferences:', e);
        }

        const constraintText = constraints.length > 0
            ? '\n        NEGATIVE CONSTRAINTS (DO NOT VIOLATE):\n' + constraints.map(c => `        - ${c.pattern}: ${JSON.parse(c.action).reason}`).join('\n')
            : '';

        const styleText = styleMirrors.length > 0
            ? '\n        USER PREFERENCES (FOLLOW THESE PATTERNS):\n' + styleMirrors.map(s => `        - ${s.pattern}: ${JSON.parse(s.action).reason}`).join('\n')
            : '';

        const prompt = `
        You are an advanced productivity assistant for a GTD/PARA system.
        Analyze the user's input to extract structured data.

        User Input: "${content}"

        Current Context:
        Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

        Available Projects (ID: Title):
        ${projectList}

        Available Areas (ID: Title):
        ${areaList}
        ${constraintText}
        ${styleText}

        Guidelines:
        1. INTENT: 'task' (actionable), 'project' (complex goal), 'note' (reference/resource), 'event' (calendar), 'reminder'.
        2. DESTINATION:
           - 'project': If it belongs to an Actie Project.
           - 'area': If it relates to a general Area of Responsibility (e.g. valid syntax "Health: run 5k").
           - 'resource': If it's a reference note, book recommendation, idea list, or non-actionable info.
           - 'calendar': If it's an event.
        3. MATCHING:
           - Look for exact or fuzzy matches with Project/Area titles.
           - Support "Title: Action" syntax (e.g. "Neyro App: Fix bugs" -> Project "Neyro App").
           - Return the ID in 'suggestedTargetId' and the exact Title in 'suggestedTargetName'.
           - IF NO MATCH found for a Task, suggest 'Area' (e.g. "Admin" or "Life").
        4. URGENCY: 'high' (immediate/today), 'medium' (soon/this week), 'low' (someday).
        5. DATES: Parse relative dates (e.g. "next friday", "tomorrow") into YYYY-MM-DD.
        6. ACTION CHUNKING:
           - If the input contains MULTIPLE distinct tasks (e.g., "Buy milk and finish report"), split them.
           - Return the primary task in the main fields, and additional tasks in the "actions" array.
           - Each action should be atomic and independently actionable.
           - Examples that should be chunked:
             * "Buy milk, call mom, and finish essay" → 3 actions
           - Do NOT chunk if it's a single complex task with sub-steps or if the connector "and" implies a single context (e.g. "Research and write report" -> 1 task).

        Output strictly valid JSON:
        {
            "intent": "task" | "project" | "note" | "event" | "reminder",
            "summary": "Primary task title",
            "urgency": "high" | "medium" | "low",
            "suggestedDestination": "project" | "area" | "resource" | "calendar",
            "suggestedTargetId": "MATCHED_ID" or null,
            "suggestedTargetName": "MATCHED_TITLE" or null,
            "confidence": 0.0 to 1.0,
            "reasoning": "Brief explanation of classification (mention if chunked)",
            "actionable": boolean,
            "dueDate": "YYYY-MM-DD" or null,
            "actions": [
                {
                    "summary": "Second task title",
                    "urgency": "high" | "medium" | "low",
                    "suggestedDestination": "project" | "area" | "resource" | "calendar",
                    "suggestedTargetId": "MATCHED_ID" or null,
                    "suggestedTargetName": "MATCHED_TITLE" or null,
                    "dueDate": "YYYY-MM-DD" or null
                }
            ] (optional, only if multiple distinct tasks detected)
        }
        `;

        try {
            const aiResponse = await modelInstance.generateContent(prompt);
            const response = await aiResponse.response;
            const text = response.text();

            const parsed = safeParseJSON(text);
            if (!parsed.success) {
                console.error("ClassifierService: JSON parse failed", text);
                return null;
            }

            const classificationResult = parsed.data as ClassificationResult;

            // Add requiresReview flag based on confidence threshold
            const CONFIDENCE_THRESHOLD = 0.7;
            classificationResult.requiresReview = (classificationResult.confidence || 0) < CONFIDENCE_THRESHOLD;

            // Check auto-file eligibility (with error handling)
            try {
                classificationResult.autoFile = await AdaptiveAIService.shouldAutoSort('user_default', classificationResult);
            } catch (e) {
                // Database not available, default to false
                console.warn('Could not check auto-file eligibility:', e);
                classificationResult.autoFile = false;
            }

            return classificationResult;
        } catch (error) {
            console.error("Classifier Service Error:", error);
            return null;
        }
    }
};

