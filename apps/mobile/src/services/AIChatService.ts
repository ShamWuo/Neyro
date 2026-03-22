import { GoogleGenerativeAI } from '@google/generative-ai';
import { Audio } from 'expo-av';
import { subscriptionService } from './SubscriptionService';
import { safeParseJSON } from '../utils/json';
import { ClassifierService } from './classifierService';
import { useNeyroStore } from '../store/useNeyroStore';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define tool schemas for the AI
const tools = [
    {
        name: "addToInbox",
        description: "Add a quick thought, task, or idea to the inbox.",
        parameters: {
            type: "OBJECT",
            properties: {
                content: { type: "STRING", description: "The content to add" }
            },
            required: ["content"]
        }
    },
    {
        name: "createProject",
        description: "Create a new active project.",
        parameters: {
            type: "OBJECT",
            properties: {
                title: { type: "STRING", description: "Project title" },
                outcome: { type: "STRING", description: "Desired outcome (optional)" }
            },
            required: ["title"]
        }
    },
    {
        name: "getSchedule",
        description: "Get the user's schedule/plan.",
        parameters: {
            type: "OBJECT",
            properties: {
                date: { type: "STRING", description: "Date in YYYY-MM-DD format (optional)" }
            }
        }
    },
    {
        name: "startFocusSession",
        description: "Start a focus timer for a specific task.",
        parameters: {
            type: "OBJECT",
            properties: {
                task: { type: "STRING", description: "What to focus on" },
                duration: { type: "NUMBER", description: "Duration in minutes" }
            },
            required: ["task"]
        }
    }
];

export class AIChatService {
    private model: any;
    private chatSession: any;

    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        this.chatSession = this.model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are Neyro, a ruthless but helpful productivity assistant based on GTD and PARA. Help me capture, organize, and execute. Be concise." }]
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am Neyro. I will help you find clarity and get things done. What's on your mind?" }]
                }
            ],
        });
    }

    async sendMessage(text: string, userId: string): Promise<{ text: string, action?: any }> {
        // Check Subscription
        const access = await subscriptionService.checkAiAccess(userId);
        if (!access.allowed) {
            return { text: access.reason || "Subscription limit reached. Please upgrade." };
        }

        // System instruction to force JSON for actions
        const prompt = `
        ${text}

        If the user wants to perform an action (add to inbox, create project, start timer, check schedule), return a JSON object ONLY, like:
        {"tool": "addToInbox", "args": {"content": "..."}}
        
        Available tools: ${JSON.stringify(tools.map(t => t.name))}

        If no action is needed, just reply normally with text.
        Do NOT wrap JSON in markdown blocks.
        `;

        try {
            const result = await this.chatSession.sendMessage(prompt);
            const responseText = result.response.text();

            // Try to parse JSON
            const parseResult = safeParseJSON(responseText);
            if (parseResult.success) {
                const action = parseResult.data;
                if (action.tool && action.args) {
                    await subscriptionService.incrementAiUsage(userId);
                    return { text: "Processing...", action };
                }
            }

            await subscriptionService.incrementAiUsage(userId);
            return { text: responseText };
        } catch (error) {
            console.error("AI Chat Error:", error);
            return { text: "Sorry, I had trouble connecting to the AI." };
        }
    }

    private recording: Audio.Recording | null = null;

    async startRecording(): Promise<void> {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status === 'granted') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });

                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                this.recording = recording;
                console.log('Recording started');
            } else {
                throw new Error('Microphone permission not granted');
            }
        } catch (err) {
            console.error('Failed to start recording', err);
            throw err;
        }
    }

    async stopRecording(): Promise<string | null> {
        if (!this.recording) return null;

        try {
            await this.recording.stopAndUnloadAsync();
            const uri = this.recording.getURI();
            this.recording = null; // Reset
            return uri;
        } catch (err) {
            console.error('Failed to stop recording', err);
            return null;
        }
    }

    async processAudio(uri: string, userId: string): Promise<{ text: string, action?: any }> {
        const access = await subscriptionService.checkAiAccess(userId);
        if (!access.allowed) {
            return { text: access.reason || "Subscription limit reached. Please upgrade." };
        }
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const base64Audio = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    if (typeof reader.result === 'string') {
                        const base64 = reader.result.split(',')[1];
                        resolve(base64);
                    } else {
                        reject(new Error('Failed to convert blob to base64 string'));
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            const parts = [
                {
                    inlineData: {
                        mimeType: "audio/m4a",
                        data: base64Audio
                    }
                },
                { text: "Listen to this request. If it's an action (add to inbox, create project, etc.), return JSON: {\"tool\": \"...\", \"args\": {...}}. Otherwise reply with text." }
            ];

            const result = await this.model.generateContent(parts);
            const responseText = result.response.text();

            const parseResult = safeParseJSON(responseText);
            if (parseResult.success) {
                const action = parseResult.data;
                if (action.tool && action.args) {
                    await subscriptionService.incrementAiUsage(userId);
                    return { text: "Processing voice command...", action };
                }
            }

            await subscriptionService.incrementAiUsage(userId);
            return { text: responseText };

        } catch (error) {
            console.error("AI Voice Error:", error);
            return { text: "Sorry, I couldn't understand the audio." };
        }
    }
}

export const aiChat = new AIChatService();
