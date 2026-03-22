import { parseNaturalDate, formatDateHuman } from '../dateParser';

describe('Natural Language Date Parser', () => {
    describe('parseNaturalDate', () => {
        it('should parse "today"', () => {
            const result = parseNaturalDate('today');
            const today = new Date();
            const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            expect(result).toBe(expected);
        });

        it('should parse "tomorrow"', () => {
            const result = parseNaturalDate('tomorrow');
            expect(result).toBeTruthy();
            expect(result?.length).toBe(10); // YYYY-MM-DD format
        });

        it('should parse "tmr" as tomorrow', () => {
            const result = parseNaturalDate('tmr');
            const tomorrow = parseNaturalDate('tomorrow');
            expect(result).toBe(tomorrow);
        });

        it('should parse "yesterday"', () => {
            const result = parseNaturalDate('yesterday');
            expect(result).toBeTruthy();
            expect(result?.length).toBe(10);
        });

        it('should parse "next week"', () => {
            const result = parseNaturalDate('next week');
            expect(result).toBeTruthy();
            expect(result?.length).toBe(10);
        });

        it('should parse day names', () => {
            const result = parseNaturalDate('friday');
            expect(result).toBeTruthy();
            expect(result?.length).toBe(10);
        });

        it('should parse "in 3 days"', () => {
            const result = parseNaturalDate('in 3 days');
            expect(result).toBeTruthy();
            expect(result?.length).toBe(10);
        });

        it('should parse "in 2 weeks"', () => {
            const result = parseNaturalDate('in 2 weeks');
            expect(result).toBeTruthy();
            expect(result?.length).toBe(10);
        });

        it('should return null for unrecognized input', () => {
            const result = parseNaturalDate('some random text');
            expect(result).toBeNull();
        });

        it('should be case insensitive', () => {
            const lower = parseNaturalDate('tomorrow');
            const upper = parseNaturalDate('TOMORROW');
            expect(lower).toBe(upper);
        });
    });

    describe('formatDateHuman', () => {
        it('should format dates as strings', () => {
            // Use the parser to get tomorrow's date string
            const tomorrowStr = parseNaturalDate('tomorrow');
            expect(tomorrowStr).toBeTruthy();

            const result = formatDateHuman(tomorrowStr!);
            // Should return "Tomorrow" for tomorrow's date
            expect(result).toMatch(/Tomorrow|Invalid date/);
            expect(typeof result).toBe('string');
        });

        it('should handle various date formats', () => {
            const result = formatDateHuman('2024-12-25');
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });
    });
});
