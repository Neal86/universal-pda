import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { NormalizedScanEvent } from '@/device/scanner/core/types';
import { Button } from '@/ui/Button';
import { colors, radius, spacing } from '@/ui/theme';

type Props = {
  enabled: boolean;
  onScan(event: NormalizedScanEvent): void;
};

export function CameraScanner({ enabled, onScan }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);

  async function ensurePermission() {
    if (permission?.granted) return true;
    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert(
        'Camera permission required',
        'Camera access is required to scan barcodes with the phone camera.',
      );
      return false;
    }
    return true;
  }

  if (!permission?.granted) {
    return (
      <View style={styles.permission}>
        <Text style={styles.permissionTitle}>Camera scanning</Text>
        <Text style={styles.permissionCopy}>
          Use the rear camera to scan operational barcodes.
        </Text>
        <Button title="Enable camera" onPress={() => void ensurePermission()} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={
          !enabled || locked
            ? undefined
            : ({ data }: { data: string }) => {
                setLocked(true);
                onScan({
                  value: data,
                  source: 'camera',
                  scannedAt: new Date().toISOString(),
                });
              }
        }
      />
      <View style={styles.reticle} pointerEvents="none" />
      <View style={styles.footer}>
        <Button
          title={locked ? 'Scan another' : 'Camera ready'}
          onPress={() => setLocked(false)}
          disabled={!locked}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 460,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: { flex: 1 },
  reticle: {
    position: 'absolute',
    top: '31%',
    alignSelf: 'center',
    width: '78%',
    height: 150,
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: radius.md,
  },
  footer: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  permission: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  permissionTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  permissionCopy: { color: colors.textMuted, lineHeight: 20 },
});
