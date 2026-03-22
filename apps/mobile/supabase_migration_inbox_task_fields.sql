-- ============================================================================
-- SUPABASE MIGRATION: Add Task Management Fields to inbox_items
-- Version: 7
-- Description: Adds support for todos, reminders, checklists, progress bars, and PARA linking
-- ============================================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Add new task management fields to inbox_items table
DO $$ 
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='inbox_items' AND column_name='type') THEN
        ALTER TABLE inbox_items ADD COLUMN type text DEFAULT 'todo';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='inbox_items' AND column_name='media_url') THEN
        ALTER TABLE inbox_items ADD COLUMN media_url text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='inbox_items' AND column_name='is_completed') THEN
        ALTER TABLE inbox_items ADD COLUMN is_completed boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='inbox_items' AND column_name='due_date') THEN
        ALTER TABLE inbox_items ADD COLUMN due_date text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='inbox_items' AND column_name='due_time') THEN
        ALTER TABLE inbox_items ADD COLUMN due_time text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='inbox_items' AND column_name='priority') THEN
        ALTER TABLE inbox_items ADD COLUMN priority text DEFAULT 'medium';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='inbox_items' AND column_name='checklist_items') THEN
        ALTER TABLE inbox_items ADD COLUMN checklist_items text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='inbox_items' AND column_name='progress') THEN
        ALTER TABLE inbox_items ADD COLUMN progress integer DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='inbox_items' AND column_name='progress_target') THEN
        ALTER TABLE inbox_items ADD COLUMN progress_target integer;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='inbox_items' AND column_name='project_id') THEN
        ALTER TABLE inbox_items ADD COLUMN project_id text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='inbox_items' AND column_name='area_id') THEN
        ALTER TABLE inbox_items ADD COLUMN area_id text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='inbox_items' AND column_name='resource_id') THEN
        ALTER TABLE inbox_items ADD COLUMN resource_id text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='inbox_items' AND column_name='completed_at') THEN
        ALTER TABLE inbox_items ADD COLUMN completed_at bigint;
    END IF;
    
    -- Ensure updated_at column exists (from previous migration)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='inbox_items' AND column_name='updated_at') THEN
        ALTER TABLE inbox_items ADD COLUMN updated_at bigint;
    END IF;
END $$;

-- Add indexes for better query performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_inbox_items_type ON inbox_items(type);
CREATE INDEX IF NOT EXISTS idx_inbox_items_is_completed ON inbox_items(is_completed);
CREATE INDEX IF NOT EXISTS idx_inbox_items_due_date ON inbox_items(due_date);
CREATE INDEX IF NOT EXISTS idx_inbox_items_project_id ON inbox_items(project_id);
CREATE INDEX IF NOT EXISTS idx_inbox_items_area_id ON inbox_items(area_id);
CREATE INDEX IF NOT EXISTS idx_inbox_items_resource_id ON inbox_items(resource_id);
CREATE INDEX IF NOT EXISTS idx_inbox_items_priority ON inbox_items(priority);

-- Update existing rows to have default values
UPDATE inbox_items 
SET 
    type = COALESCE(type, 'text'),
    is_completed = COALESCE(is_completed, false),
    priority = COALESCE(priority, 'medium'),
    progress = COALESCE(progress, 0),
    updated_at = COALESCE(updated_at, created_at)
WHERE 
    type IS NULL 
    OR is_completed IS NULL 
    OR priority IS NULL 
    OR progress IS NULL
    OR updated_at IS NULL;
