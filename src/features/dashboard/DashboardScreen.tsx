import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useDashboard } from './useDashboard';
import { OfflineQueueCard } from '@/features/offline/OfflineQueueCard';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ConnectionBadge } from '@/ui/ConnectionBadge';
import { EmptyState } from '@/ui/EmptyState';
import { Screen } from '@/ui/Screen';
import { colors, spacing } from '@/ui/theme';

export function DashboardScreen() {
  const { dashboard, loading, error, refresh } = useDashboard();

  return (
    <Screen>
      <ConnectionBadge />
      <OfflineQueueCard onChanged={refresh} />

      <View>
        <Text style={styles.title}>{dashboard?.title ?? 'Operations'}</Text>
        <Text style={styles.subtitle}>
          {dashboard?.subtitle ?? 'Live operational data from the active system.'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : error ? (
        <Card title="Unable to refresh" subtitle={error}>
          <Button title="Try again" onPress={() => void refresh()} />
        </Card>
      ) : dashboard?.metrics?.length ? (
        <View style={styles.grid}>
          {dashboard.metrics.map((metric) => (
            <View key={metric.id} style={styles.metric}>
              <Text style={styles.metricValue}>{String(metric.value)}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              {metric.hint ? <Text style={styles.metricHint}>{metric.hint}</Text> : null}
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          title="No dashboard metrics"
          message="The active connector returned no dashboard metrics."
        />
      )}

      <Button
        title="Refresh live data"
        variant="secondary"
        onPress={() => void refresh()}
        disabled={loading}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 30, fontWeight: '900' },
  subtitle: { color: colors.textMuted, marginTop: 5, lineHeight: 21 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metric: {
    width: '48%',
    minHeight: 118,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  metricValue: { color: colors.text, fontSize: 30, fontWeight: '900' },
  metricLabel: { color: colors.text, fontWeight: '800', marginTop: 4 },
  metricHint: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
});
