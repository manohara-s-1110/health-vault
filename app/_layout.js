// app/_layout.js
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* Screens that should not have a header */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="signin" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* The new screen with a visible header, title, and back button */}
      <Stack.Screen
        name="add_report"
        options={{
          headerShown: true,
          headerTitle: 'Add New Report',
          presentation: 'modal',
          headerBackTitleVisible: false,
        }}
      />
    </Stack>
  );
}