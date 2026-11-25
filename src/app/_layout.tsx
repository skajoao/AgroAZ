import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack initialRouteName="index">
        <Stack.Screen
          name="login"
          options={{ headerShown: false }}
        />

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

        <Stack.Screen
          name="addInsumoRoute"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}
