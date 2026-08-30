import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="addTalhaoRoute"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="adminTalhaoRoute"
        options={{ headerShown: false }}
      />

      <Stack.Screen name="addInsumoRoute"
      options={{headerShown: false}}/>
    </Stack>
  );
}