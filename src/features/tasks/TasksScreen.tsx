import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { TaskItem } from '@/connectors/core/types';
import { TaskExceptionModal } from './TaskExceptionModal';
import { useTasks } from './useTasks';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ConnectionBadge } from '@/ui/ConnectionBadge';
import { EmptyState } from '@/ui/EmptyState';
import { Screen } from '@/ui/Screen';
import { colors, radius, spacing } from '@/ui/theme';

export function TasksScreen() {
  const {
    tasks,
    loading,
    completingId,
    exceptionTaskId,
    error,
    refresh,
    complete,
    reportException,
  } = useTasks();
  const [exceptionTask, setExceptionTask] = useState<TaskItem | null>(null);

  async function completeTask(taskId: string) {
    try {
      await complete(taskId);
    } catch (reason) {
      Alert.alert(
        'Task not completed',
        reason instanceof Error ? reason.message : 'The task update failed.',
      );
    }
  }

  async function submitException(input: {
    taskId: string;
    description: string;
    severity: string;
  }) {
    try {
      await reportException(input.taskId, input);
      setExceptionTask(null);
    } catch (reason) {
      Alert.alert(
        'Exception not reported',
        reason instanceof Error ? reason.message : 'The exception could not be reported.',
      );
    }
  }

  return (
    <>
      <Screen>
        <ConnectionBadge />

        <View>
          <Text style={styles.title}>Open tasks</Text>
          <Text style={styles.subtitle}>
            Receive, pick, pack, count, move, and exception work from the active system.
          </Text>
        </View>

        {error ? <Card title="Unable to load tasks" subtitle={error} /> : null}

        {!loading && !error && tasks.length === 0 ? (
          <EmptyState
            title="No open tasks"
            message="The active system returned no open tasks."
          />
        ) : null}

        {tasks.map((task) => {
          const awaitingReview = task.status === 'pending_review';
          const hasException = task.status === 'exception';

          return (
            <Card
              key={task.id}
              title={task.title}
              subtitle={[
                task.subtitle,
                task.priority ? `Priority: ${task.priority}` : '',
              ]
                .filter(Boolean)
                .join(' · ')}
            >
              <View style={styles.meta}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{task.type}</Text>
                </View>
                <Text style={styles.status}>{task.status}</Text>
                {typeof task.progressPercent === 'number' ? (
                  <Text style={styles.progress}>
                    {Math.round(task.progressPercent)}%
                  </Text>
                ) : null}
              </View>

              {task.exceptionReason ? (
                <Text style={styles.exceptionText}>{task.exceptionReason}</Text>
              ) : null}

              {awaitingReview ? (
                <View style={styles.reviewBanner}>
                  <Text style={styles.reviewText}>Completed · awaiting manager review</Text>
                </View>
              ) : task.scanRequired !== false ? (
                <Text style={styles.scanHint}>
                  Complete this task from the Scan tab so required warehouse scans are recorded.
                </Text>
              ) : (
                <Button
                  title="Complete task"
                  onPress={() => void completeTask(task.id)}
                  loading={completingId === task.id}
                  disabled={Boolean(completingId && completingId !== task.id)}
                />
              )}

              {!awaitingReview && !hasException ? (
                <Button
                  title="Report exception"
                  variant="secondary"
                  onPress={() => setExceptionTask(task)}
                  disabled={Boolean(completingId || exceptionTaskId)}
                />
              ) : null}
            </Card>
          );
        })}

        <Button
          title={loading ? 'Loading…' : 'Refresh tasks'}
          variant="secondary"
          onPress={() => void refresh()}
          disabled={loading}
        />
      </Screen>

      <TaskExceptionModal
        task={exceptionTask}
        submitting={exceptionTaskId === exceptionTask?.id}
        onClose={() => setExceptionTask(null)}
        onSubmit={submitException}
      />
    </>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  subtitle: { color: colors.textMuted, marginTop: 4, lineHeight: 21 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pill: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: { color: colors.primary, fontWeight: '900', fontSize: 12 },
  status: { color: colors.textMuted, fontWeight: '700', fontSize: 13 },
  progress: { marginLeft: 'auto', color: colors.primary, fontWeight: '900' },
  reviewBanner: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.md,
  },
  reviewText: { color: colors.success, fontWeight: '900' },
  scanHint: { color: colors.textMuted, lineHeight: 20 },
  exceptionText: { color: colors.danger, lineHeight: 20, fontWeight: '700' },
});
