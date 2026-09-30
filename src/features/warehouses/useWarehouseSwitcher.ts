import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { WarehouseOption } from '@/connectors/core/types';
import { MobileConnectorClient } from '@/connectors/core/MobileConnectorClient';
import { saveAccessToken } from '@/auth/tokenStore';
import { useSession } from '@/auth/SessionProvider';
import { ConnectionRepository } from '@/storage/ConnectionRepository';

export function useWarehouseSwitcher() {
  const db = useSQLiteContext();
  const { activeConnection, refresh: refreshSession } = useSession();
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [activeWarehouseId, setActiveWarehouseId] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [switchingId, setSwitchingId] = useState<number>();
  const [error, setError] = useState('');

  const client = useMemo(
    () => (activeConnection ? new MobileConnectorClient(activeConnection) : null),
    [activeConnection],
  );

  const refresh = useCallback(async () => {
    if (!client) return;

    setLoading(true);
    setError('');
    try {
      const payload = await client.warehouses();
      setWarehouses(Array.isArray(payload.items) ? payload.items : []);
      setActiveWarehouseId(payload.activeWarehouseId ?? undefined);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load warehouses.');
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  const switchWarehouse = useCallback(
    async (warehouseId: number) => {
      if (!client || !activeConnection || switchingId) return;

      setSwitchingId(warehouseId);
      setError('');
      try {
        const result = await client.switchWarehouse(warehouseId);
        await saveAccessToken(activeConnection.id, result.token);
        await new ConnectionRepository(db).save({
          ...activeConnection,
          activeWarehouseId: result.activeWarehouseId,
          updatedAt: new Date().toISOString(),
        });
        setActiveWarehouseId(result.activeWarehouseId);
        await refreshSession();
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Warehouse switch failed.');
        throw reason;
      } finally {
        setSwitchingId(undefined);
      }
    },
    [activeConnection, client, db, refreshSession, switchingId],
  );

  return {
    warehouses,
    activeWarehouseId,
    loading,
    switchingId,
    error,
    refresh,
    switchWarehouse,
  };
}
