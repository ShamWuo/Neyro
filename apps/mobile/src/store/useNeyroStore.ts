import { create } from 'zustand';
import {
    inboxItems, projects, areas, resources, tasks, notes,
    InboxItem, Project, Area, Resource, Task, Note
} from '../database/schema';
import { eq, and, not, desc } from 'drizzle-orm';
import { db } from '../database/client';
import * as schema from '../database/schema';
import { ClassifierService } from '../services/classifierService';
import * as Crypto from 'expo-crypto';

interface NeyroState {
    // Data
    inbox: InboxItem[];
    activeProjects: Project[];
    pausedProjects: Project[];
    completedProjects: Project[];
    areas: Area[];
    resources: Resource[];
    notes: Note[];
    tasks: Task[]; // Added tasks to state

    // Loading States
    isLoading: boolean;

    // UI State
    captureVisible: boolean;
    setCaptureVisible: (visible: boolean) => void;

    // Actions
    loadData: () => Promise<void>;
    addToInbox: (content: string, userTier?: 'free' | 'musician' | 'virtuoso', type?: 'text' | 'image' | 'voice' | 'checklist', mediaUrl?: string) => Promise<void>;
    addInboxItem: (item: InboxItem) => Promise<void>;
    deleteInboxItem: (id: string) => Promise<void>;
    updateAreaScore: (id: string, score: number) => Promise<void>;
    classifyItem: (itemId: string, destination: 'project' | 'area' | 'resource' | 'archive', targetId?: string) => Promise<void>;
    updateInboxItem: (id: string, updates: Partial<InboxItem>) => void;
    addProject: (title: string, description?: string, outcome?: string, areaId?: string) => Promise<void>;
    updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
    deleteProject: (id: string) => Promise<boolean>;
    addResource: (title: string, isFolder?: boolean, parentId?: string | null, type?: 'link' | 'pdf' | 'image' | 'audio' | 'note', sourceUrl?: string | null) => Promise<void>;
    updateResource: (id: string, updates: Partial<Resource>) => Promise<void>;
    deleteResource: (id: string) => Promise<void>;
    saveNote: (parentId: string, parentType: 'resource' | 'project' | 'area', content: string, title: string) => Promise<void>;
    addTask: (title: string, parentId: string, parentType: 'project' | 'area') => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    addArea: (title: string, emoji?: string) => Promise<void>;
    deleteArea: (id: string) => Promise<void>;
}

