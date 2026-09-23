import type {
  CredentialLoginPayload,
  WarehouseSwitchPayload,
} from '@/connectors/core/types';
import { requestJson } from '@/network/http';
import { normalizeBaseUrl } from '@/shared/url';

export async function loginNiceC(
  baseUrl: string,
  username: string,
  password: string,
): Promise<CredentialLoginPayload> {
  const cleanUsername = username.trim();
  if (!cleanUsername || !password) {
    throw new Error('NiceC username and password are required.');
  }

  return requestJson<CredentialLoginPayload>({
    baseUrl: normalizeBaseUrl(baseUrl),
    path: '/mobile/v1/auth/login',
    method: 'POST',
    body: {
      username: cleanUsername,
      password,
    },
  });
}

export async function switchNiceCWarehouse(
  baseUrl: string,
  token: string,
  warehouseId: number,
): Promise<WarehouseSwitchPayload> {
  if (!Number.isInteger(warehouseId) || warehouseId <= 0) {
    throw new Error('Select a valid warehouse.');
  }

  return requestJson<WarehouseSwitchPayload>({
    baseUrl: normalizeBaseUrl(baseUrl),
    path: '/mobile/v1/warehouse-context',
    token,
    method: 'POST',
    body: { warehouseId },
  });
}
