import { SQLiteDatabase } from 'expo-sqlite';

export interface Migration {
    version: number;
    name: string;
    sql: string[]; // Array of SQL statements to execute
}

// Ordered list of migrations
// New migrations should always be added to the end with an incremented version number
const MIGRATIONS: Migration[] = [
    {
        version: 1,
        name: 'initial_schema',
        sql: [
            `CREATE TABLE IF NOT EXISTS pieces (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        composer TEXT,
        instrument TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
            `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        piece_id TEXT NOT NULL,
        start_time INTEGER NOT NULL,
        end_time INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        notes TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (piece_id) REFERENCES pieces(id) ON DELETE CASCADE
      )`,
            `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`,
            `CREATE TABLE IF NOT EXISTS scheduled_sessions (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        focus TEXT,
        is_completed INTEGER DEFAULT 0,
        notification_id TEXT,
        piece_ids TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
            `CREATE TABLE IF NOT EXISTS plans (
        id TEXT PRIMARY KEY,
        target_date TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )`,
            `CREATE INDEX IF NOT EXISTS idx_sessions_piece_id ON sessions(piece_id)`,
            `CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time)`,
            `CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_date ON scheduled_sessions(date)`,
            `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        display_name TEXT,
        role TEXT DEFAULT 'student',
        avatar_url TEXT,
        xp INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
            `CREATE TABLE IF NOT EXISTS relationships (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (teacher_id) REFERENCES users(id),
        FOREIGN KEY (student_id) REFERENCES users(id)
      )`,
            `CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        piece_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        status TEXT DEFAULT 'assigned',
        feedback TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (teacher_id) REFERENCES users(id),
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (piece_id) REFERENCES pieces(id)
      )`
        ]
    },
    {
        version: 2,
        name: 'add_piece_metadata',
        sql: [
            // We use safe alter statements.
            // Note: SQLite doesn't support IF NOT EXISTS in ALTER TABLE well in all versions, 
            // but our migration runner checks version number, so these should only run once.
            // However, since we are moving from a "manual check" system, we might be running 
            // this on a DB that *already* has these columns but no _migrations table.
            // So we need to be careful. The runner logic below handles this "bootstrapping".

            `ALTER TABLE pieces ADD COLUMN is_current INTEGER DEFAULT 0`,
            `ALTER TABLE pieces ADD COLUMN ai_context TEXT`,
            `ALTER TABLE pieces ADD COLUMN user_id TEXT`
        ]
    },
    {
        version: 3,
        name: 'add_piece_stats_and_type',
        sql: [
            `ALTER TABLE pieces ADD COLUMN is_completed INTEGER DEFAULT 0`,
            `ALTER TABLE pieces ADD COLUMN difficulty_rating INTEGER DEFAULT 0`,
            `ALTER TABLE pieces ADD COLUMN difficulty_stats TEXT`,
            `ALTER TABLE pieces ADD COLUMN type TEXT DEFAULT 'piece' NOT NULL`
        ]
    },
    {
        version: 4,
        name: 'update_scheduled_sessions',
        sql: [
            `ALTER TABLE scheduled_sessions ADD COLUMN start_time TEXT`,
            `ALTER TABLE scheduled_sessions ADD COLUMN type TEXT`
        ]
    },
    {
        version: 5,
        name: 'add_recordings_table',
        sql: [
            `CREATE TABLE IF NOT EXISTS recordings (
        id TEXT PRIMARY KEY,
        piece_id TEXT NOT NULL,
        uri TEXT NOT NULL,
        type TEXT NOT NULL,
        duration INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (piece_id) REFERENCES pieces(id) ON DELETE CASCADE
      )`,
            `CREATE INDEX IF NOT EXISTS idx_recordings_piece_id ON recordings(piece_id)`
        ]
    }, // Formatting touch
    {
        version: 6,
        name: 'implement_para_schema',
        sql: [
            // 1. Inbox Items
            `CREATE TABLE IF NOT EXISTS inbox_items (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                content TEXT NOT NULL,
                is_processed INTEGER DEFAULT 0,
                ai_context TEXT,
                created_at INTEGER NOT NULL
            )`,

            // 2. Projects
            `CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'active' NOT NULL,
                deadline TEXT,
                outcome TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                completed_at INTEGER
            )`,

            // 3. Areas
            `CREATE TABLE IF NOT EXISTS areas (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                title TEXT NOT NULL,
                description TEXT,
                health_score INTEGER DEFAULT 0,
                last_reviewed_at INTEGER,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )`,

            // 4. Resources
            `CREATE TABLE IF NOT EXISTS resources (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                title TEXT NOT NULL,
                parent_id TEXT,
                is_folder INTEGER DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )`,

            // 5. Tasks
            `CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                title TEXT NOT NULL,
                notes TEXT,
                parent_type TEXT,
                parent_id TEXT,
                status TEXT DEFAULT 'todo' NOT NULL,
                is_completed INTEGER DEFAULT 0,
                due_date TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                completed_at INTEGER
            )`,

            // 6. Notes
            `CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                title TEXT NOT NULL,
                content TEXT DEFAULT '',
                parent_type TEXT NOT NULL,
                parent_id TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )`,

            // 7. Focus Sessions
            `CREATE TABLE IF NOT EXISTS focus_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                project_id TEXT,
                focus_area TEXT,
                duration_minutes INTEGER NOT NULL,
                date TEXT NOT NULL,
                notes TEXT,
                completed_at INTEGER NOT NULL
            )`,

            // 8. Recreate Scheduled Sessions (Significant changes)
            // Rename old if exists for safety, or just drop. We'll drop for V1 cleanliness.
            `DROP TABLE IF EXISTS scheduled_sessions`,
            `CREATE TABLE scheduled_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                date TEXT NOT NULL,
                start_time TEXT,
                duration_minutes INTEGER NOT NULL,
                focus TEXT DEFAULT 'General Focus',
                notes TEXT,
                project_ids TEXT,
                is_completed INTEGER DEFAULT 0,
                notification_id TEXT,
                type TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )`,

            // 9. Update Settings to include user_id
            `DROP TABLE IF EXISTS settings`,
            // Dropping settings resets prefs, but acceptable for this major migration
            `CREATE TABLE settings (
                key TEXT PRIMARY KEY,
                user_id TEXT,
                value TEXT NOT NULL
            )`
        ]
    },
    {
        version: 7,
        name: 'implement_collaboration_schema',
        sql: [
            `CREATE TABLE IF NOT EXISTS shared_areas (
                id TEXT PRIMARY KEY,
                area_id TEXT NOT NULL,
                owner_user_id TEXT NOT NULL,
                shared_with_user_ids TEXT NOT NULL,
                permissions TEXT DEFAULT 'read_write',
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS para_templates (
                id TEXT PRIMARY KEY,
                creator_user_id TEXT,
                name TEXT NOT NULL,
                description TEXT,
                template_data TEXT NOT NULL,
                is_public INTEGER DEFAULT 0,
                downloads_count INTEGER DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )`
        ]
    },
    {
        version: 8,
        name: 'add_missing_updated_at',
        sql: [
            `ALTER TABLE inbox_items ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0`,
            `ALTER TABLE focus_sessions ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0`
        ]
    },
    {
        version: 7,
        name: 'add_inbox_task_management_fields',
        sql: [
            // Add new task management fields to inbox_items
            `ALTER TABLE inbox_items ADD COLUMN type TEXT DEFAULT 'todo'`,
            `ALTER TABLE inbox_items ADD COLUMN media_url TEXT`,
            `ALTER TABLE inbox_items ADD COLUMN is_completed INTEGER DEFAULT 0`,
            `ALTER TABLE inbox_items ADD COLUMN due_date TEXT`,
            `ALTER TABLE inbox_items ADD COLUMN due_time TEXT`,
            `ALTER TABLE inbox_items ADD COLUMN priority TEXT DEFAULT 'medium'`,
            `ALTER TABLE inbox_items ADD COLUMN checklist_items TEXT`,
            `ALTER TABLE inbox_items ADD COLUMN progress INTEGER DEFAULT 0`,
            `ALTER TABLE inbox_items ADD COLUMN progress_target INTEGER`,
            `ALTER TABLE inbox_items ADD COLUMN project_id TEXT`,
            `ALTER TABLE inbox_items ADD COLUMN area_id TEXT`,
            `ALTER TABLE inbox_items ADD COLUMN resource_id TEXT`,
            `ALTER TABLE inbox_items ADD COLUMN completed_at INTEGER`
        ]
    }
];

export async function runMigrations(db: any) {
    // Expo SQLite (legacy vs next) handling. 
    // We assume the db object passed has `execSync` (next) or we use `transaction`.
    // To be safe and support standard expo-sqlite patterns:

    try {
        // 1. Create migrations table if not exists
        db.execSync(`
      CREATE TABLE IF NOT EXISTS _migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at INTEGER NOT NULL
      )
    `);

        // 2. Get current version
        const result = db.getAllSync('SELECT MAX(version) as currentVersion FROM _migrations');
        const currentVersion = result[0]?.currentVersion || 0;

        console.log(`[DB] Current DB version: ${currentVersion}`);

        // 3. Run pending migrations
        for (const migration of MIGRATIONS) {
            if (migration.version > currentVersion) {
                console.log(`[DB] Running migration ${migration.version}: ${migration.name}`);

                // Execute steps
                // For existing apps that might have partial schema but no migration table:
                // We catch column exists errors and ignore them to be safe during this transition.

                for (const statement of migration.sql) {
                    try {
                        db.execSync(statement);
                    } catch (e: any) {
                        if (e.message?.includes('duplicate column name')) {
                            // Safe to ignore if we are "catching up" a legacy DB
                            console.log(`[DB] Column already exists, skipping: ${statement.substring(0, 30)}...`);
                        } else if (e.message?.includes('already exists')) {
                            console.log(`[DB] Table/Index already exists, skipping: ${statement.substring(0, 30)}...`);
                        } else {
                            throw e;
                        }
                    }
                }

                // Record migration
                db.runSync(
                    'INSERT INTO _migrations (version, name, applied_at) VALUES (?, ?, ?)',
                    [migration.version, migration.name, Date.now()]
                );
            }
        }

        console.log('[DB] Migrations up to date.');

    } catch (error) {
        console.error('[DB] Migration failed:', error);
        throw error;
    }
}
