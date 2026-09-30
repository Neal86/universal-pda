import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/ui/Button';
import { colors, spacing } from '@/ui/theme';

export function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ANDROID · IOS · INDUSTRIAL PDA</Text>
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>Universal PDA</Text>
          <Text style={styles.subtitle}>
            One secure operations app for ERP, WMS, OMS, and custom business systems.
          </Text>
        </View>

        <View style={styles.features}>
          <Text style={styles.feature}>• Camera and hardware barcode scanning</Text>
          <Text style={styles.feature}>• Offline-safe warehouse operations</Text>
          <Text style={styles.feature}>• Multiple connector types, one mobile workflow</Text>
        </View>

        <Button
          title="Connect a business system"
          onPress={() => router.push('/connection/new')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
    gap: spacing.lg,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  copy: { gap: spacing.sm },
  title: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  subtitle: { color: colors.textMuted, fontSize: 18, lineHeight: 27 },
  features: { gap: spacing.sm },
  feature: { color: colors.text, fontSize: 15, lineHeight: 22 },
});
