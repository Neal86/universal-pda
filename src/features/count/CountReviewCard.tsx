import React, { useMemo, useState } from 'react';
import { Alert, Text } from 'react-native';
import type { ScanResult } from '@/connectors/core/types';
import { MobileConnectorClient } from '@/connectors/core/MobileConnectorClient';
import { useSession } from '@/auth/SessionProvider';
import { useCapabilities } from '@/features/capabilities/CapabilityProvider';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { colors } from '@/ui/theme';

type Props = {
  result: ScanResult | null;
  onApproved?(): void;
};

const MANAGER_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_MANAGER']);

export function CountReviewCard({ result, onApproved }: Props) {
  const { activeConnection } = useSession();
  const { capabilities } = useCapabilities();
  const [busy, setBusy] = useState(false);

  const countId = useMemo(() => {
    const value = Number(result?.data?.cycleCountId || 0);
    return Number.isInteger(value) && value > 0 ? value : undefined;
  }, [result?.data]);

  const lineId = Number(result?.data?.lineId || 0);
  const isManager = MANAGER_ROLES.has(String(capabilities?.userRole || ''));

  if (
    result?.kind !== 'count' ||
    !result.workflowComplete ||
    !countId ||
    lineId > 0 ||
    !activeConnection
  ) {
    return null;
  }

  async function approve() {
    if (!activeConnection || !countId || busy) return;
    setBusy(true);
    try {
      await new MobileConnectorClient(activeConnection).approveCount(countId);
      Alert.alert('Count approved', 'Inventory count differences were approved and posted.');
      onApproved?.();
    } catch (reason) {
      Alert.alert(
        'Count not approved',
        reason instanceof Error ? reason.message : 'Unable to approve this count.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="Count awaiting review"
      subtitle="All count lines are entered. Inventory changes are not posted until a manager approves the count."
    >
      {isManager ? (
        <Button
          title="Approve Count"
          onPress={() => void approve()}
          loading={busy}
        />
      ) : (
        <Text style={{ color: colors.textMuted }}>
          A warehouse manager must approve this count.
        </Text>
      )}
    </Card>
  );
}
