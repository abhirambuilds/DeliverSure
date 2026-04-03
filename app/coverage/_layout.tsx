import { Stack } from 'expo-router';

export default function CoverageLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="select" />
    </Stack>
  );
}
