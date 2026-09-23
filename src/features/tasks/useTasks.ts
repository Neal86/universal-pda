import { useCallback, useEffect, useState } from 'react';
import type { TaskItem } from '@/connectors/core/types';
import { MobileConnectorClient } from '@/connectors/core/MobileConnectorClient';
import { useSession } from '@/auth/SessionProvider';

export function useTasks() {
  const { activeConnection } = useSession();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [exceptionTaskId, setExceptionTaskId] = useState<string | null>(null);
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
    const timer = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  const complete = useCallback(async (taskId: string) => {
    if (!activeConnection) return;

    setCompletingId(taskId);
    try {
      const updated = await new MobileConnectorClient(activeConnection).completeTask(taskId);
      setTasks((current) => {
        if (['done', 'completed'].includes(updated.status)) {
          return current.filter((task) => task.id !== taskId);
        }
        return current.map((task) => (task.id === taskId ? updated : task));
      });
    } finally {
      setCompletingId(null);
    }
  }, [activeConnection]);

  const reportException = useCallback(
    async (
      taskId: string,
      input: { description: string; severity: string },
    ) => {
      if (!activeConnection) return;

      setExceptionTaskId(taskId);
      try {
        await new MobileConnectorClient(activeConnection).reportTaskException(
          taskId,
          {
            description: input.description,
            severity: input.severity,
            exceptionType: 'other',
            affectsPerformance: true,
          },
        );
        await refresh();
      } finally {
        setExceptionTaskId(null);
      }
    },
    [activeConnection, refresh],
  );

  return {
    tasks,
    loading,
    completingId,
    exceptionTaskId,
    error,
    refresh,
    complete,
    reportException,
  };
}
