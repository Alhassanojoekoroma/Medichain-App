import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useDatabaseInit } from './src/hooks/useDatabaseInit';
import { Colors, FontSize, FontWeight, Radius, Spacing } from './src/theme';

/**
 * App shell — waits for SQLite to open and load data before rendering the
 * navigator.  Shows a premium loading screen in the interim so there's no
 * flash of empty / stale state.
 */
export default function App() {
  const isDbReady = useDatabaseInit();

  if (!isDbReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.splash}>
          <View style={styles.logoRing}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
          <Text style={styles.splashTitle}>MediChain SL</Text>
          <Text style={styles.splashSub}>Initializing secure vault…</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.neutral900,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(31, 56, 241, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 241, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  splashTitle: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: 1,
  },
  splashSub: {
    fontSize: FontSize.body,
    color: Colors.neutral500,
    marginTop: Spacing.sm,
  },
});
