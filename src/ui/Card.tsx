import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from './theme';

type Props = {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export function Card({ title, subtitle, children }: Props) {
  return (
    <View style={styles.root}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '900' },
  subtitle: { color: colors.textMuted, lineHeight: 20, marginTop: 4 },
  body: { marginTop: spacing.md, gap: spacing.sm },
});
