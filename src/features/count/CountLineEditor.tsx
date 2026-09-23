import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import type { ScanResult } from '@/connectors/core/types';
import { MobileConnectorClient } from '@/connectors/core/MobileConnectorClient';
import { useSession } from '@/auth/SessionProvider';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Field } from '@/ui/Field';
import { colors } from '@/ui/theme';

type Props = {
  result: ScanResult | null;
  onSubmitted?(): void;
};

function numberFromData(
  data: Record<string, unknown> | undefined,
  key: string,
): number | undefined {
  const value = Number(data?.[key]);
  return Number.isFinite(value) ? value : undefined;
}

export function CountLineEditor({ result, onSubmitted }: Props) {
  const { activeConnection } = useSession();
  const countId = numberFromData(result?.data, 'cycleCountId');
  const lineId = numberFromData(result?.data, 'lineId');
  const scannedQty = numberFromData(result?.data, 'countedQty');
  const systemQty = numberFromData(result?.data, 'systemQty');

  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedDifference, setSavedDifference] = useState<number>();

  useEffect(() => {
    if (typeof scannedQty === 'number') {
      setValue(String(scannedQty));
      setSavedDifference(undefined);
    }
  }, [countId, lineId, scannedQty]);

  const countedQty = useMemo(() => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  }, [value]);

  if (result?.kind !== 'count' || !countId || !lineId || !activeConnection) {
    return null;
  }

  async function save() {
    if (countedQty === undefined || saving) return;

    setSaving(true);
    try {
      const updated = await new MobileConnectorClient(activeConnection).updateCountLine(
        countId,
        lineId,
        countedQty,
      );
      setSavedDifference(updated.differenceQty);
      if (updated.submittedForReview) {
        Alert.alert('Count submitted', 'All count lines are entered and awaiting manager review.');
        onSubmitted?.();
      }
    } catch (reason) {
      Alert.alert(
        'Count not updated',
        reason instanceof Error ? reason.message : 'Unable to update counted quantity.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      title="Count quantity"
      subtitle="The scan counts one unit by default. Correct the physical quantity here when needed, including zero."
    >
      <Field
        label="Counted quantity"
        value={value}
        onChangeText={setValue}
        keyboardType="decimal-pad"
        selectTextOnFocus
      />
      {typeof systemQty === 'number' ? (
        <Text style={styles.meta}>System quantity: {systemQty}</Text>
      ) : null}
      {typeof savedDifference === 'number' ? (
        <Text style={savedDifference === 0 ? styles.match : styles.difference}>
          Difference: {savedDifference}
        </Text>
      ) : null}
      <Button
        title="Save Count"
        onPress={() => void save()}
        loading={saving}
        disabled={countedQty === undefined}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  meta: { color: colors.textMuted },
  match: { color: colors.success, fontWeight: '900' },
  difference: { color: colors.warning, fontWeight: '900' },
});
