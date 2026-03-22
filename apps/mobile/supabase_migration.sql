-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- 1. Areas
CREATE TABLE IF NOT EXISTS areas (
	id text PRIMARY KEY NOT NULL,
	title text NOT NULL,
	description text,
	health_score integer DEFAULT 0,
	last_reviewed_at bigint,
	created_at bigint NOT NULL,
	updated_at bigint NOT NULL
);
ALTER TABLE areas ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own areas" ON areas;
CREATE POLICY "Users can manage their own areas" ON areas FOR ALL USING (auth.uid() = user_id);

-- 2. Focus Sessions
CREATE TABLE IF NOT EXISTS focus_sessions (
	id text PRIMARY KEY NOT NULL,
	project_id text,
	focus_area text,
	duration_minutes integer NOT NULL,
	date text NOT NULL,
	notes text,
	completed_at bigint NOT NULL
);
ALTER TABLE focus_sessions ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON focus_sessions;
CREATE POLICY "Users can manage their own sessions" ON focus_sessions FOR ALL USING (auth.uid() = user_id);

-- 3. Inbox Items
CREATE TABLE IF NOT EXISTS inbox_items (
	id text PRIMARY KEY NOT NULL,
	content text NOT NULL,
	is_processed boolean DEFAULT false,
	ai_context text,
	created_at bigint NOT NULL
);
ALTER TABLE inbox_items ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own inbox" ON inbox_items;
CREATE POLICY "Users can manage their own inbox" ON inbox_items FOR ALL USING (auth.uid() = user_id);

-- 4. Notes
CREATE TABLE IF NOT EXISTS notes (
	id text PRIMARY KEY NOT NULL,
	title text NOT NULL,
	content text DEFAULT '',
	parent_type text NOT NULL,
	parent_id text NOT NULL,
	created_at bigint NOT NULL,
	updated_at bigint NOT NULL
);
ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own notes" ON notes;
CREATE POLICY "Users can manage their own notes" ON notes FOR ALL USING (auth.uid() = user_id);

-- 5. Projects
CREATE TABLE IF NOT EXISTS projects (
	id text PRIMARY KEY NOT NULL,
	title text NOT NULL,
	description text,
	status text DEFAULT 'active' NOT NULL,
	deadline text,
	outcome text,
	created_at bigint NOT NULL,
	updated_at bigint NOT NULL,
	completed_at bigint
);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own projects" ON projects;
CREATE POLICY "Users can manage their own projects" ON projects FOR ALL USING (auth.uid() = user_id);

-- 6. Resources
CREATE TABLE IF NOT EXISTS resources (
	id text PRIMARY KEY NOT NULL,
	title text NOT NULL,
	parent_id text,
	is_folder boolean DEFAULT false,
	created_at bigint NOT NULL,
	updated_at bigint NOT NULL
);
ALTER TABLE resources ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own resources" ON resources;
CREATE POLICY "Users can manage their own resources" ON resources FOR ALL USING (auth.uid() = user_id);

-- 7. Scheduled Sessions
CREATE TABLE IF NOT EXISTS scheduled_sessions (
	id text PRIMARY KEY NOT NULL,
	date text NOT NULL,
	start_time text,
	duration_minutes integer NOT NULL,
	focus text DEFAULT 'General Focus',
	notes text,
	project_ids text,
	is_completed boolean DEFAULT false,
	notification_id text,
	type text,
	created_at bigint NOT NULL,
	updated_at bigint NOT NULL
);
ALTER TABLE scheduled_sessions ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE scheduled_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own schedule" ON scheduled_sessions;
CREATE POLICY "Users can manage their own schedule" ON scheduled_sessions FOR ALL USING (auth.uid() = user_id);

-- 8. Settings
CREATE TABLE IF NOT EXISTS settings (
	key text PRIMARY KEY NOT NULL,
	value text NOT NULL
);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own settings" ON settings;
CREATE POLICY "Users can manage their own settings" ON settings FOR ALL USING (auth.uid() = user_id);

-- 9. Tasks
CREATE TABLE IF NOT EXISTS tasks (
	id text PRIMARY KEY NOT NULL,
	title text NOT NULL,
	notes text,
	parent_type text,
	parent_id text,
	status text DEFAULT 'todo' NOT NULL,
	is_completed boolean DEFAULT false,
	due_date text,
	created_at bigint NOT NULL,
	updated_at bigint NOT NULL,
	completed_at bigint
);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;
CREATE POLICY "Users can manage their own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
