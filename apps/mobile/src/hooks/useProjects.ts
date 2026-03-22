import { useQuery } from '@tanstack/react-query';
import { db } from '../database/client';
import { projects } from '../database/schema';
import { desc } from 'drizzle-orm';
import type { Project } from '../types';

export function useProjects() {
    const { data: allProjects = [], isLoading, error, refetch } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            try {
                const result = await db.select().from(projects).orderBy(desc(projects.updatedAt));
                return result as Project[];
            } catch (e) {
                console.error("Failed to fetch projects", e);
                return [];
            }
        }
    });

    return {
        projects: allProjects,
        isLoading,
        error,
        refetch
    };
}
