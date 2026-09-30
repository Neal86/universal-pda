import type { SQLiteDatabase } from 'expo-sqlite';

const ACTIVE_CONNECTION_KEY = 'active_connection_id';

export class SettingsRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getActiveConnectionId(): Promise<string | null> {
    const row = await this.db.getFirstAsync<{ value: string | null }>(
      'SELECT value FROM app_settings WHERE key = ?',
      ACTIVE_CONNECTION_KEY,
    );
    return row?.value ?? null;
  }

  async setActiveConnectionId(connectionId: string | null): Promise<void> {
    if (connectionId === null) {
      await this.db.runAsync('DELETE FROM app_settings WHERE key = ?', ACTIVE_CONNECTION_KEY);
      return;
    }

    await this.db.runAsync(
      `INSERT INTO app_settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      ACTIVE_CONNECTION_KEY,
      connectionId,
    );
  }
}
