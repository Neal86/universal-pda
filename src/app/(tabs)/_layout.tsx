import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useSession } from '@/auth/SessionProvider';
import { useCapabilities } from '@/features/capabilities/CapabilityProvider';
import { colors } from '@/ui/theme';

export default function TabsLayout() {
  const { loading, activeConnection } = useSession();
  const { loading: capabilityLoading, supports } = useCapabilities();

  if (loading || (activeConnection && capabilityLoading)) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!activeConnection) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          minHeight: 66,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
        tabBarLabelStyle: { fontWeight: '800', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', href: supports('dashboard') ? undefined : null }}
      />
      <Tabs.Screen
        name="scan"
        options={{ title: 'Scan', href: supports('scan') ? undefined : null }}
      />
      <Tabs.Screen
        name="tasks"
        options={{ title: 'Tasks', href: supports('tasks') ? undefined : null }}
      />
      <Tabs.Screen
        name="inventory"
        options={{ title: 'Inventory', href: supports('inventory') ? undefined : null }}
      />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
