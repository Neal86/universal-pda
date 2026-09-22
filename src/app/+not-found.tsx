import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/ui/Button';
import { colors, spacing } from '@/ui/theme';

export default function NotFoundRoute() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Page not found</Text>
      <Text style={styles.copy}>This route is not part of Universal PDA.</Text>
      <Button title="Go home" onPress={() => router.replace('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  copy: { color: colors.textMuted, fontSize: 16 },
});
