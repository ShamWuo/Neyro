import { db } from '../database/client';
import { projects, tasks, notes, resources } from '../database/schema';
import { and, eq, lt } from 'drizzle-orm';
import { Logger } from '../utils/logger';

/**
 * Maintenance Service for database cleanup and optimization
 * Handles soft-delete purging and database health
 */

export class MaintenanceService {
    /**
     * Purge archived/completed items older than specified days
     * @param olderThanDays Number of days to keep archived items (default: 90)
     * @returns Number of items purged
     */
    static async purgeArchive(olderThanDays: number = 90): Promise<number> {
        const cutoffDate = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
        let totalPurged = 0;

        try {
            // Delete completed projects older than cutoff
            const completedProjects = await db.delete(projects)
                .where(and(
                    eq(projects.status, 'completed'),
                    lt(projects.completedAt!, cutoffDate)
                ))
                .returning({ id: projects.id });

            totalPurged += completedProjects.length;
            Logger.info(`Purged ${completedProjects.length} completed projects`);

            // Delete completed tasks older than cutoff
            const completedTasks = await db.delete(tasks)
                .where(and(
                    eq(tasks.isCompleted, true),
                    lt(tasks.completedAt!, cutoffDate)
                ))
                .returning({ id: tasks.id });

            totalPurged += completedTasks.length;
            Logger.info(`Purged ${completedTasks.length} completed tasks`);

            // Optional: Delete orphaned notes (notes whose parent no longer exists)
            // This is more complex and might require a separate method

            Logger.info(`Total items purged: ${totalPurged} (older than ${olderThanDays} days)`);
            return totalPurged;
        } catch (error) {
            Logger.error('Failed to purge archive', error as Error);
            throw error;
        }
    }

    /**
     * Get database statistics
     */
    static async getStats(): Promise<{
        totalProjects: number;
        activeProjects: number;
        completedProjects: number;
        totalTasks: number;
        completedTasks: number;
        totalNotes: number;
        totalResources: number;
    }> {
        try {
            const allProjects = await db.select().from(projects);
            const allTasks = await db.select().from(tasks);
            const allNotes = await db.select().from(notes);
            const allResources = await db.select().from(resources);

            return {
                totalProjects: allProjects.length,
                activeProjects: allProjects.filter((p: any) => p.status === 'active').length,
                completedProjects: allProjects.filter((p: any) => p.status === 'completed').length,
                totalTasks: allTasks.length,
                completedTasks: allTasks.filter((t: any) => t.isCompleted).length,
                totalNotes: allNotes.length,
                totalResources: allResources.length,
            };
        } catch (error) {
            Logger.error('Failed to get database stats', error as Error);
            throw error;
        }
    }

    /**
     * Clean up orphaned notes (notes whose parent entity no longer exists)
     */
    static async cleanupOrphanedNotes(): Promise<number> {
        try {
            const allNotes = await db.select().from(notes);
            let orphanedCount = 0;

            for (const note of allNotes) {
                let parentExists = false;

                if (note.parentType === 'project') {
                    const parent = await db.select().from(projects).where(eq(projects.id, note.parentId));
                    parentExists = parent.length > 0;
                } else if (note.parentType === 'resource') {
                    const parent = await db.select().from(resources).where(eq(resources.id, note.parentId));
                    parentExists = parent.length > 0;
                }

                if (!parentExists) {
                    await db.delete(notes).where(eq(notes.id, note.id));
                    orphanedCount++;
                }
            }

            Logger.info(`Cleaned up ${orphanedCount} orphaned notes`);
            return orphanedCount;
        } catch (error) {
            Logger.error('Failed to cleanup orphaned notes', error as Error);
            throw error;
        }
    }

    /**
     * Optimize database (vacuum, analyze)
     * Note: SQLite-specific operations
     */
    static async optimize(): Promise<void> {
        try {
            // SQLite VACUUM command to rebuild the database file
            // This reclaims unused space and defragments
            await db.run('VACUUM');
            Logger.info('Database optimized (VACUUM completed)');
        } catch (error) {
            Logger.error('Failed to optimize database', error as Error);
            throw error;
        }
    }
}
