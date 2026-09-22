import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 1;

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        connector_kind TEXT NOT NULL,
        base_url TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS offline_commands (
        id TEXT PRIMARY KEY NOT NULL,
        connection_id TEXT NOT NULL,
        command_type TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        next_attempt_at TEXT NOT NULL,
        last_error TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY(connection_id) REFERENCES connections(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_offline_commands_retry
        ON offline_commands(next_attempt_at, created_at);

      CREATE INDEX IF NOT EXISTS idx_offline_commands_connection
        ON offline_commands(connection_id);
    `);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
