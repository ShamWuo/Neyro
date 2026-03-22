import { GoogleGenerativeAI } from "@google/generative-ai";
import { Project } from "../types";

// Initialize Gemini
// NOTE: In a production app, you should not store keys in client-side code usually.
// Best practice involves proxying through a backend.
// For this standalone app, ensure EXPO_PUBLIC_GEMINI_API_KEY is in your .env
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface AIPlanPreferences {
    totalMinutes: number;
    startTime: string; // e.g. "09:00 AM"
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    includeReview: boolean;
    focusAreas: string[]; // e.g. ["Deep Work", "Admin"]
    selectedProjectIds: string[]; // IDs of projects to include (empty = all)
}

export interface AIScheduleSession {
    projectId?: string;
    projectTitle: string;
    durationMinutes: number;
    notes: string;
    focus: string; // Specific task or focus
    type: 'deep_work' | 'shallow_work' | 'admin' | 'review';
    startTime?: string;
    date: string; // YYYY-MM-DD
}

export async function generatePracticeSchedule(
    projects: Project[],
    prefs: AIPlanPreferences
): Promise<AIScheduleSession[]> {
    if (!API_KEY) {
        throw new Error("Gemini API Key is missing. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.");
    }

    // Filter projects if selection is provided
    let activeProjects = projects;
    if (prefs.selectedProjectIds && prefs.selectedProjectIds.length > 0) {
        activeProjects = projects.filter(p => prefs.selectedProjectIds.includes(p.id));
    }

    // Fallback if no projects
    if (activeProjects.length === 0 && !prefs.includeReview) {
        // We can still plan general work?
    }

    const projectsList = activeProjects.map(p => `- ${p.title} (Status: ${p.status}) (ID: ${p.id})`).join("\n");
    const focusString = prefs.focusAreas && prefs.focusAreas.length > 0 ? prefs.focusAreas.join(", ") : "General Productivity";

    const prompt = `
    You are an expert productivity coach using the Neyro system (CODE/PARA). Create a focus schedule for me.
    
    My Context:
    - Date Range: From ${prefs.startDate} to ${prefs.endDate}.
    - Available Time Per Day: ${prefs.totalMinutes} minutes.
    - Start Time Per Day: ${prefs.startTime}.
    - Preferences: Include Review=${prefs.includeReview}.
    - Focus Areas: ${focusString}.
    
    My Active Projects:
    ${projectsList}

    Instructions:
    1. Create a schedule for EACH DAY in the date range inclusive.
    2. If requested, include a Review session daily (approx 10-15 mins).
    3. Allocate time to my active projects. Prioritize based on focus areas.
    4. **CRITICAL: Keep titles VERY concise.** (e.g. "Draft Report").
    5. Assign a 'startTime' string (HH:MM AM/PM) for each block, starting at ${prefs.startTime}.
    6. **CRITICAL: Include the 'date' field (YYYY-MM-DD) for every session.**

    Output PURE JSON array (no markdown), flat list of all sessions for all days:
    [
        {
            "date": "2024-01-01",
            "projectTitle": "Project Alpha",
            "durationMinutes": 45,
            "notes": "Draft the outline",
            "focus": "Writing",
            "type": "deep_work",
            "startTime": "09:00 AM",
            "projectId": "ID_FROM_LIST_OR_NULL"
        }
    ]
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const schedule: AIScheduleSession[] = JSON.parse(jsonStr);

        return schedule;
    } catch (error) {
        console.error("Gemini AI generation error:", error);
        throw new Error("Failed to generate schedule with AI.");
    }
}

