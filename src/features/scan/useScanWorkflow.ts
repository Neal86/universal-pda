import { useCallback, useMemo, useRef, useState } from 'react';
import * as Network from 'expo-network';
import { useSQLiteContext } from 'expo-sqlite';
import type { NormalizedScanEvent } from '@/device/scanner/core/types';
import type { ScanCommand, ScanResult } from '@/connectors/core/types';
import type { WorkflowKind } from '@/workflows/core/types';
import { MobileConnectorClient } from '@/connectors/core/MobileConnectorClient';
import { ApiError } from '@/network/ApiError';
import { OfflineQueueService } from '@/offline/OfflineQueueService';
import { createId } from '@/core/ids';
import { useSession } from '@/auth/SessionProvider';
import {
  errorFeedback,
  successFeedback,
  warningFeedback,
} from '@/device/feedback/feedback';

const DUPLICATE_WINDOW_MS = 1_200;

export function useScanWorkflow() {
  const db = useSQLiteContext();
  const { activeConnection } = useSession();
  const queue = useMemo(() => new OfflineQueueService(db), [db]);
  const [workflow, setWorkflowState] = useState<WorkflowKind>('identify');
  const [workflowSessionId, setWorkflowSessionId] = useState<string>();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const lastScan = useRef<{ value: string; at: number } | null>(null);

  const setWorkflow = useCallback((next: WorkflowKind) => {
    setWorkflowState(next);
    setWorkflowSessionId(undefined);
    setResult(null);
    lastScan.current = null;
  }, []);

  const processScan = useCallback(async (event: NormalizedScanEvent) => {
    if (!activeConnection || processing) return;

    const barcode = event.value.trim();
    if (!barcode) return;

    const now = Date.now();
    if (
      lastScan.current?.value === barcode &&
      now - lastScan.current.at < DUPLICATE_WINDOW_MS
    ) {
      return;
    }

    lastScan.current = { value: barcode, at: now };
    setProcessing(true);
    setResult(null);

    const command: ScanCommand = {
      operationId: createId('scan'),
      barcode,
      source: event.source,
      symbology: event.symbology,
      workflow,
      workflowSessionId,
      scannedAt: event.scannedAt,
    };

    try {
      const network = await Network.getNetworkStateAsync();
      const offline =
        network.isConnected === false || network.isInternetReachable === false;

      if (offline) {
        await queue.enqueueScan(activeConnection.id, command);
        setResult({
          title: barcode,
          message: 'Saved offline. This operation will sync when connectivity returns.',
          severity: 'warning',
        });
        await warningFeedback();
        return;
      }

      try {
        const response = await new MobileConnectorClient(activeConnection).scan(command);
        setResult(response);
        setWorkflowSessionId(
          response.workflowComplete ? undefined : response.workflowSessionId,
        );

        if (response.severity === 'error') {
          await errorFeedback();
        } else if (response.severity === 'warning') {
          await warningFeedback();
        } else {
          await successFeedback();
        }
      } catch (reason) {
        if (reason instanceof ApiError && reason.retriable) {
          await queue.enqueueScan(activeConnection.id, command);
          setResult({
            title: barcode,
            message: 'Server unavailable. Operation queued safely for retry.',
            severity: 'warning',
          });
          await warningFeedback();
          return;
        }
        throw reason;
      }
    } catch (reason) {
      setResult({
        title: barcode,
        message: reason instanceof Error ? reason.message : 'Scan failed.',
        severity: 'error',
      });
      await errorFeedback();
    } finally {
      setProcessing(false);
    }
  }, [activeConnection, processing, queue, workflow, workflowSessionId]);

  return {
    workflow,
    setWorkflow,
    workflowSessionId,
    processing,
    result,
    processScan,
  };
}
