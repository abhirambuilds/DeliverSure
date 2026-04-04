import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { Component, ReactNode } from 'react';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs(false);

const ErrorUtils = (global as any).ErrorUtils;
if (ErrorUtils) {
  ErrorUtils.setGlobalHandler((error: any, isFatal: any) => {
    console.log("GLOBAL ERROR:", error);
  });
}

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any) { console.log("ErrorBoundary caught:", error); }
  render() {
    if (this.state.hasError) return null;
    return <>{this.props.children}</>;
  }
}

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/AuthContext';
import { AppThemeProvider } from '@/context/ThemeContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppThemeProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="admin" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="claims" />
              <Stack.Screen name="coverage" />
              <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true, title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AppThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
