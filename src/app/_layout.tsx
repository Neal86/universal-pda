import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider } from '@/auth/SessionProvider';
import { CapabilityProvider } from '@/features/capabilities/CapabilityProvider';
import {
  configureNotificationPresentation,
} from '@/device/notifications/pushRegistration';
import { SyncManager } from '@/offline/SyncManager';
import { migrateDatabase } from '@/storage/database';
import { colors } from '@/ui/theme';

configureNotificationPresentation();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="universal-pda.db" onInit={migrateDatabase}>
        <SessionProvider>
          <CapabilityProvider>
            <SyncManager />
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerShadowVisible: false,
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="connection/new" options={{ title: 'Add connection' }} />
            </Stack>
          </CapabilityProvider>
        </SessionProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
