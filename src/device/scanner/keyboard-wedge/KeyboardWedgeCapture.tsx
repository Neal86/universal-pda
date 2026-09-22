import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NormalizedScanEvent } from '@/device/scanner/core/types';
import { colors, radius, spacing } from '@/ui/theme';

type Props = {
  enabled: boolean;
  onScan(event: NormalizedScanEvent): void;
};

export function KeyboardWedgeCapture({ enabled, onScan }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [value, setValue] = useState('');

  const focus = useCallback(() => {
    if (enabled) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [enabled]);

  useEffect(() => {
    focus();
  }, [focus]);

  const submit = useCallback(() => {
    const barcode = value.trim();
    setValue('');

    if (barcode) {
      onScan({
        value: barcode,
        source: 'keyboard-wedge',
        scannedAt: new Date().toISOString(),
      });
    }

    setTimeout(focus, 30);
  }, [focus, onScan, value]);

  return (
    <View style={styles.root}>
      <View style={[styles.dot, enabled ? styles.live : styles.paused]} />
      <View style={styles.copy}>
        <Text style={styles.title}>
          {enabled ? 'Hardware scanner ready' : 'Hardware scanner paused'}
        </Text>
        <Text style={styles.subtitle}>
          Configure the PDA scanner to append Enter after each barcode.
        </Text>
      </View>
      <TextInput
        ref={inputRef}
        accessibilityLabel="Hardware barcode scanner input"
        autoCapitalize="none"
        autoCorrect={false}
        blurOnSubmit={false}
        caretHidden
        editable={enabled}
        onBlur={focus}
        onChangeText={setValue}
        onSubmitEditing={submit}
        returnKeyType="done"
        showSoftInputOnFocus={Platform.OS === 'android' ? false : undefined}
        style={styles.hiddenInput}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  live: { backgroundColor: colors.success },
  paused: { backgroundColor: colors.warning },
  copy: { flex: 1 },
  title: { color: colors.text, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    right: 0,
    bottom: 0,
    opacity: 0.01,
  },
});
