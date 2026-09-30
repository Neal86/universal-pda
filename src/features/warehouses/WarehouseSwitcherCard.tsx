import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useWarehouseSwitcher } from './useWarehouseSwitcher';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { colors, radius, spacing } from '@/ui/theme';

type Props = {
  onChanged?(): Promise<void> | void;
};

export function WarehouseSwitcherCard({ onChanged }: Props) {
  const {
    warehouses,
    activeWarehouseId,
    loading,
    switchingId,
    error,
    refresh,
    switchWarehouse,
  } = useWarehouseSwitcher();

  async function change(warehouseId: number) {
    if (warehouseId === activeWarehouseId) return;
    try {
      await switchWarehouse(warehouseId);
      await onChanged?.();
    } catch (reason) {
      Alert.alert(
        'Warehouse not changed',
        reason instanceof Error ? reason.message : 'Warehouse switch failed.',
      );
    }
  }

  return (
    <Card
      title="Warehouse workspace"
      subtitle="The active warehouse controls tasks, inventory, dashboard, and scan operations."
    >
      {warehouses.map((warehouse) => {
        const active = warehouse.id === activeWarehouseId;
        return (
          <Pressable
            key={warehouse.id}
            accessibilityRole="button"
            disabled={Boolean(switchingId)}
            onPress={() => void change(warehouse.id)}
            style={[styles.item, active && styles.active]}
          >
            <View style={styles.copy}>
              <Text style={[styles.name, active && styles.activeText]}>
                {warehouse.name}
              </Text>
              {warehouse.code ? <Text style={styles.code}>{warehouse.code}</Text> : null}
            </View>
            <Text style={[styles.state, active && styles.activeText]}>
              {switchingId === warehouse.id ? 'Switching…' : active ? 'Active' : 'Use'}
            </Text>
          </Pressable>
        );
      })}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title={loading ? 'Loading warehouses…' : 'Refresh warehouses'}
        variant="secondary"
        onPress={() => void refresh()}
        disabled={loading || Boolean(switchingId)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  active: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  copy: { flex: 1 },
  name: { color: colors.text, fontWeight: '900' },
  code: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  state: { color: colors.primary, fontWeight: '900', fontSize: 12 },
  activeText: { color: colors.primary },
  error: { color: colors.danger, lineHeight: 20 },
});
