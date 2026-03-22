import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ============================================
// INBOX ITEMS (Task Management System)
// ============================================
export const inboxItems = sqliteTable('inbox_items', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  content: text('content').notNull(),
  type: text('type').default('todo'), // 'todo' | 'reminder' | 'checklist' | 'progress' | 'note' | 'text' | 'image' | 'voice'
  mediaUrl: text('mediaUrl'), // URL or local path for media
  
  // Task Management Fields
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  dueDate: text('due_date'), // ISO Date string for reminders
  dueTime: text('due_time'), // HH:MM for reminders
  priority: text('priority').default('medium'), // 'low' | 'medium' | 'high' | 'urgent'
  
  // Checklist Support (JSON array of { id, text, completed })
  checklistItems: text('checklist_items'), // JSON: [{ id: string, text: string, completed: boolean }]
  
  // Progress Bar Support
  progress: integer('progress').default(0), // 0-100
  progressTarget: integer('progress_target'), // Optional target value
  
  // PARA Links (items can be linked to Projects/Areas/Resources but stay in inbox)
  projectId: text('project_id'), // Link to project
  areaId: text('area_id'), // Link to area
  resourceId: text('resource_id'), // Link to resource
  
  // Legacy/Processing Fields
  isProcessed: integer('is_processed', { mode: 'boolean' }).default(false), // For items that need PARA classification
  aiContext: text('ai_context'), // JSON string of AI analysis
  
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  completedAt: integer('completed_at', { mode: 'number' }),
});

// ============================================
// USERS
// ============================================
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // Supabase UUID
  email: text('email').notNull(),
  subscriptionTier: text('subscription_tier').default('free'), // 'free' | 'musician' | 'virtuoso'
  aiUsageCount: integer('ai_usage_count').default(0),
  aiLimitReset: integer('ai_limit_reset', { mode: 'number' }),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  lastSeenAt: integer('last_seen_at', { mode: 'number' }),
  // Profile Fields
  displayName: text('display_name'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  isDiscoverable: integer('is_discoverable', { mode: 'boolean' }).default(true),
  lastLocation: text('last_location'), // JSON { lat, lng, timestamp }
});

// ============================================
// PROJECTS (Active Limit: 7)
// ============================================
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('active'), // 'active' | 'paused' | 'completed'
  deadline: text('deadline'), // ISO Date string
  outcome: text('outcome'), // "What does 'done' look like?"
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  completedAt: integer('completed_at', { mode: 'number' }),
  areaId: text('area_id'), // Link to 'areas' table
});

// ============================================
// AREAS (Life Responsibilities)
// ============================================
export const areas = sqliteTable('areas', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  title: text('title').notNull(),
  description: text('description'),
  parentId: text('parent_id'), // For nested sub-areas
  healthScore: integer('health_score').default(0), // 1-5, 0 = unset
  lastReviewedAt: integer('last_reviewed_at', { mode: 'number' }),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
});

// ============================================
// RESOURCES (Reference Material)
// ============================================
export const resources = sqliteTable('resources', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  title: text('title').notNull(),
  parentId: text('parent_id'), // For nested folders
  areaId: text('area_id'), // For pinning to an Area
  isFolder: integer('is_folder', { mode: 'boolean' }).default(false),
  // KB / Vault Fields
  type: text('type').default('link'), // 'link' | 'pdf' | 'image' | 'audio' | 'note'
  summary: text('summary'), // AI generated TL;DR
  sourceUrl: text('source_url'),
  aiTags: text('ai_tags'), // JSON array of strings for topic clustering
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
});

// ============================================
// TASKS (Actionable items inside Projects/Areas)
// ============================================
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  title: text('title').notNull(),
  notes: text('notes'),
  parentType: text('parent_type'), // 'project' | 'area' | null (if formerly inbox but not yet assigned?) strictly should be assigned
  parentId: text('parent_id'),
  status: text('status').notNull().default('todo'), // 'todo' | 'done'
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  dueDate: text('due_date'),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  completedAt: integer('completed_at', { mode: 'number' }),

  // Agentic Workflow Fields
  preparedContent: text('prepared_content'), // JSON: { summary, draft, research_notes }
  preparationStatus: text('preparation_status').default('pending'), // 'pending' | 'preparing' | 'ready' | 'failed'
  resourceLinks: text('resource_links'), // JSON array of URLs or Resource IDs
});

// ============================================
// NOTES (Standard notes, can live in Projects, Areas, Resources)
// ============================================
export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  title: text('title').notNull(),
  content: text('content').default(''),
  parentType: text('parent_type').notNull(), // 'project' | 'area' | 'resource'
  parentId: text('parent_id').notNull(),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
});

// ============================================
// FOCUS SESSIONS (Time Tracking)
// ============================================
export const focusSessions = sqliteTable('focus_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  projectId: text('project_id'), // Optional, can be unbound focus
  focusArea: text('focus_area'), // 'Deep Work', 'Admin', etc.
  durationMinutes: integer('duration_minutes').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  notes: text('notes'),
  completedAt: integer('completed_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
});



