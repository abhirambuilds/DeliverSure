import React from 'react';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#0bdc84', // Green accent for primary buttons/actions
    background: '#121212', // Deep dark for OLEDs
    surface: '#1E1E1E', // Slightly lighter for cards
  },
};

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AppNavigator />
          <Toast />
        </PaperProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
