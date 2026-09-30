import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { DashboardPayload } from '@/connectors/core/types';
import { MobileConnectorClient } from '@/connectors/core/MobileConnectorClient';
import { OfflineQueueService } from '@/offline/OfflineQueueService';
import { useSession } from '@/auth/SessionProvider';

export function useDashboard() {
  const db = useSQLiteContext();
  const { activeConnection } = useSession();
  const queue = useMemo(() => new OfflineQueueService(db), [db]);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!activeConnection) return;

    setLoading(true);
    setError('');

    try {
      await queue.flushDue();
      const [payload, count] = await Promise.all([
        new MobileConnectorClient(activeConnection).dashboard(),
        queue.count(activeConnection.id),
      ]);
      setDashboard(payload);
      setQueuedCount(count);
    } catch (reason) {
      setQueuedCount(await queue.count(activeConnection.id));
      setError(reason instanceof Error ? reason.message : 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, [activeConnection, queue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  return { dashboard, queuedCount, loading, error, refresh };
}
