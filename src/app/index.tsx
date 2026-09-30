import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useSession } from '@/auth/SessionProvider';
import { WelcomeScreen } from '@/features/onboarding/WelcomeScreen';
import { colors } from '@/ui/theme';

export default function IndexRoute() {
  const { loading, activeConnection } = useSession();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (activeConnection) {
    return <Redirect href="/(tabs)" />;
  }

  return <WelcomeScreen />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
