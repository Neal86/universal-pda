import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import type { ScanResult } from '@/connectors/core/types';
import { MobileConnectorClient } from '@/connectors/core/MobileConnectorClient';
import { useSession } from '@/auth/SessionProvider';
import { useCapabilities } from '@/features/capabilities/CapabilityProvider';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Field } from '@/ui/Field';
import { colors } from '@/ui/theme';

type Props = {
  result: ScanResult | null;
  onSubmitted?(): void;
};

const MANAGER_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_MANAGER']);

function numberFromData(
  data: Record<string, unknown> | undefined,
  key: string,
): number | undefined {
  const value = Number(data?.[key]);
  return Number.isFinite(value) ? value : undefined;
}

export function CountLineEditor({ result, onSubmitted }: Props) {
  const { activeConnection } = useSession();
  const { capabilities } = useCapabilities();
  const countId = numberFromData(result?.data, 'cycleCountId');
  const lineId = numberFromData(result?.data, 'lineId');
  const scannedQty = numberFromData(result?.data, 'countedQty');
  const systemQty = numberFromData(result?.data, 'systemQty');

  const [value, setValue] = useState(() =>
    typeof scannedQty === 'number' ? String(scannedQty) : '',
  );
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [savedDifference, setSavedDifference] = useState<number>();
  const [submittedForReview, setSubmittedForReview] = useState(
    Boolean(result?.workflowComplete),
  );

  const countedQty = useMemo(() => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  }, [value]);

  const isManager = MANAGER_ROLES.has(String(capabilities?.userRole || ''));

  if (result?.kind !== 'count' || !countId || !lineId || !activeConnection) {
    return null;
  }

  async function save() {
    if (
      countedQty === undefined ||
      saving ||
      !activeConnection ||
      !countId ||
      !lineId
    ) return;

    const connection = activeConnection;
    const resolvedCountId = countId;
    const resolvedLineId = lineId;

    setSaving(true);
    try {
      const updated = await new MobileConnectorClient(connection).updateCountLine(
        resolvedCountId,
        resolvedLineId,
        countedQty,
      );
      setSavedDifference(updated.differenceQty);
      setSubmittedForReview(updated.submittedForReview);
      if (updated.submittedForReview) {
        Alert.alert(
          'Count saved',
          'All count lines are entered. The count is awaiting manager review.',
        );
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

  async function approve() {
    if (!activeConnection || !countId || approving) return;

    setApproving(true);
    try {
      await new MobileConnectorClient(activeConnection).approveCount(countId);
      Alert.alert('Count approved', 'Inventory count differences were approved and posted.');
      onSubmitted?.();
    } catch (reason) {
      Alert.alert(
        'Count not approved',
        reason instanceof Error ? reason.message : 'Unable to approve this count.',
      );
    } finally {
      setApproving(false);
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
        disabled={countedQty === undefined || approving}
      />

      {submittedForReview ? (
        isManager ? (
          <Button
            title="Approve Count"
            onPress={() => void approve()}
            loading={approving}
            disabled={saving}
          />
        ) : (
          <Text style={styles.review}>
            Count complete · awaiting warehouse manager approval
          </Text>
        )
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  meta: { color: colors.textMuted },
  match: { color: colors.success, fontWeight: '900' },
  difference: { color: colors.warning, fontWeight: '900' },
  review: { color: colors.textMuted, fontWeight: '800' },
});
