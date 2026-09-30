import { useState } from 'react';
import type { InventoryItem } from '@/connectors/core/types';
import { MobileConnectorClient } from '@/connectors/core/MobileConnectorClient';
import { useSession } from '@/auth/SessionProvider';

export function useInventorySearch() {
  const { activeConnection } = useSession();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function search(query: string) {
    if (!activeConnection || !query.trim()) return;

    setLoading(true);
    setSearched(true);
    setError('');

    try {
      const result = await new MobileConnectorClient(activeConnection)
        .searchInventory(query.trim());
      setItems(Array.isArray(result) ? result : []);
    } catch (reason) {
      setItems([]);
      setError(reason instanceof Error ? reason.message : 'Inventory search failed.');
    } finally {
      setLoading(false);
    }
  }

  return { items, searched, loading, error, search };
}
