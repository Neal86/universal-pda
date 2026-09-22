import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useSession } from '@/auth/SessionProvider';
import { MobileConnectorClient } from '@/connectors/core/MobileConnectorClient';
import { requestPushToken } from '@/device/notifications/pushRegistration';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';

export function NotificationSettingsCard() {
  const { activeConnection } = useSession();
  const [registering, setRegistering] = useState(false);

  async function enableNotifications() {
    if (!activeConnection || registering) return;

    setRegistering(true);
    try {
      const token = await requestPushToken();
      await new MobileConnectorClient(activeConnection).registerPushToken(token);
      Alert.alert(
        'Notifications enabled',
        'This device is registered for operational notifications.',
      );
    } catch (reason) {
      Alert.alert(
        'Notifications not enabled',
        reason instanceof Error ? reason.message : 'Device registration failed.',
      );
    } finally {
      setRegistering(false);
    }
  }

  return (
    <Card
      title="Operational notifications"
      subtitle="Receive task, exception, and warehouse alerts from the active system."
    >
      <Button
        title="Enable notifications"
        variant="secondary"
        onPress={() => void enableNotifications()}
        loading={registering}
        disabled={!activeConnection}
      />
    </Card>
  );
}
