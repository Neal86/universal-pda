import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSession } from '@/auth/SessionProvider';
import { colors, radius, spacing } from './theme';

export function ConnectionBadge() {
  const { activeConnection } = useSession();
  if (!activeConnection) return null;

  return (
    <View style={styles.root}>
      <View style={styles.dot} />
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>{activeConnection.name}</Text>
        <Text style={styles.url} numberOfLines={1}>{activeConnection.baseUrl}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success },
  text: { flex: 1 },
  name: { color: colors.text, fontWeight: '900' },
  url: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
