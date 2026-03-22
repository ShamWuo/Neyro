import { ClassifierService } from '../classifierService';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Define a global mock object for the model
const mockGenerateContent = jest.fn();
const mockModel = {
    generateContent: mockGenerateContent
};

// Mock setup
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel)
    }))
}));

describe('ClassifierService', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Set Dummy Key for Test
        process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'TEST_KEY';
    });

    it('should correctly parse a valid JSON response from Gemini', async () => {
        const mockResponseText = JSON.stringify({
            intent: 'task',
            summary: 'Buy milk',
            urgency: 'high',
            suggestedDestination: 'area',
            confidence: 0.9,
            reasoning: 'It is a grocery item',
            actionable: true
        });

        // Use the retrieved mock, which is now available from the module scope
        mockGenerateContent.mockResolvedValueOnce({
            response: {
                text: () => mockResponseText
            }
        });

        const result = await ClassifierService.classifyContent('Buy milk', [], []);

        expect(result).not.toBeNull();
        expect(result?.intent).toBe('task');
        expect(result?.summary).toBe('Buy milk');
        expect(result?.urgency).toBe('high');
    });

    it('should handle invalid JSON gracefully', async () => {
        mockGenerateContent.mockResolvedValueOnce({
            response: {
                text: () => 'I am not JSON'
            }
        });

        const result = await ClassifierService.classifyContent('Buy milk', [], []);

        expect(result).toBeNull();
    });

    it('should return null if API fails', async () => {
        mockGenerateContent.mockRejectedValueOnce(new Error('API Error'));

        const result = await ClassifierService.classifyContent('Buy milk', [], []);

        expect(result).toBeNull();
    });

    it('should return null for empty content', async () => {
        const result = await ClassifierService.classifyContent('', [], []);
        expect(result).toBeNull();
        expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('should support action chunking for compound inputs', async () => {
        const mockResponseText = JSON.stringify({
            intent: 'task',
            summary: 'Buy milk',
            urgency: 'medium',
            suggestedDestination: 'area',
            confidence: 0.85,
            reasoning: 'Multiple distinct tasks detected, split into 3 actions',
            actionable: true,
            actions: [
                {
                    summary: 'Call mom',
                    urgency: 'medium',
                    suggestedDestination: 'area'
                },
                {
                    summary: 'Finish essay',
                    urgency: 'high',
                    suggestedDestination: 'project'
                }
            ]
        });

        mockGenerateContent.mockResolvedValueOnce({
            response: {
                text: () => mockResponseText
            }
        });

        const result = await ClassifierService.classifyContent('Buy milk, call mom, and finish essay', [], []);

        expect(result).not.toBeNull();
        expect(result?.actions).toBeDefined();
        expect(result?.actions?.length).toBe(2);
        expect(result?.reasoning).toContain('split');
    });

    it('should include confidence and reasoning in results', async () => {
        const mockResponseText = JSON.stringify({
            intent: 'task',
            summary: 'Call mom',
            urgency: 'medium',
            suggestedDestination: 'area',
            confidence: 0.92,
            reasoning: 'Mentions calling a person, likely family-related',
            actionable: true
        });

        mockGenerateContent.mockResolvedValueOnce({
            response: {
                text: () => mockResponseText
            }
        });

        const result = await ClassifierService.classifyContent('Call mom tomorrow', [], []);

        expect(result).not.toBeNull();
        expect(result?.confidence).toBe(0.92);
        expect(result?.reasoning).toContain('family');
    });
});
