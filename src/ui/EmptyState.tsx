import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from './theme';

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: spacing.sm, paddingVertical: 36 },
  title: { color: colors.text, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  message: { color: colors.textMuted, lineHeight: 20, textAlign: 'center' },
});
