import { useCallback, useEffect, useState } from 'react';
import type { TaskItem } from '@/connectors/core/types';
import { MobileConnectorClient } from '@/connectors/core/MobileConnectorClient';
import { useSession } from '@/auth/SessionProvider';

export function useTasks() {
  const { activeConnection } = useSession();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!activeConnection) return;

    setLoading(true);
    setError('');

    try {
      const result = await new MobileConnectorClient(activeConnection).tasks();
      setTasks(Array.isArray(result) ? result : []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [activeConnection]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const complete = useCallback(async (taskId: string) => {
    if (!activeConnection) return;

    setCompletingId(taskId);
    try {
      await new MobileConnectorClient(activeConnection).completeTask(taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } finally {
      setCompletingId(null);
    }
  }, [activeConnection]);

  return { tasks, loading, completingId, error, refresh, complete };
}
