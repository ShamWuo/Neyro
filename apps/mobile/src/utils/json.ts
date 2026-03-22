/**
 * Safely parses JSON from a string, handling common AI response artifacts
 * like markdown code blocks (```json ... ```) or preambles.
 */
export function safeParseJSON<T = any>(input: string): { success: true; data: T } | { success: false; error: any } {
    try {
        // 1. Remove markdown code blocks
        let clean = input.replace(/```json/g, '').replace(/```/g, '').trim();

        // 2. Attempt direct parse
        try {
            const data = JSON.parse(clean);
            return { success: true, data };
        } catch (e) {
            // 3. Last ditch: try to find the first '{' and last '}'
            const start = clean.indexOf('{');
            const end = clean.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
                clean = clean.substring(start, end + 1);
                const data = JSON.parse(clean);
                return { success: true, data };
            }
            throw e;
        }
    } catch (error) {
        console.error('safeParseJSON failed:', error);
        return { success: false, error };
    }
}
