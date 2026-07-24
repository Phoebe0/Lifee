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
  },
  {
    version: 2,
    sql: `
      INSERT OR IGNORE INTO categories
        (id, type, name, icon, color, sort_order, sync_status, created_at, updated_at)
      VALUES
        ('default-expense-food', 'expense', '餐饮', 'food', 'brand', 10, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('default-expense-shopping', 'expense', '购物', 'shopping', 'brand', 20, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('default-expense-transport', 'expense', '交通', 'transport', 'brand', 30, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('default-expense-home', 'expense', '居住', 'home', 'brand', 40, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('default-expense-entertainment', 'expense', '娱乐', 'entertainment', 'brand', 50, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('default-expense-medical', 'expense', '医疗', 'medical', 'brand', 60, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('default-expense-education', 'expense', '教育', 'education', 'brand', 70, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('default-expense-other', 'expense', '其他', 'more', 'brand', 80, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('default-income-salary', 'income', '工资', 'salary', 'brand', 10, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('default-income-bonus', 'income', '奖金', 'bonus', 'brand', 20, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('default-income-investment', 'income', '理财', 'investment', 'brand', 30, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('default-income-part-time', 'income', '兼职', 'part-time', 'brand', 40, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('default-income-red-packet', 'income', '红包', 'red-packet', 'brand', 50, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('default-income-reimbursement', 'income', '报销', 'reimbursement', 'brand', 60, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('default-income-refund', 'income', '退款', 'refund', 'brand', 70, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('default-income-other', 'income', '其他', 'more', 'brand', 80, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `
  },
  {
    version: 3,
    sql: `
      UPDATE categories
      SET color = 'brand', updated_at = CURRENT_TIMESTAMP
      WHERE color = '#4F5795' AND id LIKE 'default-%';
    `
  },
  {
    version: 4,
    sql: `
      CREATE INDEX IF NOT EXISTS transactions_pagination_idx
      ON transactions(occurred_at DESC, created_at DESC, id DESC)
      WHERE deleted_at IS NULL;
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
