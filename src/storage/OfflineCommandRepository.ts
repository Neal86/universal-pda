import type { SQLiteDatabase } from 'expo-sqlite';

export type OfflineCommandRecord = {
  id: string;
  connectionId: string;
  commandType: 'scan';
  payloadJson: string;
  attempts: number;
  nextAttemptAt: string;
  lastError?: string;
  createdAt: string;
};

type OfflineCommandRow = {
  id: string;
  connection_id: string;
  command_type: 'scan';
  payload_json: string;
  attempts: number;
  next_attempt_at: string;
  last_error: string | null;
  created_at: string;
};

function mapRow(row: OfflineCommandRow): OfflineCommandRecord {
  return {
    id: row.id,
    connectionId: row.connection_id,
    commandType: row.command_type,
    payloadJson: row.payload_json,
    attempts: row.attempts,
    nextAttemptAt: row.next_attempt_at,
    lastError: row.last_error ?? undefined,
    createdAt: row.created_at,
  };
}

export class OfflineCommandRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async enqueue(command: OfflineCommandRecord): Promise<void> {
    await this.db.runAsync(
      `INSERT OR IGNORE INTO offline_commands (
        id, connection_id, command_type, payload_json, attempts,
        next_attempt_at, last_error, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      command.id,
      command.connectionId,
      command.commandType,
      command.payloadJson,
      command.attempts,
      command.nextAttemptAt,
      command.lastError ?? null,
      command.createdAt,
    );
  }

  async due(nowIso: string, limit = 50): Promise<OfflineCommandRecord[]> {
    const rows = await this.db.getAllAsync<OfflineCommandRow>(
      `SELECT * FROM offline_commands
       WHERE next_attempt_at <= ?
       ORDER BY created_at ASC
       LIMIT ?`,
      nowIso,
      limit,
    );
    return rows.map(mapRow);
  }

  async count(connectionId?: string): Promise<number> {
    if (connectionId) {
      const row = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) AS count FROM offline_commands WHERE connection_id = ?',
        connectionId,
      );
      return row?.count ?? 0;
    }

    const row = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM offline_commands',
    );
    return row?.count ?? 0;
  }

  async markFailed(
    id: string,
    attempts: number,
    nextAttemptAt: string,
    lastError: string,
  ): Promise<void> {
    await this.db.runAsync(
      `UPDATE offline_commands
       SET attempts = ?, next_attempt_at = ?, last_error = ?
       WHERE id = ?`,
      attempts,
      nextAttemptAt,
      lastError,
      id,
    );
  }

  async remove(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM offline_commands WHERE id = ?', id);
  }

  async removeForConnection(connectionId: string): Promise<void> {
    await this.db.runAsync(
      'DELETE FROM offline_commands WHERE connection_id = ?',
      connectionId,
    );
  }
}
