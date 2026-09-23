import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { WarehouseOption } from '@/connectors/core/types';
import { colors, radius, spacing } from '@/ui/theme';

type Props = {
  warehouses: WarehouseOption[];
  selectedId?: number;
  onSelect(warehouseId: number): void;
};

export function WarehouseSelection({
  warehouses,
  selectedId,
  onSelect,
}: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Select warehouse</Text>
      <Text style={styles.subtitle}>
        Your NiceC account can access more than one warehouse. Choose the workspace for this device.
      </Text>
      {warehouses.map((warehouse) => {
        const active = warehouse.id === selectedId;
        return (
          <Pressable
            key={warehouse.id}
            accessibilityRole="button"
            onPress={() => onSelect(warehouse.id)}
            style={[styles.item, active && styles.active]}
          >
            <Text style={[styles.itemTitle, active && styles.activeText]}>
              {warehouse.name}
            </Text>
            {warehouse.code ? <Text style={styles.code}>{warehouse.code}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  title: { color: colors.text, fontSize: 18, fontWeight: '900' },
  subtitle: { color: colors.textMuted, lineHeight: 20 },
  item: {
    minHeight: 54,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  active: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  itemTitle: { color: colors.text, fontWeight: '900' },
  activeText: { color: colors.primary },
  code: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
});
