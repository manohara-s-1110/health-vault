// app/_layout.js
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}