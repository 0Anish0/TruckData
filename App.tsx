import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MockAuthProvider } from './src/contexts/MockAuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <MockAuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </MockAuthProvider>
    </SafeAreaProvider>
  );
}
