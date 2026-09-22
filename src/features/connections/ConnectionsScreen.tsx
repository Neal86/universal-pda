import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { getConnectorDefinition } from '@/connectors/core/registry';
import { useSession } from '@/auth/SessionProvider';
import { useCapabilities } from '@/features/capabilities/CapabilityProvider';
import { NotificationSettingsCard } from '@/features/notifications/NotificationSettingsCard';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { EmptyState } from '@/ui/EmptyState';
import { Screen } from '@/ui/Screen';
import { colors } from '@/ui/theme';

export function ConnectionsScreen() {
  const {
    connections,
    activeConnection,
    setActiveConnection,
    removeConnection,
  } = useSession();
  const { capabilities, error: capabilityError, refresh: refreshCapabilities } =
    useCapabilities();

  function confirmRemove(connectionId: string, name: string) {
    Alert.alert(
      'Remove connection?',
      `This removes ${name}, its secure token, and queued operations for this connection from this device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            void removeConnection(connectionId);
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <View>
        <Text style={styles.title}>Connections</Text>
        <Text style={styles.subtitle}>
          Switch between ERP, WMS, OMS, and custom business systems.
        </Text>
      </View>

      {connections.length === 0 ? (
        <EmptyState
          title="No connections"
          message="Add a business system to begin using Universal PDA."
        />
      ) : null}

      {connections.map((connection) => {
        const definition = getConnectorDefinition(connection.connectorKind);
        const active = activeConnection?.id === connection.id;

        return (
          <Card
            key={connection.id}
            title={connection.name}
            subtitle={`${definition.label} · ${connection.baseUrl}`}
          >
            {active ? (
              <View style={styles.active}>
                <Text style={styles.activeText}>Active connection</Text>
              </View>
            ) : (
              <Button
                title="Use this connection"
                variant="secondary"
                onPress={() => void setActiveConnection(connection.id)}
              />
            )}

            <Button
              title="Remove from this device"
              variant="danger"
              onPress={() => confirmRemove(connection.id, connection.name)}
            />
          </Card>
        );
      })}

      {activeConnection && capabilities ? (
        <Card
          title={capabilities.systemName ?? activeConnection.name}
          subtitle={[
            capabilities.organizationName,
            capabilities.warehouseName,
          ].filter(Boolean).join(' · ') || 'Connector capabilities loaded'}
        >
          <Text style={styles.capabilities}>
            {capabilities.features.length
              ? capabilities.features.join(' · ')
              : 'No feature flags returned'}
          </Text>
          <Button
            title="Refresh capabilities"
            variant="secondary"
            onPress={() => void refreshCapabilities()}
          />
        </Card>
      ) : capabilityError ? (
        <Card title="Capability check failed" subtitle={capabilityError}>
          <Button
            title="Retry"
            variant="secondary"
            onPress={() => void refreshCapabilities()}
          />
        </Card>
      ) : null}

      <Button
        title="Add another system"
        onPress={() => router.push('/connection/new')}
      />

      <NotificationSettingsCard />

      <Card
        title="Security"
        subtitle="Scoped mobile tokens are stored in OS secure storage. Vendor administrator passwords are not stored in normal app data."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  subtitle: { color: colors.textMuted, marginTop: 4, lineHeight: 21 },
  active: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successSoft,
    borderRadius: 12,
  },
  activeText: { color: colors.success, fontWeight: '900' },
  capabilities: { color: colors.textMuted, lineHeight: 20 },
});