// ============================================
// SCHEDULED SESSIONS (Planner)
// ============================================
export const scheduledSessions = sqliteTable('scheduled_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  date: text('date').notNull(), // YYYY-MM-DD
  startTime: text('start_time'), // HH:MM AM/PM
  durationMinutes: integer('duration_minutes').notNull(),
  focus: text('focus').default('General Focus'),
  notes: text('notes'),
  projectIds: text('project_ids'), // JSON string of project IDs
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  notificationId: text('notification_id'),
  type: text('type'), // 'deep_work', 'shallow_work', etc
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),

  // Predictive Analytics Fields
  energyLevel: text('energy_level').default('medium'), // 'high' | 'medium' | 'low'
  isPrimeTime: integer('is_prime_time', { mode: 'boolean' }).default(false),
});


// ============================================
// CLASSIFICATION HISTORY (For Adaptive AI)
// ============================================
export const classificationHistory = sqliteTable('classification_history', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  originalContent: text('original_content').notNull(),
  aiSuggestion: text('ai_suggestion').notNull(), // JSON string of ClassificationResult
  userAction: text('user_action').notNull().default('accepted'), // 'accepted' | 'corrected' | 'rejected'
  correctionType: text('correction_type'), // 'destination' | 'project' | 'area' | 'other' if corrected
  finalDestination: text('final_destination'),
  finalTargetId: text('final_target_id'),
  timestamp: integer('timestamp', { mode: 'number' }).notNull(),
});

// ============================================
// USER LEARNING PREFERENCES
// ============================================
export const userPreferences = sqliteTable('user_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  type: text('type').notNull(), // 'style_mirror' | 'negative_constraint' | 'auto_sort_rule'
  pattern: text('pattern').notNull(), // The trigger pattern (e.g. regex or keyword)
  action: text('action').notNull(), // What to do (JSON)
  confidence: integer('confidence').default(1), // 1-100 score of how sure we are
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
});

// ============================================
// SETTINGS (App Config & User Prefs)
// ============================================
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  userId: text('user_id'),
  value: text('value').notNull(),
});

// ============================================
// ENERGY PREFERENCES (Predictive Analytics)
// ============================================
export const energyPreferences = sqliteTable('energy_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  primeTimeStart: text('prime_time_start').notNull(), // HH:MM (24h)
  primeTimeEnd: text('prime_time_end').notNull(), // HH:MM (24h)
  lowEnergyStart: text('low_energy_start'), // Optional slump time
  lowEnergyEnd: text('low_energy_end'),
  workDays: text('work_days').default('["Mon","Tue","Wed","Thu","Fri"]'), // JSON array
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
});

// ============================================
// SHARED AREAS (Collaboration)
// ============================================
export const sharedAreas = sqliteTable('shared_areas', {
  id: text('id').primaryKey(),
  areaId: text('area_id').notNull(),
  ownerUserId: text('owner_user_id').notNull(),
  sharedWithUserIds: text('shared_with_user_ids').notNull(), // JSON array of user IDs
  permissions: text('permissions').default('read_write'), // 'read_only' | 'read_write' | 'admin'
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
});

// ============================================
// PARA TEMPLATES (Community Sharing)
// ============================================
export const paraTemplates = sqliteTable('para_templates', {
  id: text('id').primaryKey(),
  creatorUserId: text('creator_user_id'),
  name: text('name').notNull(),
  description: text('description'),
  templateData: text('template_data').notNull(), // JSON structure of the template
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  downloadsCount: integer('downloads_count').default(0),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
});

// ============================================
// SOCIAL CONNECTIONS (Network)
// ============================================
export const socialConnections = sqliteTable('social_connections', {
  id: text('id').primaryKey(),
  followerId: text('follower_id').notNull(),
  followingId: text('following_id').notNull(),
  status: text('status').default('pending'), // 'pending' | 'accepted' | 'blocked'
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
});

// ============================================
// COLLABORATION PERMISSIONS
// ============================================
export const collaborationPermissions = sqliteTable('collaboration_permissions', {
  id: text('id').primaryKey(),
  granterId: text('granter_id').notNull(), // User GIVING control/access
  granteeId: text('grantee_id').notNull(), // User RECEIVING control/access
  type: text('type').notNull(), // 'screen_time_control' | 'location_view' | 'project_view'
  status: text('status').default('pending'), // 'pending' | 'active' | 'revoked'
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
});



// ============================================
// EXPORTS
// ============================================

export type InboxItem = typeof inboxItems.$inferSelect;
export type NewInboxItem = typeof inboxItems.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Area = typeof areas.$inferSelect;
export type NewArea = typeof areas.$inferInsert;

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export type ClassificationHistory = typeof classificationHistory.$inferSelect;
export type NewClassificationHistory = typeof classificationHistory.$inferInsert;

export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;

export type EnergyPreference = typeof energyPreferences.$inferSelect;
export type NewEnergyPreference = typeof energyPreferences.$inferInsert;

export type SharedArea = typeof sharedAreas.$inferSelect;
export type NewSharedArea = typeof sharedAreas.$inferInsert;

export type ParaTemplate = typeof paraTemplates.$inferSelect;
export type NewParaTemplate = typeof paraTemplates.$inferInsert;

export type SocialConnection = typeof socialConnections.$inferSelect;
export type NewSocialConnection = typeof socialConnections.$inferInsert;

export type CollaborationPermission = typeof collaborationPermissions.$inferSelect;
export type NewCollaborationPermission = typeof collaborationPermissions.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
