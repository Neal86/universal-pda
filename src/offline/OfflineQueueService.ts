import type { SQLiteDatabase } from 'expo-sqlite';
import type { ScanCommand } from '@/connectors/core/types';
import { MobileConnectorClient } from '@/connectors/core/MobileConnectorClient';
import { ApiError } from '@/network/ApiError';
import { ConnectionRepository } from '@/storage/ConnectionRepository';
import {
  OfflineCommandRepository,
  type OfflineCommandRecord,
} from '@/storage/OfflineCommandRepository';
import { MAX_RETRY_ATTEMPTS, nextRetryIso } from './retryPolicy';

const NEVER_RETRY_ISO = '9999-12-31T23:59:59.999Z';

export type FlushResult = {
  succeeded: number;
  failed: number;
  remaining: number;
};

export type OfflineQueueItem = OfflineCommandRecord & {
  needsAttention: boolean;
  workflow?: string;
  barcode?: string;
};

function enrich(item: OfflineCommandRecord): OfflineQueueItem {
  let workflow: string | undefined;
  let barcode: string | undefined;

  try {
    const payload = JSON.parse(item.payloadJson) as Partial<ScanCommand>;
    workflow = payload.workflow;
    barcode = payload.barcode;
  } catch {
    // Keep malformed queue items visible so the operator can remove them.
  }

  return {
    ...item,
    workflow,
    barcode,
    needsAttention:
      item.nextAttemptAt === NEVER_RETRY_ISO ||
      item.attempts >= MAX_RETRY_ATTEMPTS,
  };
}

export class OfflineQueueService {
  private readonly commands: OfflineCommandRepository;
  private readonly connections: ConnectionRepository;

  constructor(db: SQLiteDatabase) {
    this.commands = new OfflineCommandRepository(db);
    this.connections = new ConnectionRepository(db);
  }

  async enqueueScan(connectionId: string, command: ScanCommand): Promise<void> {
    const now = new Date().toISOString();
    await this.commands.enqueue({
      id: command.operationId,
      connectionId,
      commandType: 'scan',
      payloadJson: JSON.stringify(command),
      attempts: 0,
      nextAttemptAt: now,
      createdAt: now,
    });
  }

  count(connectionId?: string): Promise<number> {
    return this.commands.count(connectionId);
  }

  async list(connectionId: string): Promise<OfflineQueueItem[]> {
    const items = await this.commands.listForConnection(connectionId);
    return items.map(enrich);
  }

  async retryNow(id: string): Promise<void> {
    await this.commands.retryNow(id);
  }

  async remove(id: string): Promise<void> {
    await this.commands.remove(id);
  }

  async flushDue(): Promise<FlushResult> {
    const due = await this.commands.due(new Date().toISOString());
    let succeeded = 0;
    let failed = 0;

    for (const item of due) {
      const connection = await this.connections.get(item.connectionId);
      if (!connection) {
        await this.commands.remove(item.id);
        continue;
      }

      try {
        const payload = JSON.parse(item.payloadJson) as ScanCommand;
        await new MobileConnectorClient(connection).scan(payload);
        await this.commands.remove(item.id);
        succeeded += 1;
      } catch (error) {
        failed += 1;
        const attempts = item.attempts + 1;
        const retriable = !(error instanceof ApiError) || error.retriable;
        const exhausted = attempts >= MAX_RETRY_ATTEMPTS;
        const nextAttemptAt =
          !retriable || exhausted ? NEVER_RETRY_ISO : nextRetryIso(attempts);

        await this.commands.markFailed(
          item.id,
          attempts,
          nextAttemptAt,
          error instanceof Error ? error.message.slice(0, 300) : 'Retry failed',
        );
      }
    }

    return {
      succeeded,
      failed,
      remaining: await this.commands.count(),
    };
  }
}
