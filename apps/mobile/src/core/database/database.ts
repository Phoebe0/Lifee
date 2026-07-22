import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite'

let databasePromise: Promise<SQLiteDatabase> | null = null

export function getDatabase() {
  databasePromise ??= openDatabaseAsync('lifee.db')
  return databasePromise
}

const migrations = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY NOT NULL,
        applied_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        version INTEGER NOT NULL DEFAULT 1,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        deleted_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT,
        category_id TEXT,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        amount_cent INTEGER NOT NULL CHECK (amount_cent > 0),
        currency TEXT NOT NULL DEFAULT 'CNY',
        occurred_at TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        version INTEGER NOT NULL DEFAULT 1,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        deleted_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );

      CREATE INDEX IF NOT EXISTS transactions_occurred_idx
      ON transactions(occurred_at DESC)
      WHERE deleted_at IS NULL;

      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL CHECK (operation IN ('upsert', 'delete')),
        payload TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        next_attempt_at TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sync_metadata (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `
  }
] as const

export async function initializeDatabase() {
  const db = await getDatabase()
  await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;')
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );
  `)

  const applied = await db.getAllAsync<{ version: number }>('SELECT version FROM schema_migrations')
  const appliedVersions = new Set(applied.map(item => item.version))

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) continue
    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.sql)
      await db.runAsync(
        'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        migration.version,
        new Date().toISOString()
      )
    })
  }
}
