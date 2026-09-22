import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useTasks } from './useTasks';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ConnectionBadge } from '@/ui/ConnectionBadge';
import { EmptyState } from '@/ui/EmptyState';
import { Screen } from '@/ui/Screen';
import { colors, radius, spacing } from '@/ui/theme';

export function TasksScreen() {
  const { tasks, loading, completingId, error, refresh, complete } = useTasks();

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

  return (
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

      {tasks.map((task) => (
        <Card
          key={task.id}
          title={task.title}
          subtitle={[task.subtitle, task.priority ? `Priority: ${task.priority}` : '']
            .filter(Boolean)
            .join(' · ')}
        >
          <View style={styles.meta}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{task.type}</Text>
            </View>
            <Text style={styles.status}>{task.status}</Text>
          </View>

          <Button
            title="Complete task"
            onPress={() => void completeTask(task.id)}
            loading={completingId === task.id}
            disabled={Boolean(completingId && completingId !== task.id)}
          />
        </Card>
      ))}

      <Button
        title={loading ? 'Loading…' : 'Refresh tasks'}
        variant="secondary"
        onPress={() => void refresh()}
        disabled={loading}
      />
    </Screen>
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
});
