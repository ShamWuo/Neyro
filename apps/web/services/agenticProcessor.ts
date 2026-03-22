import { GoogleGenerativeAI } from '@google/generative-ai';
import { useNeyroStore } from '@mobile/store/useNeyroStore';

export interface ProcessedItem {
    id: string;
    originalContent: string;
    type: 'task' | 'project' | 'event' | 'resource' | 'note';
    title: string;
    description?: string;
    suggestedDestination: 'project' | 'area' | 'resource' | 'archive';
    suggestedTargetId?: string;
    suggestedTargetName?: string;
    dueDate?: string; // YYYY-MM-DD
    timeEstimate?: number; // minutes
    energyLevel?: 'low' | 'medium' | 'high';
    tags?: string[];
    relatedItems?: string[]; // IDs of related inbox items
    confidence: number;
    reasoning: string;
}

export interface BatchCluster {
    items: string[]; // Inbox item IDs
    suggestedAction: 'create_project' | 'create_area' | 'create_resource' | 'separate';
    projectTitle?: string;
    projectDescription?: string;
    tasks?: Array<{
        title: string;
        dueDate?: string;
        timeEstimate?: number;
    }>;
    confidence: number;
    reasoning: string;
}

export interface AgentProcessingResult {
    processedItems: ProcessedItem[];
    batches: BatchCluster[];
    suggestedTodayActions: Array<{
        itemId: string;
        title: string;
        priority: 'high' | 'medium' | 'low';
        timeEstimate: number;
        energyLevel: 'low' | 'medium' | 'high';
    }>;
}

export const AgenticProcessor = {
    async processInbox(items: Array<{ id: string; content: string; createdAt: number }>): Promise<AgentProcessingResult> {
        const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
        
        if (!API_KEY || items.length === 0) {
            return {
                processedItems: [],
                batches: [],
                suggestedTodayActions: [],
            };
        }

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            // @ts-ignore
            const activeProjects = useNeyroStore.getState().activeProjects || [];
            // @ts-ignore
            const areas = useNeyroStore.getState().areas || [];

            const projectList = activeProjects.map((p: any) => `- ${p.title} (ID: ${p.id})`).join('\n') || 'None';
            const areaList = areas.map((a: any) => `- ${a.title} (ID: ${a.id})`).join('\n') || 'None';

            const itemsText = items.map((item, i) => 
                `${i + 1}. [ID: ${item.id}] "${item.content}" (Created: ${new Date(item.createdAt).toLocaleDateString()})`
            ).join('\n');

            const prompt = `
You are an advanced productivity agent for a GTD/PARA system. Analyze these inbox items and provide structured processing recommendations.

Inbox Items:
${itemsText}

Available Projects:
${projectList}

Available Areas:
${areaList}

For each item, provide:
1. Type: 'task' (actionable), 'project' (complex goal), 'event' (calendar), 'resource' (reference), 'note' (info)
2. Suggested destination: 'project', 'area', 'resource', or 'archive'
3. If matching existing project/area, provide its ID
4. Due date (if mentioned or inferable)
5. Time estimate in minutes
6. Energy level: 'low', 'medium', 'high'
7. Tags (e.g., 'school', 'errands', 'deep-work', 'urgent')
8. Related items (if items should be grouped)

Also identify BATCHES - groups of items that should be processed together:
- Similar items that belong to one project
- Related tasks that should be grouped
- Items that should be separated

Finally, suggest TODAY actions - high-priority items that should be done today.

Return JSON:
{
    "processedItems": [
        {
            "id": "item_id",
            "originalContent": "original text",
            "type": "task" | "project" | "event" | "resource" | "note",
            "title": "extracted title",
            "description": "optional description",
            "suggestedDestination": "project" | "area" | "resource" | "archive",
            "suggestedTargetId": "matched_id_or_null",
            "suggestedTargetName": "matched_name_or_null",
            "dueDate": "YYYY-MM-DD or null",
            "timeEstimate": 30,
            "energyLevel": "low" | "medium" | "high",
            "tags": ["tag1", "tag2"],
            "relatedItems": ["other_item_id"],
            "confidence": 0.0-1.0,
            "reasoning": "brief explanation"
        }
    ],
    "batches": [
        {
            "items": ["item_id1", "item_id2"],
            "suggestedAction": "create_project" | "create_area" | "create_resource" | "separate",
            "projectTitle": "if creating project",
            "projectDescription": "if creating project",
            "tasks": [
                {
                    "title": "task title",
                    "dueDate": "YYYY-MM-DD",
                    "timeEstimate": 30
                }
            ],
            "confidence": 0.0-1.0,
            "reasoning": "why batch these"
        }
    ],
    "suggestedTodayActions": [
        {
            "itemId": "item_id",
            "title": "action title",
            "priority": "high" | "medium" | "low",
            "timeEstimate": 30,
            "energyLevel": "low" | "medium" | "high"
        }
    ]
}
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    processedItems: parsed.processedItems || [],
                    batches: parsed.batches || [],
                    suggestedTodayActions: parsed.suggestedTodayActions || [],
                };
            }

            return {
                processedItems: [],
                batches: [],
                suggestedTodayActions: [],
            };
        } catch (error) {
            console.error('Agentic processing error:', error);
            return {
                processedItems: [],
                batches: [],
                suggestedTodayActions: [],
            };
        }
    },
};
