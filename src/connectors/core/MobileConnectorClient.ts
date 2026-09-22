import type {
  CapabilitySet,
  ConnectionRecord,
  DashboardPayload,
  InventoryItem,
  ScanCommand,
  ScanResult,
  TaskItem,
} from './types';
import { getAccessToken } from '@/auth/tokenStore';
import { ApiError } from '@/network/ApiError';
import { requestJson } from '@/network/http';

export class MobileConnectorClient {
  constructor(private readonly connection: ConnectionRecord) {}

  private async token(): Promise<string> {
    const token = await getAccessToken(this.connection.id);
    if (!token) {
      throw new ApiError('This connection is missing its secure access token.');
    }
    return token;
  }

  async capabilities(): Promise<CapabilitySet> {
    return requestJson<CapabilitySet>({
      baseUrl: this.connection.baseUrl,
      path: '/mobile/v1/capabilities',
      token: await this.token(),
    });
  }

  async dashboard(): Promise<DashboardPayload> {
    return requestJson<DashboardPayload>({
      baseUrl: this.connection.baseUrl,
      path: '/mobile/v1/dashboard',
      token: await this.token(),
    });
  }

  async tasks(): Promise<TaskItem[]> {
    return requestJson<TaskItem[]>({
      baseUrl: this.connection.baseUrl,
      path: '/mobile/v1/tasks',
      token: await this.token(),
      query: { status: 'open' },
    });
  }

  async completeTask(taskId: string): Promise<TaskItem> {
    return requestJson<TaskItem>({
      baseUrl: this.connection.baseUrl,
      path: `/mobile/v1/tasks/${encodeURIComponent(taskId)}/complete`,
      token: await this.token(),
      method: 'POST',
      body: { completedAt: new Date().toISOString() },
    });
  }

  async searchInventory(query: string): Promise<InventoryItem[]> {
    return requestJson<InventoryItem[]>({
      baseUrl: this.connection.baseUrl,
      path: '/mobile/v1/inventory/search',
      token: await this.token(),
      query: { q: query },
    });
  }

  async scan(command: ScanCommand): Promise<ScanResult> {
    return requestJson<ScanResult>({
      baseUrl: this.connection.baseUrl,
      path: '/mobile/v1/scan',
      token: await this.token(),
      method: 'POST',
      body: command,
      idempotencyKey: command.operationId,
    });
  }

  async registerPushToken(pushToken: string): Promise<void> {
    await requestJson<unknown>({
      baseUrl: this.connection.baseUrl,
      path: '/mobile/v1/devices/push-token',
      token: await this.token(),
      method: 'POST',
      body: { token: pushToken, platform: 'expo' },
    });
  }
}

export async function testConnector(
  connection: ConnectionRecord,
  token: string,
): Promise<CapabilitySet> {
  if (!token.trim()) {
    throw new Error('Access token is required.');
  }

  return requestJson<CapabilitySet>({
    baseUrl: connection.baseUrl,
    path: '/mobile/v1/capabilities',
    token: token.trim(),
  });
}
