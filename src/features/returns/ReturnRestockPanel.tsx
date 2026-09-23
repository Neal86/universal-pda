import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import type {
  ReturnActionDetails,
  ScanResult,
} from '@/connectors/core/types';
import { MobileConnectorClient } from '@/connectors/core/MobileConnectorClient';
import { useSession } from '@/auth/SessionProvider';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Field } from '@/ui/Field';
import { colors } from '@/ui/theme';

type Props = {
  result: ScanResult | null;
  onCompleted?(): void;
};

function returnActionId(result: ScanResult | null): number | undefined {
  const value = Number(result?.data?.returnActionId);
  return Number.isInteger(value) && value > 0 ? value : undefined;
}

function parseQty(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function ReturnRestockPanel({ result, onCompleted }: Props) {
  const { activeConnection } = useSession();
  const actionId = returnActionId(result);
  const requiresDetails = result?.data?.requiresDetails === true;

  const [details, setDetails] = useState<ReturnActionDetails | null>(null);
  const [received, setReceived] = useState('');
  const [good, setGood] = useState('');
  const [defective, setDefective] = useState('');
  const [destinationBarcode, setDestinationBarcode] = useState('');
  const [defectiveDestinationBarcode, setDefectiveDestinationBarcode] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const client = useMemo(
    () => (activeConnection ? new MobileConnectorClient(activeConnection) : null),
    [activeConnection],
  );

  const load = useCallback(async () => {
    if (!client || !actionId) return;
    try {
      setError('');
      const value = await client.returnAction(actionId);
      setDetails(value);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load return details.');
    }
  }, [actionId, client]);

  useEffect(() => {
    if (!requiresDetails) return;
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load, requiresDetails]);

  if (!requiresDetails || !actionId || !activeConnection) {
    return null;
  }

  const receivedQty = parseQty(received);
  const goodQty = parseQty(good);
  const defectiveQty = parseQty(defective);
  const countValid =
    receivedQty !== undefined &&
    goodQty !== undefined &&
    defectiveQty !== undefined &&
    goodQty + defectiveQty <= receivedQty;

  async function submitCount() {
    if (!client || !countValid || busy) return;

    setBusy(true);
    try {
      const value = await client.countReturn(actionId, {
        receivedQty: receivedQty as number,
        goodQty: goodQty as number,
        defectiveQty: defectiveQty as number,
      });
      setDetails(value);
      setError('');
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Return count failed.';
      setError(message);
      Alert.alert('Return count not saved', message);
    } finally {
      setBusy(false);
    }
  }

  async function completePutaway() {
    if (!client || !destinationBarcode.trim() || busy) return;

    setBusy(true);
    try {
      const value = await client.putawayReturn(actionId, {
        destinationBarcode: destinationBarcode.trim(),
        defectiveDestinationBarcode: defectiveDestinationBarcode.trim() || undefined,
        lotNumber: lotNumber.trim() || undefined,
      });
      setDetails(value);
      setError('');
      Alert.alert('Return completed', 'Return inventory was put away successfully.');
      onCompleted?.();
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Return putaway failed.';
      setError(message);
      Alert.alert('Return not completed', message);
    } finally {
      setBusy(false);
    }
  }

  const inboundState = details?.inboundState ?? String(result?.data?.inboundState || '');

  return (
    <Card
      title={details?.name ? `Return ${details.name}` : 'Return details'}
      subtitle="Return-inbound quantities and destination bins require explicit confirmation."
    >
      {details?.state === 'done' || inboundState === 'putaway_completed' ? (
        <Text style={styles.success}>Return completed</Text>
      ) : inboundState === 'waiting_putaway' ? (
        <>
          <Text style={styles.meta}>
            Good: {details?.goodQty ?? goodQty ?? 0} · Damaged: {details?.defectiveQty ?? defectiveQty ?? 0}
          </Text>
          <Field
            label="Good inventory destination bin"
            placeholder="Scan or enter bin barcode"
            value={destinationBarcode}
            onChangeText={setDestinationBarcode}
            autoCapitalize="characters"
          />
          {(details?.defectiveQty ?? defectiveQty ?? 0) > 0 ? (
            <Field
              label="Damaged inventory destination bin"
              placeholder="Scan or enter defective bin barcode"
              value={defectiveDestinationBarcode}
              onChangeText={setDefectiveDestinationBarcode}
              autoCapitalize="characters"
            />
          ) : null}
          <Field
            label="Lot / batch (when required)"
            placeholder="Optional unless product uses lot tracking"
            value={lotNumber}
            onChangeText={setLotNumber}
            autoCapitalize="characters"
          />
          <Button
            title="Confirm Return Putaway"
            onPress={() => void completePutaway()}
            loading={busy}
            disabled={!destinationBarcode.trim()}
          />
        </>
      ) : (
        <>
          <Text style={styles.meta}>
            Expected quantity: {details?.quantity ?? result?.data?.quantity?.toString() ?? '—'}
          </Text>
          <Field
            label="Received quantity"
            placeholder="0"
            value={received}
            onChangeText={setReceived}
            keyboardType="decimal-pad"
          />
          <Field
            label="Good quantity"
            placeholder="0"
            value={good}
            onChangeText={setGood}
            keyboardType="decimal-pad"
          />
          <Field
            label="Damaged / defective quantity"
            placeholder="0"
            value={defective}
            onChangeText={setDefective}
            keyboardType="decimal-pad"
          />
          <Button
            title="Confirm Return Count"
            onPress={() => void submitCount()}
            loading={busy}
            disabled={!countValid}
          />
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  meta: { color: colors.textMuted, lineHeight: 20 },
  error: { color: colors.danger, lineHeight: 20 },
  success: { color: colors.success, fontWeight: '900' },
});
