import { useEffect, useMemo, useRef } from 'react';
import { AppState } from 'react-native';
import * as Network from 'expo-network';
import { useSQLiteContext } from 'expo-sqlite';
import { OfflineQueueService } from './OfflineQueueService';

export function SyncManager() {
  const db = useSQLiteContext();
  const service = useMemo(() => new OfflineQueueService(db), [db]);
  const syncing = useRef(false);

  useEffect(() => {
    async function syncIfReachable() {
      if (syncing.current) return;

      const network = await Network.getNetworkStateAsync();
      if (network.isConnected === false || network.isInternetReachable === false) {
        return;
      }

      syncing.current = true;
      try {
        await service.flushDue();
      } finally {
        syncing.current = false;
      }
    }

    void syncIfReachable();

    const networkSubscription = Network.addNetworkStateListener((state) => {
      if (state.isConnected !== false && state.isInternetReachable !== false) {
        void syncIfReachable();
      }
    });

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void syncIfReachable();
      }
    });

    return () => {
      networkSubscription.remove();
      appStateSubscription.remove();
    };
  }, [service]);

  return null;
}
