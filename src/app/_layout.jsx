import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { LibraryProvider } from "../library/LibraryContext";

function RootNavigator() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tabs only reachable when logged in */}
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      {/* Login lives outside the tabs, so no navbar is shown */}
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LibraryProvider>
        {/* "dark" = black clock, battery and notification icons */}
        <StatusBar style="dark" />
        <RootNavigator />
      </LibraryProvider>
    </AuthProvider>
  );
}
