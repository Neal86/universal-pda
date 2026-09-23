import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useOfflineQueue } from './useOfflineQueue';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { colors, radius, spacing } from '@/ui/theme';

type Props = {
  onChanged?(): Promise<void> | void;
};

export function OfflineQueueCard({ onChanged }: Props) {
  const {
    items,
    loading,
    busyId,
    error,
    refresh,
    retry,
    remove,
  } = useOfflineQueue();

  if (!loading && items.length === 0 && !error) {
    return null;
  }

  async function retryItem(id: string) {
    try {
      await retry(id);
      await onChanged?.();
    } catch (reason) {
      Alert.alert(
        'Retry failed',
        reason instanceof Error ? reason.message : 'Unable to retry this operation.',
      );
    }
  }

  function confirmDiscard(id: string, barcode?: string) {
    Alert.alert(
      'Discard queued operation?',
      barcode
        ? `This permanently removes the queued scan for ${barcode} from this device.`
        : 'This permanently removes the queued operation from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            void remove(id).then(() => onChanged?.());
          },
        },
      ],
    );
  }

  const attention = items.filter((item) => item.needsAttention).length;

  return (
    <Card
      title={attention ? 'Offline queue needs attention' : 'Offline queue'}
      subtitle={
        attention
          ? `${attention} operation${attention === 1 ? '' : 's'} stopped automatic retry after an error.`
          : `${items.length} operation${items.length === 1 ? '' : 's'} waiting to sync.`
      }
    >
      {items.slice(0, 8).map((item) => (
        <View
          key={item.id}
          style={[styles.item, item.needsAttention && styles.attentionItem]}
        >
          <View style={styles.copy}>
            <Text style={styles.title}>
              {(item.workflow || item.commandType).toUpperCase()}
              {item.barcode ? ` · ${item.barcode}` : ''}
            </Text>
            <Text style={styles.meta}>
              Attempts: {item.attempts}
              {item.needsAttention ? ' · Needs attention' : ''}
            </Text>
            {item.lastError ? (
              <Text style={styles.error} numberOfLines={2}>
                {item.lastError}
              </Text>
            ) : null}
          </View>

          {item.needsAttention ? (
            <View style={styles.actions}>
              <Button
                title="Retry"
                variant="secondary"
                loading={busyId === item.id}
                disabled={Boolean(busyId && busyId !== item.id)}
                onPress={() => void retryItem(item.id)}
                style={styles.action}
              />
              <Button
                title="Discard"
                variant="danger"
                disabled={Boolean(busyId)}
                onPress={() => confirmDiscard(item.id, item.barcode)}
                style={styles.action}
              />
            </View>
          ) : null}
        </View>
      ))}

      {items.length > 8 ? (
        <Text style={styles.more}>
          {items.length - 8} additional queued operation{items.length - 8 === 1 ? '' : 's'}
        </Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title={loading ? 'Refreshing…' : 'Refresh queue'}
        variant="secondary"
        disabled={loading || Boolean(busyId)}
        onPress={() => void refresh()}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.sm,
  },
  attentionItem: {
    borderColor: '#E5C17C',
    backgroundColor: colors.warningSoft,
  },
  copy: { gap: 3 },
  title: { color: colors.text, fontWeight: '900' },
  meta: { color: colors.textMuted, fontSize: 12 },
  error: { color: colors.danger, fontSize: 12, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1, minHeight: 44 },
  more: { color: colors.textMuted, textAlign: 'center' },
});
