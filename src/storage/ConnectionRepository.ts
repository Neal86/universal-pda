import type { SQLiteDatabase } from 'expo-sqlite';
import type { ConnectionRecord, ConnectorKind } from '@/connectors/core/types';

type ConnectionRow = {
  id: string;
  name: string;
  connector_kind: ConnectorKind;
  base_url: string;
  created_at: string;
  updated_at: string;
};

function mapRow(row: ConnectionRow): ConnectionRecord {
  return {
    id: row.id,
    name: row.name,
    connectorKind: row.connector_kind,
    baseUrl: row.base_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class ConnectionRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async list(): Promise<ConnectionRecord[]> {
    const rows = await this.db.getAllAsync<ConnectionRow>(
      'SELECT * FROM connections ORDER BY updated_at DESC',
    );
    return rows.map(mapRow);
  }

  async get(id: string): Promise<ConnectionRecord | null> {
    const row = await this.db.getFirstAsync<ConnectionRow>(
      'SELECT * FROM connections WHERE id = ?',
      id,
    );
    return row ? mapRow(row) : null;
  }

  async save(connection: ConnectionRecord): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO connections (
        id, name, connector_kind, base_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        connector_kind = excluded.connector_kind,
        base_url = excluded.base_url,
        updated_at = excluded.updated_at`,
      connection.id,
      connection.name,
      connection.connectorKind,
      connection.baseUrl,
      connection.createdAt,
      connection.updatedAt,
    );
  }

  async remove(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM connections WHERE id = ?', id);
  }
}
