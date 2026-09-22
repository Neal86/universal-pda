import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NormalizedScanEvent } from '@/device/scanner/core/types';
import { CameraScanner } from '@/device/scanner/camera/CameraScanner';
import { KeyboardWedgeCapture } from '@/device/scanner/keyboard-wedge/KeyboardWedgeCapture';
import { useCapabilities } from '@/features/capabilities/CapabilityProvider';
import { workflowDefinitions } from '@/workflows/core/registry';
import { useScanWorkflow } from './useScanWorkflow';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ConnectionBadge } from '@/ui/ConnectionBadge';
import { Field } from '@/ui/Field';
import { Screen } from '@/ui/Screen';
import { colors, radius, spacing } from '@/ui/theme';

type ScanMode = 'hardware' | 'camera' | 'manual';

export function ScanScreen() {
  const {
    workflow,
    setWorkflow,
    workflowSessionId,
    processing,
    result,
    processScan,
  } = useScanWorkflow();
  const { supports } = useCapabilities();

  const [mode, setMode] = useState<ScanMode>('hardware');
  const [manual, setManual] = useState('');

  const supportedWorkflows = useMemo(
    () =>
      workflowDefinitions.filter((definition) =>
        supports(definition.requiredCapability),
      ),
    [supports],
  );

  const canScan = supportedWorkflows.length > 0;

  useEffect(() => {
    const first = supportedWorkflows[0];
    if (
      first &&
      !supportedWorkflows.some((definition) => definition.id === workflow)
    ) {
      const timer = setTimeout(() => {
        setWorkflow(first.id);
      }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [setWorkflow, supportedWorkflows, workflow]);

  function submitManual() {
    const value = manual.trim();
    if (!value || !canScan) return;

    const event: NormalizedScanEvent = {
      value,
      source: 'manual',
      scannedAt: new Date().toISOString(),
    };

    setManual('');
    void processScan(event);
  }

  const resultStyle =
    result?.severity === 'error'
      ? styles.resultError
      : result?.severity === 'warning'
        ? styles.resultWarning
        : styles.resultSuccess;

  return (
    <Screen scroll={mode !== 'camera'}>
      <ConnectionBadge />

      <View>
        <Text style={styles.title}>Scan</Text>
        <Text style={styles.subtitle}>
          Select a workflow, then scan with the PDA, camera, or manual entry.
        </Text>
      </View>

      {canScan ? (
        <View style={styles.workflowGrid}>
          {supportedWorkflows.map((definition) => {
            const active = workflow === definition.id;
            return (
              <Pressable
                key={definition.id}
                onPress={() => setWorkflow(definition.id)}
                style={[styles.workflow, active && styles.workflowActive]}
              >
                <Text style={[styles.workflowText, active && styles.workflowTextActive]}>
                  {definition.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Card
          title="Scanning unavailable"
          subtitle="The active connector does not advertise any supported scan workflows."
        />
      )}

      {workflowSessionId ? (
        <Card
          title="Workflow in progress"
          subtitle={`Session: ${workflowSessionId}`}
        />
      ) : null}

      <View style={styles.modeRow}>
        <Button
          title="PDA"
          variant={mode === 'hardware' ? 'primary' : 'secondary'}
          onPress={() => setMode('hardware')}
          style={styles.modeButton}
          disabled={!canScan}
        />
        <Button
          title="Camera"
          variant={mode === 'camera' ? 'primary' : 'secondary'}
          onPress={() => setMode('camera')}
          style={styles.modeButton}
          disabled={!canScan}
        />
        <Button
          title="Manual"
          variant={mode === 'manual' ? 'primary' : 'secondary'}
          onPress={() => setMode('manual')}
          style={styles.modeButton}
          disabled={!canScan}
        />
      </View>

      {mode === 'hardware' ? (
        <KeyboardWedgeCapture
          enabled={!processing && canScan}
          onScan={(event) => void processScan(event)}
        />
      ) : null}

      {mode === 'camera' && canScan ? (
        <CameraScanner
          enabled={!processing}
          onScan={(event) => void processScan(event)}
        />
      ) : null}

      {mode === 'manual' ? (
        <View style={styles.manual}>
          <Field
            label="Barcode"
            placeholder="Enter or paste barcode"
            value={manual}
            onChangeText={setManual}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={submitManual}
            editable={canScan}
          />
          <Button
            title="Submit barcode"
            onPress={submitManual}
            loading={processing}
            disabled={!manual.trim() || !canScan}
          />
        </View>
      ) : null}

      {result ? (
        <View style={[styles.result, resultStyle]}>
          <Text style={styles.resultTitle}>{result.title}</Text>
          {result.message ? <Text style={styles.resultMessage}>{result.message}</Text> : null}
          {result.nextPrompt ? (
            <Text style={styles.nextPrompt}>Next: {result.nextPrompt}</Text>
          ) : null}
          {result.referenceId ? (
            <Text style={styles.reference}>Ref: {result.referenceId}</Text>
          ) : null}
          {result.workflowComplete ? (
            <Text style={styles.complete}>Workflow complete</Text>
          ) : null}
        </View>
      ) : null}

      {processing ? (
        <Card title="Processing scan" subtitle="Checking the active business system…" />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  subtitle: { color: colors.textMuted, marginTop: 4, lineHeight: 21 },
  workflowGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  workflow: {
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
  },
  workflowActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  workflowText: { color: colors.text, fontSize: 12, fontWeight: '800' },
  workflowTextActive: { color: colors.primary },
  modeRow: { flexDirection: 'row', gap: spacing.xs },
  modeButton: { flex: 1 },
  manual: { gap: spacing.md },
  result: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  resultSuccess: { backgroundColor: colors.successSoft, borderColor: '#A6D5BA' },
  resultWarning: { backgroundColor: colors.warningSoft, borderColor: '#E5C17C' },
  resultError: { backgroundColor: colors.dangerSoft, borderColor: '#E6AAAA' },
  resultTitle: { color: colors.text, fontSize: 19, fontWeight: '900' },
  resultMessage: { color: colors.text, marginTop: 5, lineHeight: 20 },
  nextPrompt: { color: colors.primary, fontWeight: '900', marginTop: 8 },
  reference: { color: colors.textMuted, fontSize: 12, marginTop: 7 },
  complete: { color: colors.success, fontWeight: '900', marginTop: 8 },
});
