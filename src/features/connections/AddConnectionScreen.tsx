import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import type { ConnectorKind } from '@/connectors/core/types';
import { connectorDefinitions } from '@/connectors/core/registry';
import { useSession } from '@/auth/SessionProvider';
import { addConnection } from './connectionService';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { Screen } from '@/ui/Screen';
import { colors, radius, spacing } from '@/ui/theme';

export function AddConnectionScreen() {
  const db = useSQLiteContext();
  const { refresh } = useSession();
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [connectorKind, setConnectorKind] = useState<ConnectorKind>('universal');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const canSubmit = useMemo(
    () => Boolean(name.trim() && baseUrl.trim() && accessToken.trim()),
    [accessToken, baseUrl, name],
  );

  async function submit() {
    if (!canSubmit || saving) return;

    setSaving(true);
    setStatus('Testing connection…');

    try {
      await addConnection(db, {
        name,
        baseUrl,
        accessToken,
        connectorKind,
      });
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
          Connect through a Universal PDA gateway. Vendor administrator credentials stay
          on the server.
        </Text>
      </View>

      <Field
        label="Connection name"
        placeholder="Los Angeles WMS"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <View style={styles.group}>
        <Text style={styles.label}>Connector</Text>
        <View style={styles.connectorGrid}>
          {connectorDefinitions.map((definition) => {
            const active = connectorKind === definition.kind;
            return (
              <Pressable
                key={definition.kind}
                onPress={() => setConnectorKind(definition.kind)}
                style={[styles.connector, active && styles.connectorActive]}
              >
                <Text style={[styles.connectorLabel, active && styles.connectorLabelActive]}>
                  {definition.label}
                </Text>
                <Text style={styles.connectorDescription}>{definition.description}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Field
        label="Gateway URL"
        placeholder="https://wms.example.com"
        value={baseUrl}
        onChangeText={setBaseUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        hint="HTTPS is required outside localhost development."
      />

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

      {status ? <Text style={styles.status}>{status}</Text> : null}

      <Button
        title="Test & Save Connection"
        onPress={() => void submit()}
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
  group: { gap: spacing.sm },
  label: { color: colors.text, fontSize: 14, fontWeight: '800' },
  connectorGrid: { gap: spacing.sm },
  connector: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  connectorActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  connectorLabel: { color: colors.text, fontWeight: '900' },
  connectorLabelActive: { color: colors.primary },
  connectorDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  status: { color: colors.primary, fontWeight: '800', textAlign: 'center' },
});
