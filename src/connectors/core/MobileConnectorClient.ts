import type {
  CapabilitySet,
  ConnectionRecord,
  CountLineUpdateResult,
  DashboardPayload,
  InventoryItem,
  ReturnActionDetails,
  ScanCommand,
  ScanResult,
  TaskItem,
  WarehouseListPayload,
  WarehouseSwitchPayload,
} from './types';
import { getAccessToken } from '@/auth/tokenStore';
import { ApiError } from '@/network/ApiError';
import { requestJson } from '@/network/http';

export type ReturnCountInput = {
  receivedQty: number;
  goodQty: number;
  defectiveQty: number;
  shortageQty?: number;
  excessQty?: number;
  wrongItemQty?: number;
  unidentifiedQty?: number;
  disposition?: string;
  note?: string;
};

export type ReturnPutawayInput = {
  destinationLocationId?: number;
  defectiveDestinationLocationId?: number;
  destinationBarcode?: string;
  defectiveDestinationBarcode?: string;
  lotNumber?: string;
};

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

  async warehouses(): Promise<WarehouseListPayload> {
    return requestJson<WarehouseListPayload>({
      baseUrl: this.connection.baseUrl,
      path: '/mobile/v1/warehouses',
      token: await this.token(),
    });
  }

  async switchWarehouse(warehouseId: number): Promise<WarehouseSwitchPayload> {
    return requestJson<WarehouseSwitchPayload>({
      baseUrl: this.connection.baseUrl,
      path: '/mobile/v1/warehouse-context',
      token: await this.token(),
      method: 'POST',
      body: { warehouseId },
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

  async completeTask(taskId: string, scans?: unknown[]): Promise<TaskItem> {
    return requestJson<TaskItem>({
      baseUrl: this.connection.baseUrl,
      path: `/mobile/v1/tasks/${encodeURIComponent(taskId)}/complete`,
      token: await this.token(),
      method: 'POST',
      body: scans ? { scans } : { completedAt: new Date().toISOString() },
    });
  }

  async reportTaskException(
    taskId: string,
    input: {
      description: string;
      exceptionType?: string;
      severity?: string;
      affectsPerformance?: boolean;
    },
  ): Promise<{ exceptionId: number; taskId: number; state: string }> {
    return requestJson({
      baseUrl: this.connection.baseUrl,
      path: `/mobile/v1/tasks/${encodeURIComponent(taskId)}/exception`,
      token: await this.token(),
      method: 'POST',
      body: input,
    });
  }

  async resolveTaskException(
    taskId: string,
    resolution: string,
  ): Promise<{ taskId: number; resolved: boolean }> {
    return requestJson({
      baseUrl: this.connection.baseUrl,
      path: `/mobile/v1/tasks/${encodeURIComponent(taskId)}/exception/resolve`,
      token: await this.token(),
      method: 'POST',
      body: { resolution },
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

  async updateCountLine(
    countId: number,
    lineId: number,
    countedQty: number,
  ): Promise<CountLineUpdateResult> {
    return requestJson<CountLineUpdateResult>({
      baseUrl: this.connection.baseUrl,
      path: `/mobile/v1/counts/${countId}/lines/${lineId}`,
      token: await this.token(),
      method: 'POST',
      body: { countedQty },
    });
  }

  async approveCount(countId: number): Promise<{ id: number; state: string }> {
    return requestJson({
      baseUrl: this.connection.baseUrl,
      path: `/mobile/v1/counts/${countId}/approve`,
      token: await this.token(),
      method: 'POST',
      body: {},
    });
  }

  async returnAction(actionId: number): Promise<ReturnActionDetails> {
    return requestJson<ReturnActionDetails>({
      baseUrl: this.connection.baseUrl,
      path: `/mobile/v1/returns/${actionId}`,
      token: await this.token(),
    });
  }

  async countReturn(
    actionId: number,
    input: ReturnCountInput,
  ): Promise<ReturnActionDetails> {
    return requestJson<ReturnActionDetails>({
      baseUrl: this.connection.baseUrl,
      path: `/mobile/v1/returns/${actionId}/count`,
      token: await this.token(),
      method: 'POST',
      body: input,
    });
  }

  async putawayReturn(
    actionId: number,
    input: ReturnPutawayInput,
  ): Promise<ReturnActionDetails> {
    return requestJson<ReturnActionDetails>({
      baseUrl: this.connection.baseUrl,
      path: `/mobile/v1/returns/${actionId}/putaway`,
      token: await this.token(),
      method: 'POST',
      body: input,
    });
  }

  async approveReturn(actionId: number): Promise<ReturnActionDetails> {
    return requestJson<ReturnActionDetails>({
      baseUrl: this.connection.baseUrl,
      path: `/mobile/v1/returns/${actionId}/approve`,
      token: await this.token(),
      method: 'POST',
      body: {},
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
