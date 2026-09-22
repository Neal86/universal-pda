import type { SQLiteDatabase } from 'expo-sqlite';
import type { ConnectionRecord, ConnectorKind } from '@/connectors/core/types';
import { testConnector } from '@/connectors/core/MobileConnectorClient';
import { createId } from '@/core/ids';
import { saveAccessToken } from '@/auth/tokenStore';
import { ConnectionRepository } from '@/storage/ConnectionRepository';
import { SettingsRepository } from '@/storage/SettingsRepository';
import { normalizeBaseUrl } from '@/shared/url';

export type NewConnectionInput = {
  name: string;
  connectorKind: ConnectorKind;
  baseUrl: string;
  accessToken: string;
};

export async function addConnection(
  db: SQLiteDatabase,
  input: NewConnectionInput,
): Promise<ConnectionRecord> {
  const name = input.name.trim();
  const accessToken = input.accessToken.trim();

  if (!name) throw new Error('Connection name is required.');
  if (!accessToken) throw new Error('Access token is required.');

  const now = new Date().toISOString();
  const connection: ConnectionRecord = {
    id: createId('connection'),
    name,
    connectorKind: input.connectorKind,
    baseUrl: normalizeBaseUrl(input.baseUrl),
    createdAt: now,
    updatedAt: now,
  };

  await testConnector(connection, accessToken);

  const connections = new ConnectionRepository(db);
  const settings = new SettingsRepository(db);

  await saveAccessToken(connection.id, accessToken);
  try {
    await connections.save(connection);
    await settings.setActiveConnectionId(connection.id);
  } catch (error) {
    const { removeAccessToken } = await import('@/auth/tokenStore');
    await removeAccessToken(connection.id);
    throw error;
  }

  return connection;
}
