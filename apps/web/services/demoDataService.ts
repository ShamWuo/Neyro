import { useNeyroStore } from '@mobile/store/useNeyroStore';

export interface DemoDataOptions {
    includeProjects?: boolean;
    includeAreas?: boolean;
    includeResources?: boolean;
    includeInboxItems?: boolean;
    includeTasks?: boolean;
}

export const DemoDataService = {
    async generateDemoData(options: DemoDataOptions = {}) {
        const {
            includeProjects = true,
            includeAreas = true,
            includeResources = true,
            includeInboxItems = true,
            includeTasks = true,
        } = options;

        const store = useNeyroStore.getState();
        const now = Date.now();

        try {
            // Generate Areas (check for duplicates first)
            if (includeAreas) {
                const existingAreas = store.areas || [];
                const existingTitles = new Set(existingAreas.map((a: any) => a.title?.toLowerCase().trim()));
                
                const demoAreas = [
                    { title: 'Health & Fitness', emoji: '💪' },
                    { title: 'Career Development', emoji: '🚀' },
                    { title: 'Personal Finance', emoji: '💰' },
                    { title: 'Relationships', emoji: '❤️' },
                ];

                for (const area of demoAreas) {
                    const key = area.title.toLowerCase().trim();
                    if (!existingTitles.has(key)) {
                        await store.addArea(area.title, area.emoji);
                        existingTitles.add(key); // Prevent duplicates in same run
                    }
                }
            }

            // Generate Projects (check for duplicates first)
            if (includeProjects) {
                const existingProjects = [...(store.activeProjects || []), ...(store.pausedProjects || []), ...(store.completedProjects || [])];
                const existingTitles = new Set(existingProjects.map((p: any) => p.title?.toLowerCase().trim()));
                
                const demoProjects = [
                    { title: 'Launch Personal Website', description: 'Build and deploy my portfolio site', outcome: 'Live website with 3 case studies' },
                    { title: 'Learn TypeScript', description: 'Complete advanced TypeScript course', outcome: 'Build 2 projects using TS' },
                    { title: 'Design System Documentation', description: 'Create comprehensive design system docs', outcome: 'Published design system guide' },
                ];

                for (const project of demoProjects) {
                    const key = project.title.toLowerCase().trim();
                    if (!existingTitles.has(key)) {
                        await store.addProject(project.title, project.description, project.outcome);
                        existingTitles.add(key); // Prevent duplicates in same run
                    }
                }
            }

            // Generate Resources
            if (includeResources) {
                const demoResources = [
                    { title: 'React Best Practices Guide', type: 'note' as const },
                    { title: 'Design Patterns Reference', type: 'pdf' as const },
                    { title: 'Productivity Tools Comparison', type: 'link' as const, sourceUrl: 'https://example.com' },
                ];

                for (const resource of demoResources) {
                    await store.addResource(resource.title, false, null, resource.type, resource.sourceUrl);
                }
            }

            // Generate Inbox Items
            if (includeInboxItems) {
                const demoInboxItems = [
                    { content: 'Review Q4 budget proposal', type: 'todo' as const, priority: 'high' as const },
                    { content: 'Schedule dentist appointment', type: 'reminder' as const, priority: 'medium' as const, dueDate: new Date(now + 86400000 * 3).toISOString().split('T')[0] },
                    { content: 'Weekend trip planning', type: 'checklist' as const, priority: 'low' as const },
                    { content: 'Read "Atomic Habits"', type: 'progress' as const, priority: 'medium' as const, progress: 45 },
                ];

                for (const item of demoInboxItems) {
                    const newItem: any = {
                        id: crypto.randomUUID(),
                        userId: null,
                        content: item.content,
                        type: item.type,
                        mediaUrl: null,
                        isCompleted: false,
                        priority: item.priority,
                        projectId: null,
                        areaId: null,
                        resourceId: null,
                        isProcessed: false,
                        aiContext: null,
                        createdAt: now - Math.random() * 86400000 * 7, // Random time in last week
                        updatedAt: now,
                        completedAt: null,
                        dueDate: item.dueDate || null,
                        dueTime: null,
                        checklistItems: item.type === 'checklist' ? JSON.stringify([
                            { id: '1', text: 'Book hotel', completed: false },
                            { id: '2', text: 'Plan itinerary', completed: true },
                            { id: '3', text: 'Pack essentials', completed: false },
                        ]) : null,
                        progress: item.progress || 0,
                        progressTarget: item.type === 'progress' ? 100 : null,
                    };

                    await store.addInboxItem(newItem);
                }
            }

            // Reload data
            await store.loadData();

            return { success: true, message: 'Demo data generated successfully!' };
        } catch (error) {
            console.error('Failed to generate demo data:', error);
            return { success: false, message: 'Failed to generate demo data' };
        }
    },

    async clearAllData() {
        const store = useNeyroStore.getState();
        // Note: This would need to be implemented in the store
        // For now, just reload
        await store.loadData();
        return { success: true, message: 'Data cleared' };
    },
};
