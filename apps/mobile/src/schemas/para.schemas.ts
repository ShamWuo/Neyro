import { z } from 'zod';

/**
 * Zod schemas for PARA entities
 * Provides runtime validation and type inference
 */

// ============================================
// INBOX ITEM SCHEMA
// ============================================
export const InboxItemSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().nullable(),
    content: z.string().min(1).max(5000), // Enforce 5000 char limit
    isProcessed: z.boolean().default(false),
    aiContext: z.string().nullable(),
    createdAt: z.number().int().positive(),
});

export type InboxItemValidated = z.infer<typeof InboxItemSchema>;

// ============================================
// PROJECT SCHEMA
// ============================================
export const ProjectSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().nullable(),
    title: z.string().min(1).max(200),
    description: z.string().max(1000).nullable(),
    status: z.enum(['active', 'paused', 'completed']).default('active'),
    deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(), // YYYY-MM-DD
    outcome: z.string().max(500).nullable(),
    createdAt: z.number().int().positive(),
    updatedAt: z.number().int().positive(),
    completedAt: z.number().int().positive().nullable(),
});

export type ProjectValidated = z.infer<typeof ProjectSchema>;

// Partial schema for updates (all fields optional except id)
export const ProjectUpdateSchema = ProjectSchema.partial().required({ id: true });

// ============================================
// AREA SCHEMA
// ============================================
export const AreaSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().nullable(),
    title: z.string().min(1).max(200),
    description: z.string().max(1000).nullable(),
    healthScore: z.number().int().min(0).max(5).default(0),
    lastReviewedAt: z.number().int().positive().nullable(),
    createdAt: z.number().int().positive(),
    updatedAt: z.number().int().positive(),
});

export type AreaValidated = z.infer<typeof AreaSchema>;

// ============================================
// TASK SCHEMA
// ============================================
export const TaskSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().nullable(),
    title: z.string().min(1).max(300),
    notes: z.string().max(2000).nullable(),
    parentType: z.enum(['project', 'area']).nullable(),
    parentId: z.string().uuid().nullable(),
    status: z.enum(['todo', 'done']).default('todo'),
    isCompleted: z.boolean().default(false),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    createdAt: z.number().int().positive(),
    updatedAt: z.number().int().positive(),
    completedAt: z.number().int().positive().nullable(),
});

export type TaskValidated = z.infer<typeof TaskSchema>;

// ============================================
// NOTE SCHEMA
// ============================================
export const NoteSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().nullable(),
    title: z.string().min(1).max(200),
    content: z.string().max(50000).default(''), // 50KB limit
    parentType: z.enum(['project', 'area', 'resource']),
    parentId: z.string().uuid(),
    createdAt: z.number().int().positive(),
    updatedAt: z.number().int().positive(),
});

export type NoteValidated = z.infer<typeof NoteSchema>;

// ============================================
// RESOURCE SCHEMA
// ============================================
export const ResourceSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().nullable(),
    title: z.string().min(1).max(200),
    parentId: z.string().uuid().nullable(),
    isFolder: z.boolean().default(false),
    createdAt: z.number().int().positive(),
    updatedAt: z.number().int().positive(),
});

export type ResourceValidated = z.infer<typeof ResourceSchema>;

// ============================================
// AI CLASSIFICATION SCHEMA
// ============================================
export const ClassificationResultSchema = z.object({
    intent: z.enum(['task', 'project', 'note', 'event', 'reminder']),
    summary: z.string().min(1).max(500),
    urgency: z.enum(['high', 'medium', 'low']),
    suggestedDestination: z.enum(['project', 'area', 'resource', 'calendar']),
    suggestedTargetId: z.string().uuid().optional(),
    suggestedTargetName: z.string().max(200).optional(),
    confidence: z.number().min(0).max(1), // 0-1 range
    reasoning: z.string().max(1000),
    actionable: z.boolean(),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    requiresReview: z.boolean().default(false), // NEW: Low confidence flag
    actions: z.array(z.object({
        summary: z.string().min(1).max(500),
        urgency: z.enum(['high', 'medium', 'low']),
        suggestedDestination: z.enum(['project', 'area', 'resource', 'calendar']),
        suggestedTargetId: z.string().uuid().optional(),
        suggestedTargetName: z.string().max(200).optional(),
        dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    })).optional(),
});

export type ClassificationResultValidated = z.infer<typeof ClassificationResultSchema>;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Safely parse unknown data with Zod schema
 * Returns typed data or throws with detailed error
 */
export function validateData<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context?: string
): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = `Validation failed${context ? ` for ${context}` : ''}: ${error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
            throw new Error(errorMessage);
        }
        throw error;
    }
}

/**
 * Safely parse with fallback (returns null on error)
 */
export function safeValidateData<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): T | null {
    const result = schema.safeParse(data);
    return result.success ? result.data : null;
}

/**
 * Validate array of items
 */
export function validateArray<T>(
    schema: z.ZodSchema<T>,
    data: unknown[],
    context?: string
): T[] {
    return data.map((item, index) =>
        validateData(schema, item, `${context}[${index}]`)
    );
}
