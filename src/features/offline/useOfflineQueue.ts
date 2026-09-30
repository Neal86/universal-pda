import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useSession } from '@/auth/SessionProvider';
import {
  OfflineQueueService,
  type OfflineQueueItem,
} from '@/offline/OfflineQueueService';

export function useOfflineQueue() {
  const db = useSQLiteContext();
  const { activeConnection } = useSession();
  const service = useMemo(() => new OfflineQueueService(db), [db]);
  const [items, setItems] = useState<OfflineQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string>();
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!activeConnection) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      setItems(await service.list(activeConnection.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load offline queue.');
    } finally {
      setLoading(false);
    }
  }, [activeConnection, service]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  const retry = useCallback(
    async (id: string) => {
      setBusyId(id);
      try {
        await service.retryNow(id);
        await service.flushDue();
        await refresh();
      } finally {
        setBusyId(undefined);
      }
    },
    [refresh, service],
  );

  const remove = useCallback(
    async (id: string) => {
      setBusyId(id);
      try {
        await service.remove(id);
        await refresh();
      } finally {
        setBusyId(undefined);
      }
    },
    [refresh, service],
  );

  return {
    items,
    loading,
    busyId,
    error,
    refresh,
    retry,
    remove,
  };
}
