import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { ConnectionRecord } from '@/connectors/core/types';
import { removeAccessToken } from './tokenStore';
import { ConnectionRepository } from '@/storage/ConnectionRepository';
import { SettingsRepository } from '@/storage/SettingsRepository';

type SessionContextValue = {
  loading: boolean;
  connections: ConnectionRecord[];
  activeConnection: ConnectionRecord | null;
  refresh(): Promise<void>;
  setActiveConnection(connectionId: string): Promise<void>;
  removeConnection(connectionId: string): Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<ConnectionRecord[]>([]);
  const [activeConnection, setActiveConnectionState] = useState<ConnectionRecord | null>(null);

  const connectionRepository = useMemo(() => new ConnectionRepository(db), [db]);
  const settingsRepository = useMemo(() => new SettingsRepository(db), [db]);

  const refresh = useCallback(async () => {
    const list = await connectionRepository.list();
    const activeId = await settingsRepository.getActiveConnectionId();
    const active =
      (activeId ? list.find((item) => item.id === activeId) : undefined) ??
      list[0] ??
      null;

    if (active && active.id !== activeId) {
      await settingsRepository.setActiveConnectionId(active.id);
    }

    setConnections(list);
    setActiveConnectionState(active);
    setLoading(false);
  }, [connectionRepository, settingsRepository]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setActiveConnection = useCallback(
    async (connectionId: string) => {
      const connection = await connectionRepository.get(connectionId);
      if (!connection) {
        throw new Error('Connection not found.');
      }
      await settingsRepository.setActiveConnectionId(connectionId);
      await refresh();
    },
    [connectionRepository, refresh, settingsRepository],
  );

  const removeConnection = useCallback(
    async (connectionId: string) => {
      await removeAccessToken(connectionId);
      await connectionRepository.remove(connectionId);

      const activeId = await settingsRepository.getActiveConnectionId();
      if (activeId === connectionId) {
        await settingsRepository.setActiveConnectionId(null);
      }

      await refresh();
    },
    [connectionRepository, refresh, settingsRepository],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      loading,
      connections,
      activeConnection,
      refresh,
      setActiveConnection,
      removeConnection,
    }),
    [activeConnection, connections, loading, refresh, removeConnection, setActiveConnection],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used inside SessionProvider.');
  }
  return value;
}
