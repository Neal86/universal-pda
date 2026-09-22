import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export function configureNotificationPresentation(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestPushToken(): Promise<string> {
  if (!Device.isDevice) {
    throw new Error('Push notifications require a physical device.');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('operations', {
      name: 'Operations',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 100, 200],
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;

  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const projectId =
    Constants.easConfig?.projectId ??
    (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId;

  if (!projectId) {
    throw new Error('This build is not linked to an EAS project yet.');
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}
