import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ConnectorKind } from '@/connectors/core/types';
import { connectorDefinitions } from '@/connectors/core/registry';
import { colors, radius, spacing } from '@/ui/theme';

type Props = {
  value: ConnectorKind;
  onChange(kind: ConnectorKind): void;
};

export function ConnectorPicker({ value, onChange }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.label}>Connector</Text>
      <View style={styles.grid}>
        {connectorDefinitions.map((definition) => {
          const active = value === definition.kind;
          return (
            <Pressable
              key={definition.kind}
              accessibilityRole="button"
              onPress={() => onChange(definition.kind)}
              style={[styles.connector, active && styles.active]}
            >
              <Text style={[styles.title, active && styles.activeTitle]}>
                {definition.label}
              </Text>
              <Text style={styles.description}>{definition.description}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  label: { color: colors.text, fontSize: 14, fontWeight: '800' },
  grid: { gap: spacing.sm },
  connector: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  active: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  title: { color: colors.text, fontWeight: '900' },
  activeTitle: { color: colors.primary },
  description: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 3 },
});
