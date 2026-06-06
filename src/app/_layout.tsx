import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function LayoutRoot() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: '700' },
          animation: 'ios-zoom-transition',
          headerShadowVisible: false
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Capture Scan Array' }} />
        <Stack.Screen name="editor" options={{ title: 'AI Digital Twin Editor' }} />
        <Stack.Screen name="vault" options={{ title: 'Hardware Encrypted Vault' }} />
      </Stack>
    </>
  );
}
