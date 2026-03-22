import { db } from '../database/client';
import { tasks, Task } from '../database/schema';
import { eq } from 'drizzle-orm';
import { WebSearchService } from './webSearchService';

export const AgenticService = {
    /**
     * Main entry point to "prepare" a task in the background.
     * Determines what kind of preparation is needed based on task content.
     */
    prepareTask: async (taskId: string, taskTitle: string, userIntent?: string) => {
        try {
            console.log(`[Agentic] Preparing task: ${taskTitle}`);

            // 1. Update status to preparing
            await db.update(tasks)
                .set({ preparationStatus: 'preparing' })
                .where(eq(tasks.id, taskId));

            // 2. Determine needs (Mock logic for now)
            const needsResearch = taskTitle.toLowerCase().includes('research') || taskTitle.toLowerCase().includes('learn');
            const needsDraft = taskTitle.toLowerCase().includes('email') || taskTitle.toLowerCase().includes('write');

            let resultData: any = {
                timestamp: Date.now()
            };

            // 3. Execute Workflows
            if (needsResearch) {
                const searchRes = await WebSearchService.searchAndSummarize(taskTitle);
                resultData.research = searchRes;
            }

            if (needsDraft) {
                // Mock draft generation
                resultData.draft = {
                    subject: `Draft: ${taskTitle}`,
                    body: "Hi [Name],\n\nI'm writing to discuss...\n\nBest,\n[User]"
                };
            }

            // 4. Save results and mark ready
            await db.update(tasks)
                .set({
                    preparationStatus: 'ready',
                    preparedContent: JSON.stringify(resultData)
                })
                .where(eq(tasks.id, taskId));

            console.log(`[Agentic] Task ${taskId} is ready.`);

        } catch (error) {
            console.error('[Agentic] Preparation failed:', error);
            await db.update(tasks)
                .set({ preparationStatus: 'failed' })
                .where(eq(tasks.id, taskId));
        }
    }
};
