import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  ConnectionRecord,
  ConnectorKind,
  CredentialLoginPayload,
  WarehouseSwitchPayload,
} from '@/connectors/core/types';
import { testConnector } from '@/connectors/core/MobileConnectorClient';
import { loginNiceC, switchNiceCWarehouse } from '@/connectors/nicec/auth';
import { createId } from '@/core/ids';
import { removeAccessToken, saveAccessToken } from '@/auth/tokenStore';
import { ConnectionRepository } from '@/storage/ConnectionRepository';
import { SettingsRepository } from '@/storage/SettingsRepository';
import { normalizeBaseUrl } from '@/shared/url';

export type NewTokenConnectionInput = {
  name: string;
  connectorKind: Exclude<ConnectorKind, 'nicec'>;
  baseUrl: string;
  accessToken: string;
};

export type NiceCCredentialInput = {
  baseUrl: string;
  username: string;
  password: string;
};

export type SaveNiceCConnectionInput = {
  name: string;
  baseUrl: string;
  token: string;
  activeWarehouseId?: number | null;
};

async function persistConnection(
  db: SQLiteDatabase,
  connection: ConnectionRecord,
  token: string,
): Promise<ConnectionRecord> {
  const connections = new ConnectionRepository(db);
  const settings = new SettingsRepository(db);

  await saveAccessToken(connection.id, token);
  try {
    await connections.save(connection);
    await settings.setActiveConnectionId(connection.id);
  } catch (error) {
    await removeAccessToken(connection.id);
    throw error;
  }

  return connection;
}

export async function addTokenConnection(
  db: SQLiteDatabase,
  input: NewTokenConnectionInput,
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
  return persistConnection(db, connection, accessToken);
}

export function authenticateNiceC(
  input: NiceCCredentialInput,
): Promise<CredentialLoginPayload> {
  return loginNiceC(input.baseUrl, input.username, input.password);
}

export function selectNiceCWarehouse(
  baseUrl: string,
  token: string,
  warehouseId: number,
): Promise<WarehouseSwitchPayload> {
  return switchNiceCWarehouse(baseUrl, token, warehouseId);
}

export async function saveNiceCConnection(
  db: SQLiteDatabase,
  input: SaveNiceCConnectionInput,
): Promise<ConnectionRecord> {
  const name = input.name.trim();
  const token = input.token.trim();
  if (!name) throw new Error('Connection name is required.');
  if (!token) throw new Error('NiceC mobile token is missing.');

  const now = new Date().toISOString();
  const connection: ConnectionRecord = {
    id: createId('connection'),
    name,
    connectorKind: 'nicec',
    baseUrl: normalizeBaseUrl(input.baseUrl),
    activeWarehouseId: input.activeWarehouseId ?? undefined,
    createdAt: now,
    updatedAt: now,
  };

  await testConnector(connection, token);
  return persistConnection(db, connection, token);
}
