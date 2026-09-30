import * as SecureStore from 'expo-secure-store';

const tokenKey = (connectionId: string) => `universal-pda:token:${connectionId}`;

export async function saveAccessToken(connectionId: string, token: string): Promise<void> {
  const value = token.trim();
  if (!value) {
    throw new Error('Access token cannot be empty.');
  }

  await SecureStore.setItemAsync(tokenKey(connectionId), value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export function getAccessToken(connectionId: string): Promise<string | null> {
  return SecureStore.getItemAsync(tokenKey(connectionId));
}

export function removeAccessToken(connectionId: string): Promise<void> {
  return SecureStore.deleteItemAsync(tokenKey(connectionId));
}