export const useNeyroStore = create<NeyroState>((set, get) => ({
    inbox: [],
    activeProjects: [],
    pausedProjects: [],
    completedProjects: [],
    areas: [],
    resources: [],
    notes: [],
    tasks: [], // Initial state
    isLoading: false,

    // UI State Implementation
    captureVisible: false,
    setCaptureVisible: (visible) => set({ captureVisible: visible }),

    loadData: async () => {
        set({ isLoading: true });
        try {
            // Load all inbox items (tasks can stay in inbox even if processed)
            const inbox = await db.select().from(inboxItems).orderBy(desc(inboxItems.createdAt));
            const allProjects = await db.select().from(projects);
            const allAreas = await db.select().from(areas);
            const allResources = await db.select().from(resources);
            const allNotes = await db.select().from(notes);
            const allTasks = await db.select().from(tasks); // Fetch tasks

            // CRITICAL: Deduplicate areas by title (keep most recent)
            const areasMap = new Map<string, Area>();
            allAreas.forEach((area: Area) => {
                const key = area.title?.toLowerCase().trim() || '';
                if (key) {
                    const existing = areasMap.get(key);
                    if (!existing || (area.updatedAt > existing.updatedAt)) {
                        areasMap.set(key, area);
                    }
                }
            });
            const deduplicatedAreas = Array.from(areasMap.values());

            // CRITICAL: Deduplicate projects by title (keep most recent)
            const projectsMap = new Map<string, Project>();
            allProjects.forEach((project: Project) => {
                const key = project.title?.toLowerCase().trim() || '';
                if (key) {
                    const existing = projectsMap.get(key);
                    if (!existing || (project.updatedAt > existing.updatedAt)) {
                        projectsMap.set(key, project);
                    }
                }
            });
            const deduplicatedProjects = Array.from(projectsMap.values());

            // Delete duplicates from database (async, don't block)
            const duplicateAreaIds = allAreas
                .filter((a: Area) => {
                    const key = a.title?.toLowerCase().trim() || '';
                    return key && areasMap.get(key)?.id !== a.id;
                })
                .map((a: Area) => a.id);

            const duplicateProjectIds = allProjects
                .filter((p: Project) => {
                    const key = p.title?.toLowerCase().trim() || '';
                    return key && projectsMap.get(key)?.id !== p.id;
                })
                .map((p: Project) => p.id);

            if (duplicateAreaIds.length > 0) {
                console.warn(`Removing ${duplicateAreaIds.length} duplicate areas`);
                Promise.all(duplicateAreaIds.map((id: string) => db.delete(areas).where(eq(areas.id, id)))).catch(console.error);
            }

            if (duplicateProjectIds.length > 0) {
                console.warn(`Removing ${duplicateProjectIds.length} duplicate projects`);
                Promise.all(duplicateProjectIds.map((id: string) => db.delete(projects).where(eq(projects.id, id)))).catch(console.error);
            }

            set({
                inbox,
                activeProjects: deduplicatedProjects.filter((p: Project) => p.status === 'active'),
                pausedProjects: deduplicatedProjects.filter((p: Project) => p.status === 'paused'),
                completedProjects: deduplicatedProjects.filter((p: Project) => p.status === 'completed'),
                areas: deduplicatedAreas,
                resources: allResources,
                notes: allNotes,
                tasks: allTasks // Set tasks
            });
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            set({ isLoading: false });
        }
    },

    addToInbox: async (content, userTier = 'free', type = 'text', mediaUrl) => {
        try {
            // Sanitize input
            const sanitizedContent = content.trim().slice(0, 5000); // Max 5000 chars

            if (!sanitizedContent && !mediaUrl) {
                console.warn('[Store] Empty content, skipping inbox add');
                return;
            }

            const newItem = {
                id: Crypto.randomUUID(),
                content: sanitizedContent || (type === 'image' ? 'Image Capture' : 'Voice Memo'),
                userId: null, // Initial local state
                type: type || 'text', // Added type
                mediaUrl: mediaUrl || null, // Added mediaUrl
                isCompleted: false,
                priority: 'medium',
                dueDate: null,
                dueTime: null,
                checklistItems: null,
                progress: 0,
                progressTarget: null,
                projectId: null,
                areaId: null,
                resourceId: null,
                isProcessed: false,
                aiContext: null, // Initial state
                createdAt: Date.now(),
                updatedAt: Date.now(),
                completedAt: null,
            };
            // Optimistic update
            set(state => ({ inbox: [newItem, ...state.inbox] }));

            await db.insert(inboxItems).values(newItem);

            // Note: Auto-processing with AI has been removed
            // Users can manually process items through the inbox interface
        } catch (e) {
            console.error("Failed to add to inbox", e);
        }
    },

    addInboxItem: async (item) => {
        try {
            // Ensure all required fields are set with defaults
            const completeItem = {
                id: item.id,
                userId: item.userId || null,
                content: item.content,
                type: item.type || 'todo',
                mediaUrl: item.mediaUrl || null,
                isCompleted: item.isCompleted ?? false,
                priority: item.priority || 'medium',
                dueDate: item.dueDate || null,
                dueTime: item.dueTime || null,
                checklistItems: item.checklistItems || null,
                progress: item.progress ?? 0,
                progressTarget: item.progressTarget || null,
                projectId: item.projectId || null,
                areaId: item.areaId || null,
                resourceId: item.resourceId || null,
                isProcessed: item.isProcessed ?? false,
                aiContext: item.aiContext || null,
                createdAt: item.createdAt || Date.now(),
                updatedAt: item.updatedAt || Date.now(),
                completedAt: item.completedAt || null,
            };

            // Optimistic update
            set(state => ({ inbox: [completeItem, ...state.inbox] }));

            await db.insert(inboxItems).values(completeItem);
        } catch (e) {
            console.error("Failed to add inbox item", e);
            // Revert optimistic update on error
            set(state => ({ inbox: state.inbox.filter(i => i.id !== item.id) }));
            throw e;
        }
    },

    updateInboxItem: async (id, updates) => {
        try {
            // Optimistic update
            set(state => ({
                inbox: state.inbox.map(item => item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item)
            }));

            // Update DB
            await db.update(inboxItems)
                .set({ ...updates, updatedAt: Date.now() })
                .where(eq(inboxItems.id, id));
        } catch (e) {
            console.error("Failed to update inbox item", e);
        }
    },

    deleteInboxItem: async (id) => {
        try {
            set(state => ({ inbox: state.inbox.filter(i => i.id !== id) }));
            await db.delete(inboxItems).where(eq(inboxItems.id, id));
        } catch (e) {
            console.error("Failed to delete inbox item", e);
        }
    },

    updateAreaScore: async (id, score) => {
        try {
            const areaIndex = get().areas.findIndex(a => a.id === id);
            if (areaIndex === -1) return;

            const updatedAreas = [...get().areas];
            updatedAreas[areaIndex] = { ...updatedAreas[areaIndex], healthScore: score, lastReviewedAt: Date.now() };
            set({ areas: updatedAreas });

            await db.update(areas).set({ healthScore: score, lastReviewedAt: Date.now() }).where(eq(areas.id, id));
        } catch (e) {
            console.error("Failed to update area score", e);
        }
    },

    classifyItem: async (itemId, destination, targetId) => {
        try {
            const item = get().inbox.find(i => i.id === itemId);
            if (!item) return;

            // Optimistic deletion from inbox
            set(state => ({ inbox: state.inbox.filter(i => i.id !== itemId) }));

            if (destination === 'project') {
                if (targetId) {
                    // Add as task to existing project
                    const title = item.content.split('\n')[0];
                    await db.insert(tasks).values({
                        id: Crypto.randomUUID(),
                        title: title,
                        notes: item.content,
                        parentType: 'project',
                        parentId: targetId,
                        status: 'todo',
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    });
                } else {
                    // Create new project from inbox item
                    const title = item.content.split('\n')[0];
                    const description = item.content.split('\n').slice(1).join('\n').trim() || undefined;
                    await get().addProject(title, description);
                }
            } else if (destination === 'area') {
                if (targetId) {
                    // Add as task to existing area
                    const title = item.content.split('\n')[0];
                    await db.insert(tasks).values({
                        id: Crypto.randomUUID(),
                        title: title,
                        notes: item.content,
                        parentType: 'area',
                        parentId: targetId,
                        status: 'todo',
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    });
                } else {
                    // Create new area from inbox item
                    const title = item.content.split('\n')[0];
                    await get().addArea(title);
                }
            } else if (destination === 'resource') {
                if (targetId) {
                    // Add as note to existing resource
                    const title = item.content.split('\n')[0];
                    await db.insert(notes).values({
                        id: Crypto.randomUUID(),
                        title: title,
                        content: item.content,
                        parentType: 'resource',
                        parentId: targetId,
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    });
                } else {
                    // Create new resource from inbox item
                    const title = item.content.split('\n')[0];
                    const content = item.content.split('\n').slice(1).join('\n').trim() || item.content;
                    // Determine resource type based on content
                    const contentLower = item.content.toLowerCase();
                    let resourceType: 'link' | 'pdf' | 'image' | 'audio' | 'note' = 'note';
                    let sourceUrl: string | null = null;
                    if (contentLower.includes('http://') || contentLower.includes('https://')) {
                        resourceType = 'link';
                        // Extract URL if present
                        const urlMatch = item.content.match(/https?:\/\/[^\s]+/i);
                        if (urlMatch) sourceUrl = urlMatch[0];
                    } else if (contentLower.includes('.pdf') || contentLower.includes('pdf')) {
                        resourceType = 'pdf';
                    } else if (contentLower.includes('image') || contentLower.match(/\.(jpg|jpeg|png|gif)/i)) {
                        resourceType = 'image';
                    } else if (contentLower.includes('audio') || contentLower.match(/\.(mp3|wav|ogg)/i)) {
                        resourceType = 'audio';
                    }

                    // Create resource directly to get the ID
                    const newResourceId = Crypto.randomUUID();
                    const newResource: Resource = {
                        id: newResourceId,
                        userId: null,
                        title: title.trim(),
                        parentId: null,
                        isFolder: false,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        type: resourceType,
                        summary: null,
                        sourceUrl: sourceUrl,
                        aiTags: null,
                        isArchived: false,
                        areaId: null
                    };

                    // Optimistic update
                    set(state => ({ resources: [...state.resources, newResource] }));

                    // Insert to DB
                    await db.insert(resources).values(newResource);

                    // Create a note within the resource to store the full content
                    if (content && content !== title) {
                        await db.insert(notes).values({
                            id: Crypto.randomUUID(),
                            title: title,
                            content: content,
                            parentType: 'resource',
                            parentId: newResourceId,
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        });
                    }
                }
            } else if (destination === 'archive') {
                // Archive: just delete from inbox (no need to create anything)
                // The item is already removed from inbox optimistically above
                // and will be deleted from DB below
            }

            // Mark/Delete from Inbox
            await db.delete(inboxItems).where(eq(inboxItems.id, itemId));
        } catch (e) {
            console.error("Failed to classify item", e);
        }
    },

    addProject: async (title, description, outcome, areaId) => {
        try {
            const { activeProjects } = get();
            if (activeProjects.length >= 7) {
                console.warn("Max projects limit reached (7). Action blocked.");
                return;
            }

            const newProject: Project = {
                id: Crypto.randomUUID(),
                userId: null,
                title: title.trim(),
                description: description?.trim() || null,
                status: 'active',
                deadline: null,
                outcome: outcome?.trim() || null,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                completedAt: null,
                areaId: areaId || null
            };

            // Optimistic update
            set(state => ({ activeProjects: [...state.activeProjects, newProject] }));

            // Insert to DB
            await db.insert(projects).values(newProject);
        } catch (e) {
            console.error("Failed to add project", e);
        }
    },

    updateProject: async (id, updates) => {
        try {
            const state = get();
            const { activeProjects, pausedProjects, completedProjects } = state;

            // Find which list contains the project
            let project: Project | undefined;
            let sourceList: 'active' | 'paused' | 'completed' | null = null;

            if (activeProjects.find(p => p.id === id)) {
                project = activeProjects.find(p => p.id === id);
                sourceList = 'active';
            } else if (pausedProjects.find(p => p.id === id)) {
                project = pausedProjects.find(p => p.id === id);
                sourceList = 'paused';
            } else if (completedProjects.find(p => p.id === id)) {
                project = completedProjects.find(p => p.id === id);
                sourceList = 'completed';
            }

            if (!project || !sourceList) return;

            const updatedProject = { ...project, ...updates, updatedAt: Date.now() };

            // If status changed, move between lists
            if (updates.status && updates.status !== project.status) {
                set({
                    activeProjects: sourceList === 'active'
                        ? activeProjects.filter(p => p.id !== id)
                        : updates.status === 'active'
                            ? [...activeProjects, updatedProject]
                            : activeProjects,
                    pausedProjects: sourceList === 'paused'
                        ? pausedProjects.filter(p => p.id !== id)
                        : updates.status === 'paused'
                            ? [...pausedProjects, updatedProject]
                            : pausedProjects,
                    completedProjects: sourceList === 'completed'
                        ? completedProjects.filter(p => p.id !== id)
                        : updates.status === 'completed'
                            ? [...completedProjects, updatedProject]
                            : completedProjects,
                });
            } else {
                // Update in place
                set({
                    activeProjects: sourceList === 'active'
                        ? activeProjects.map(p => p.id === id ? updatedProject : p)
                        : activeProjects,
                    pausedProjects: sourceList === 'paused'
                        ? pausedProjects.map(p => p.id === id ? updatedProject : p)
                        : pausedProjects,
                    completedProjects: sourceList === 'completed'
                        ? completedProjects.map(p => p.id === id ? updatedProject : p)
                        : completedProjects,
                });
            }

            await db.update(projects).set(updates).where(eq(projects.id, id));
        } catch (e) {
            console.error("Failed to update project", e);
        }
    },

    deleteProject: async (id) => {
        try {
            set(state => ({
                activeProjects: state.activeProjects.filter(p => p.id !== id),
                pausedProjects: state.pausedProjects.filter(p => p.id !== id),
                completedProjects: state.completedProjects.filter(p => p.id !== id)
            }));
            await db.delete(projects).where(eq(projects.id, id));
            // Cascade delete tasks and notes
            await db.delete(tasks).where(and(eq(tasks.parentId, id), eq(tasks.parentType, 'project')));
            await db.delete(notes).where(and(eq(notes.parentId, id), eq(notes.parentType, 'project')));
            return true;
        } catch (e) {
            console.error("Failed to delete project", e);
            return false;
        }
    },

    addResource: async (title: string, isFolder: boolean = false, parentId: string | null = null, type: 'link' | 'pdf' | 'image' | 'audio' | 'note' = 'link', sourceUrl: string | null = null, areaId: string | null = null) => {
        try {
            const newResource: Resource = {
                id: Crypto.randomUUID(),
                userId: null,
                title: title.trim(),
                parentId: parentId,
                isFolder: isFolder,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                type: isFolder ? 'note' : type,
                summary: null,
                sourceUrl: sourceUrl,
                aiTags: null,
                isArchived: false,
                areaId: areaId
            };

            set(state => ({ resources: [...state.resources, newResource] }));
            await db.insert(resources).values(newResource);
        } catch (e) {
            console.error("Failed to add resource", e);
        }
    },

    // ... (updateResource remains same, just need ensuring addArea is updated)

    addArea: async (title: string, emoji: string = '🏔️', parentId: string | null = null) => {
        try {
            const newArea: Area = {
                id: Crypto.randomUUID(),
                userId: null,
                title: title.trim(),
                description: null,
                healthScore: 0,
                lastReviewedAt: null,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                parentId: parentId
            };

            set(state => ({ areas: [...state.areas, newArea] }));
            await db.insert(areas).values(newArea);
        } catch (e) {
            console.error("Failed to add area", e);
        }
    },

    updateResource: async (id: string, updates: Partial<Resource>) => {
        try {
            const state = get();
            const resource = state.resources.find(r => r.id === id);
            if (!resource) return;

            const updatedResource = { ...resource, ...updates, updatedAt: Date.now() };

            set(state => ({
                resources: state.resources.map(r => r.id === id ? updatedResource : r)
            }));

            await db.update(resources).set({ ...updates, updatedAt: Date.now() }).where(eq(resources.id, id));
        } catch (e) {
            console.error("Failed to update resource", e);
        }
    },

    deleteResource: async (id: string) => {
        try {
            set(state => ({ resources: state.resources.filter(r => r.id !== id) }));
            await db.delete(resources).where(eq(resources.id, id));
            // Also delete associated note if any
            await db.delete(notes).where(and(eq(notes.parentId, id), eq(notes.parentType, 'resource')));
        } catch (e) {
            console.error("Failed to delete resource", e);
        }
    },

    saveNote: async (parentId: string, parentType: 'resource' | 'project' | 'area', content: string, title: string) => {
        try {
            // Check if note exists
            const existingNote = get().notes.find(n => n.parentId === parentId && n.parentType === parentType);
            const now = Date.now();

            if (existingNote) {
                // Update
                const updatedNote = { ...existingNote, content, title, updatedAt: now };
                set(state => ({
                    notes: state.notes.map(n => n.id === existingNote.id ? updatedNote : n)
                }));
                await db.update(notes)
                    .set({ content, title, updatedAt: now })
                    .where(eq(notes.id, existingNote.id));
            } else {
                // Create
                const newNote: Note = {
                    id: Crypto.randomUUID(),
                    userId: null,
                    parentId,
                    parentType,
                    title, // Redundant but required by schema
                    content,
                    createdAt: now,
                    updatedAt: now
                };
                set(state => ({ notes: [...state.notes, newNote] }));
                await db.insert(notes).values(newNote);
            }
        } catch (e) {
            console.error("Failed to save note", e);
        }
    },

    addTask: async (title: string, parentId: string, parentType: 'project' | 'area') => {
        try {
            const newTask: Task = {
                id: Crypto.randomUUID(),
                userId: null,
                title: title.trim(),
                notes: null,
                parentType,
                parentId,
                status: 'todo',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                completedAt: null,
                dueDate: null,
                isCompleted: false,
                preparedContent: null,
                preparationStatus: 'idle', // Default state for agentic workflow
                resourceLinks: null
            };

            set(state => ({ tasks: [...state.tasks, newTask] }));
            await db.insert(tasks).values(newTask);
        } catch (e) {
            console.error("Failed to add task", e);
        }
    },

    toggleTask: async (id: string) => {
        try {
            const task = await db.select().from(tasks).where(eq(tasks.id, id)).get();
            if (!task) return;

            const newStatus = task.status === 'done' ? 'todo' : 'done';
            const isCompleted = newStatus === 'done';
            await db.update(tasks).set({ status: newStatus, isCompleted, updatedAt: Date.now() }).where(eq(tasks.id, id));

            set(state => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, status: newStatus, isCompleted } : t)
            }));
        } catch (e) {
            console.error("Failed to toggle task", e);
        }
    },

    deleteTask: async (id: string) => {
        try {
            set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
            await db.delete(tasks).where(eq(tasks.id, id));
        } catch (e) {
            console.error("Failed to delete task", e);
        }
    },



    deleteArea: async (id: string) => {
        try {
            set(state => ({ areas: state.areas.filter(a => a.id !== id) }));
            await db.delete(areas).where(eq(areas.id, id));
            // Cascade delete tasks and notes
            await db.delete(tasks).where(and(eq(tasks.parentId, id), eq(tasks.parentType, 'area')));
            await db.delete(notes).where(and(eq(notes.parentId, id), eq(notes.parentType, 'area')));
        } catch (e) {
            console.error("Failed to delete area", e);
        }
    }

}));
