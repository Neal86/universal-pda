import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CapabilitySet } from '@/connectors/core/types';
import { MobileConnectorClient } from '@/connectors/core/MobileConnectorClient';
import { useSession } from '@/auth/SessionProvider';

type CapabilityContextValue = {
  loading: boolean;
  capabilities: CapabilitySet | null;
  error: string;
  refresh(): Promise<void>;
  supports(feature: string): boolean;
};

const CapabilityContext = createContext<CapabilityContextValue | null>(null);

export function CapabilityProvider({ children }: { children: React.ReactNode }) {
  const { activeConnection } = useSession();
  const [capabilities, setCapabilities] = useState<CapabilitySet | null>(null);
  const [loading, setLoading] = useState(Boolean(activeConnection));
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!activeConnection) {
      setCapabilities(null);
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const next = await new MobileConnectorClient(activeConnection).capabilities();
      setCapabilities({
        ...next,
        features: Array.isArray(next.features) ? next.features : [],
      });
    } catch (reason) {
      setCapabilities(null);
      setError(
        reason instanceof Error ? reason.message : 'Unable to load system capabilities.',
      );
    } finally {
      setLoading(false);
    }
  }, [activeConnection]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  const supports = useCallback(
    (feature: string) => {
      if (!capabilities) return true;
      return capabilities.features.includes(feature);
    },
    [capabilities],
  );

  const value = useMemo<CapabilityContextValue>(
    () => ({ loading, capabilities, error, refresh, supports }),
    [capabilities, error, loading, refresh, supports],
  );

  return (
    <CapabilityContext.Provider value={value}>
      {children}
    </CapabilityContext.Provider>
  );
}

export function useCapabilities(): CapabilityContextValue {
  const value = useContext(CapabilityContext);
  if (!value) {
    throw new Error('useCapabilities must be used inside CapabilityProvider.');
  }
  return value;
}
