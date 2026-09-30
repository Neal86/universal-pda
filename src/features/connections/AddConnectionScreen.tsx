import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import type {
  ConnectorKind,
  CredentialLoginPayload,
} from '@/connectors/core/types';
import { getConnectorDefinition } from '@/connectors/core/registry';
import { useSession } from '@/auth/SessionProvider';
import {
  addTokenConnection,
  authenticateNiceC,
  saveNiceCConnection,
  selectNiceCWarehouse,
} from './connectionService';
import { ConnectorPicker } from './ConnectorPicker';
import { WarehouseSelection } from './WarehouseSelection';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { Screen } from '@/ui/Screen';
import { colors, spacing } from '@/ui/theme';

export function AddConnectionScreen() {
  const db = useSQLiteContext();
  const { refresh } = useSession();

  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [connectorKind, setConnectorKind] = useState<ConnectorKind>('universal');
  const [accessToken, setAccessToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pendingNiceC, setPendingNiceC] = useState<CredentialLoginPayload | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const definition = getConnectorDefinition(connectorKind);
  const credentialsMode = definition.authMode === 'credentials';

  const canSubmit = useMemo(() => {
    if (!name.trim() || !baseUrl.trim()) return false;
    if (pendingNiceC) return Boolean(selectedWarehouseId);
    if (credentialsMode) return Boolean(username.trim() && password);
    return Boolean(accessToken.trim());
  }, [
    accessToken,
    baseUrl,
    credentialsMode,
    name,
    password,
    pendingNiceC,
    selectedWarehouseId,
    username,
  ]);

  function changeConnector(kind: ConnectorKind) {
    setConnectorKind(kind);
    setAccessToken('');
    setUsername('');
    setPassword('');
    setPendingNiceC(null);
    setSelectedWarehouseId(undefined);
    setStatus('');
  }

  async function finishConnection() {
    if (!canSubmit || saving) return;

    setSaving(true);
    try {
      if (pendingNiceC) {
        if (!selectedWarehouseId) return;
        setStatus('Selecting warehouse…');
        const switched = await selectNiceCWarehouse(
          baseUrl,
          pendingNiceC.token,
          selectedWarehouseId,
        );
        await saveNiceCConnection(db, {
          name,
          baseUrl,
          token: switched.token,
          activeWarehouseId: switched.activeWarehouseId,
        });
      } else if (credentialsMode) {
        setStatus('Signing in to NiceC…');
        const login = await authenticateNiceC({
          baseUrl,
          username,
          password,
        });

        // Password is never persisted and is removed from component state
        // immediately after the gateway exchanges it for a scoped mobile token.
        setPassword('');

        const activeWarehouseId = login.user.activeWarehouseId ?? undefined;
        if (activeWarehouseId) {
          await saveNiceCConnection(db, {
            name,
            baseUrl,
            token: login.token,
            activeWarehouseId,
          });
        } else if (login.warehouses.length === 1) {
          const warehouseId = login.warehouses[0]?.id;
          if (!warehouseId) {
            throw new Error('No warehouse is available for this account.');
          }
          const switched = await selectNiceCWarehouse(
            baseUrl,
            login.token,
            warehouseId,
          );
          await saveNiceCConnection(db, {
            name,
            baseUrl,
            token: switched.token,
            activeWarehouseId: switched.activeWarehouseId,
          });
        } else if (login.warehouses.length > 1) {
          setPendingNiceC(login);
          setStatus('Choose the warehouse for this device.');
          return;
        } else {
          throw new Error('This NiceC account has no warehouse access.');
        }
      } else {
        setStatus('Testing connection…');
        await addTokenConnection(db, {
          name,
          baseUrl,
          accessToken,
          connectorKind: connectorKind as Exclude<ConnectorKind, 'nicec'>,
        });
      }

      setStatus('Connected.');
      await refresh();
      router.replace('/(tabs)');
    } catch (reason) {
      setStatus('');
      Alert.alert(
        'Connection failed',
        reason instanceof Error ? reason.message : 'Unable to add this connection.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View style={styles.heading}>
        <Text style={styles.title}>Connect a business system</Text>
        <Text style={styles.subtitle}>
          Universal PDA stores only scoped mobile tokens. NiceC passwords are exchanged
          for a token and are never saved on this device.
        </Text>
      </View>

      <Field
        label="Connection name"
        placeholder="Los Angeles WMS"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <ConnectorPicker value={connectorKind} onChange={changeConnector} />

      <Field
        label="Gateway URL"
        placeholder="https://wms.example.com"
        value={baseUrl}
        onChangeText={setBaseUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        editable={!pendingNiceC}
        hint="HTTPS is required outside localhost development."
      />

      {pendingNiceC ? (
        <WarehouseSelection
          warehouses={pendingNiceC.warehouses}
          selectedId={selectedWarehouseId}
          onSelect={setSelectedWarehouseId}
        />
      ) : credentialsMode ? (
        <>
          <Field
            label="NiceC username"
            placeholder="name@example.com"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
          />
          <Field
            label="NiceC password"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            textContentType="password"
            hint="Used only for secure token exchange. The password is not stored."
          />
        </>
      ) : (
        <Field
          label="Scoped mobile token"
          placeholder="Paste access token"
          value={accessToken}
          onChangeText={setAccessToken}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          hint="Stored in the operating system secure credential store."
        />
      )}

      {status ? <Text style={styles.status}>{status}</Text> : null}

      <Button
        title={pendingNiceC ? 'Use Selected Warehouse' : credentialsMode ? 'Sign In & Connect' : 'Test & Save Connection'}
        onPress={() => void finishConnection()}
        disabled={!canSubmit}
        loading={saving}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.xs },
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  subtitle: { color: colors.textMuted, lineHeight: 22 },
  status: { color: colors.primary, fontWeight: '800', textAlign: 'center' },
});
