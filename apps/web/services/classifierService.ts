import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ClassificationResult {
    destination: 'project' | 'area' | 'resource' | 'archive';
    confidence: number;
    reasoning: string;
    targetId?: string;
}

interface ClassifyOptions {
    projects?: Array<{ id: string; title: string }>;
    areas?: Array<{ id: string; title: string }>;
}

export const ClassifierService = {
    async classify(content: string, options: ClassifyOptions = {}): Promise<ClassificationResult> {
        const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
        
        if (!API_KEY) {
            console.warn('ClassifierService: No API Key found');
            // Fallback: simple keyword-based classification
            return {
                destination: content.toLowerCase().includes('project') || content.toLowerCase().includes('build') ? 'project' : 
                           content.toLowerCase().includes('area') || content.toLowerCase().includes('health') ? 'area' :
                           content.toLowerCase().includes('reference') || content.toLowerCase().includes('note') ? 'resource' : 'project',
                confidence: 0.5,
                reasoning: 'Fallback classification (no API key)',
            };
        }

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const projects = options.projects || [];
            const areas = options.areas || [];

            const projectList = projects.map((p) => `- ${p.title} (ID: ${p.id})`).join('\n') || 'None';
            const areaList = areas.map((a) => `- ${a.title} (ID: ${a.id})`).join('\n') || 'None';

            const prompt = `
You are a productivity assistant for a GTD/PARA system. Classify this input:

"${content}"

Available Projects:
${projectList || 'None'}

Available Areas:
${areaList || 'None'}

Classify into one of: 'project', 'area', 'resource', or 'archive'.

Rules:
- 'project': Actionable work with a clear outcome (matches existing project or new project)
- 'area': Ongoing responsibility (matches existing area or general area like "Health", "Finance")
- 'resource': Reference material, notes, ideas, non-actionable information
- 'archive': Completed or irrelevant items

If it matches an existing Project or Area, return its ID in targetId.

Return JSON:
{
    "destination": "project" | "area" | "resource" | "archive",
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation",
    "targetId": "matched_id_or_null"
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
                    destination: parsed.destination || 'project',
                    confidence: parsed.confidence || 0.7,
                    reasoning: parsed.reasoning || 'AI classification',
                    targetId: parsed.targetId || undefined,
                };
            }

            // Fallback
            return {
                destination: 'resource',
                confidence: 0,
                reasoning: 'Could not parse AI response',
            };
        } catch (error) {
            console.error('Classification error:', error);
            // Fallback classification
            return {
                destination: 'resource',
                confidence: 0.5,
                reasoning: 'Classification failed, defaulting to project',
            };
        }
    },
};
