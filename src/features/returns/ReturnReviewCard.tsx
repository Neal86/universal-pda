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

export function ReturnReviewCard({ result, onApproved }: Props) {
  const { activeConnection } = useSession();
  const { capabilities } = useCapabilities();
  const [busy, setBusy] = useState(false);

  const actionId = useMemo(() => {
    const value = Number(result?.data?.returnActionId || 0);
    return Number.isInteger(value) && value > 0 ? value : undefined;
  }, [result?.data]);

  const actionType = String(result?.data?.actionType || '');
  const state = String(result?.data?.state || '');
  const isManager = MANAGER_ROLES.has(String(capabilities?.userRole || ''));

  if (
    result?.kind !== 'return' ||
    !result.workflowComplete ||
    !actionId ||
    actionType === 'restock' ||
    state !== 'review' ||
    !activeConnection
  ) {
    return null;
  }

  async function approve() {
    if (!activeConnection || !actionId || busy) return;
    setBusy(true);
    try {
      await new MobileConnectorClient(activeConnection).approveReturn(actionId);
      Alert.alert('Return approved', 'The reviewed return action is complete.');
      onApproved?.();
    } catch (reason) {
      Alert.alert(
        'Return not approved',
        reason instanceof Error ? reason.message : 'Unable to approve this return.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="Return awaiting review"
      subtitle="The return work is complete and waiting for manager approval."
    >
      {isManager ? (
        <Button
          title="Approve Return"
          onPress={() => void approve()}
          loading={busy}
        />
      ) : (
        <Text style={{ color: colors.textMuted }}>
          A warehouse manager must approve this return action.
        </Text>
      )}
    </Card>
  );
}
