import { ActivityIndicator, Text } from "react-native";
import AppScreen from "../components/AppScreen";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { SettingsProvider, useSettings } from "../context/SettingsContext";
import { LibraryProvider, useLibrary } from "../library/LibraryContext";
import { DEMO_EMAIL } from "../library/accounts";
import { colors } from "../theme/colors";

function RootNavigator() {
  const { isLoggedIn, loaded, error } = useAuth();
  const settings = useSettings();
  const library = useLibrary();
  const storageError = error || settings.error || library.error;
  if (!loaded || !settings.loaded || !library.loaded) {
    return <AppScreen centered>{storageError ? <Text>{storageError}</Text> : <ActivityIndicator color={colors.primary} />}</AppScreen>;
  }

  return (
    <>
    {storageError ? <Text accessibilityRole="alert">{storageError}</Text> : null}
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
    </>
  );
}

function AccountLayout() {
  const { email } = useAuth();
  // Keep the original demo account's existing device data.
  const suffix = email === DEMO_EMAIL ? "" : ":" + email;
  return (
    <SettingsProvider key={email} storageKey={"appSettings" + suffix}>
      <LibraryProvider storageKey={"gameLibrary" + suffix}>
        <StatusBar style="dark" />
        <RootNavigator />
      </LibraryProvider>
    </SettingsProvider>
  );
}

export default function RootLayout() {
  return <AuthProvider><AccountLayout /></AuthProvider>;
}
