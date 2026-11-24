import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { SettingsProvider } from "../context/SettingsContext";
import { LibraryProvider } from "../library/LibraryContext";
import { colors } from "../theme/colors";

function RootNavigator() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Only reachable when logged in */}
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            title: "Settings",
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
            headerShadowVisible: false,
          }}
        />
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
      <SettingsProvider>
        <LibraryProvider>
          {/* "dark" = black clock, battery and notification icons */}
          <StatusBar style="dark" />
          <RootNavigator />
        </LibraryProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
