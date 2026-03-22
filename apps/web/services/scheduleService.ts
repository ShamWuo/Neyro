import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export interface ScheduleItem {
    id: string;
    content: string;
    type: string;
    priority: string;
    dueDate?: string;
    dueTime?: string;
    estimatedMinutes?: number;
}

export interface TimeBlock {
    period: 'morning' | 'afternoon' | 'evening';
    startTime: string;
    endTime: string;
    items: ScheduleItem[];
    totalMinutes: number;
}

export interface AISchedule {
    date: string;
    blocks: TimeBlock[];
    totalEstimatedMinutes: number;
    efficiency: number; // 0-1 score
}

export async function generateOptimalSchedule(
    items: ScheduleItem[],
    availableHours: number = 8,
    startTime: string = '09:00'
): Promise<AISchedule> {
    if (items.length === 0) {
        return generateBasicSchedule(items, availableHours, startTime);
    }

    // If no API key or too many items, use basic scheduling
    if (!API_KEY || items.length > 20) {
        return generateBasicSchedule(items, availableHours, startTime);
    }

    // Create a timeout promise
    const timeoutPromise = new Promise<AISchedule>((_, reject) => {
        setTimeout(() => reject(new Error('Schedule generation timed out')), 5000); // 5 second timeout
    });

    const aiPromise = (async () => {
        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

            const itemsText = items.slice(0, 15).map((item, i) => 
                `${i + 1}. "${item.content}" (Type: ${item.type}, Priority: ${item.priority}${item.dueDate ? `, Due: ${item.dueDate}` : ''}${item.estimatedMinutes ? `, Est: ${item.estimatedMinutes}min` : ''})`
            ).join('\n');

            const prompt = `
You are an expert productivity AI. Create an optimal daily schedule for these tasks.

Available Time: ${availableHours} hours (${availableHours * 60} minutes)
Start Time: ${startTime}

Tasks:
${itemsText}

Create an optimal schedule that:
1. Groups tasks into Morning (${startTime}-12:00), Afternoon (12:00-17:00), and Evening (17:00-21:00)
2. Prioritizes urgent/high priority items
3. Respects due dates
4. Groups similar tasks together
5. Balances workload across the day
6. Estimates realistic time for each task

Return ONLY valid JSON (no markdown, no code blocks):
{
    "blocks": [
        {
            "period": "morning",
            "startTime": "09:00",
            "endTime": "12:00",
            "items": [{"id": "item_id", "estimatedMinutes": 30}],
            "totalMinutes": 180
        }
    ],
    "totalEstimatedMinutes": 480,
    "efficiency": 0.85
}
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Extract JSON from response
            let jsonStr = text.trim();
            const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            }
            jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
            
            const schedule = JSON.parse(jsonStr);

            // Map items back to full item data
            const blocks = schedule.blocks.map((block: any) => ({
                ...block,
                items: block.items.map((scheduledItem: any) => {
                    const fullItem = items.find(i => i.id === scheduledItem.id);
                    return fullItem ? { ...fullItem, estimatedMinutes: scheduledItem.estimatedMinutes || 30 } : null;
                }).filter(Boolean)
            }));

            return {
                date: new Date().toISOString().split('T')[0],
                blocks,
                totalEstimatedMinutes: schedule.totalEstimatedMinutes || schedule.totalEstimatedMinutes || blocks.reduce((sum: number, b: any) => sum + b.totalMinutes, 0),
                efficiency: schedule.efficiency || 0.8
            };
        } catch (error) {
            console.error('AI schedule generation failed:', error);
            throw error;
        }
    })();

    try {
        // Race between AI and timeout
        return await Promise.race([aiPromise, timeoutPromise]);
    } catch (error) {
        console.warn('AI schedule generation failed or timed out, using basic schedule:', error);
        return generateBasicSchedule(items, availableHours, startTime);
    }
}

function generateBasicSchedule(
    items: ScheduleItem[],
    availableHours: number,
    startTime: string
): AISchedule {
    // Sort by priority and due date
    const sorted = [...items].sort((a, b) => {
        const priorityOrder: any = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 2;
        const bPriority = priorityOrder[b.priority] || 2;
        if (aPriority !== bPriority) return bPriority - aPriority;
        
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return 0;
    });

    const totalMinutes = availableHours * 60;
    const third = Math.ceil(sorted.length / 3);

    const blocks: TimeBlock[] = [
        {
            period: 'morning',
            startTime: startTime,
            endTime: '12:00',
            items: sorted.slice(0, third),
            totalMinutes: Math.min(third * 30, 180)
        },
        {
            period: 'afternoon',
            startTime: '12:00',
            endTime: '17:00',
            items: sorted.slice(third, third * 2),
            totalMinutes: Math.min(third * 30, 300)
        },
        {
            period: 'evening',
            startTime: '17:00',
            endTime: '21:00',
            items: sorted.slice(third * 2),
            totalMinutes: Math.min((sorted.length - third * 2) * 30, 240)
        }
    ];

    return {
        date: new Date().toISOString().split('T')[0],
        blocks,
        totalEstimatedMinutes: blocks.reduce((sum, b) => sum + b.totalMinutes, 0),
        efficiency: 0.7
    };
}
