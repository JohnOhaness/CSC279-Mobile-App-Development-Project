import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppScreen from "../components/AppScreen";
import AppTextInput from "../components/AppTextInput";
import { useAuth } from "../context/AuthContext";
import { passwordHint } from "../library/accounts";
import { colors } from "../theme/colors";

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);

  function switchMode() {
    setCreating(!creating);
    setPassword("");
    setConfirmation("");
    setError("");
  }

  async function submit() {
    if (submitting.current) return;
    setError("");
    if (creating && password !== confirmation) {
      setError("Your passwords do not match.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      await (creating ? register : login)(email, password);
    } catch (e) {
      setError(e.message || "Could not access this account. Please try again.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <AppScreen safeTop centered>
      <View style={styles.panel}>
        <Text style={styles.brand}>GameLibrarian</Text>
        <View style={styles.form}>
          <Text accessibilityRole="header" style={styles.title}>
            {creating ? "Create an account" : "Sign in"}
          </Text>
          <Text style={styles.label}>Email</Text>
          <AppTextInput accessibilityLabel="Email" value={email} onChangeText={setEmail}
            autoComplete="email" autoCapitalize="none" autoCorrect={false}
            keyboardType="email-address" placeholder="you@example.com" />
          <Text style={styles.label}>Password</Text>
          <AppTextInput accessibilityLabel="Password" value={password} onChangeText={setPassword}
            secureTextEntry autoComplete={creating ? "new-password" : "current-password"}
            autoCapitalize="none" autoCorrect={false} placeholder="Enter your password"
            onSubmitEditing={creating ? undefined : submit} />
          {creating && <>
            <Text style={styles.hint}>{passwordHint}</Text>
            <Text style={styles.label}>Confirm password</Text>
            <AppTextInput accessibilityLabel="Confirm password" value={confirmation}
              onChangeText={setConfirmation} secureTextEntry autoComplete="new-password"
              autoCapitalize="none" autoCorrect={false} placeholder="Re-enter your password"
              onSubmitEditing={submit} />
          </>}
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <AppButton text={busy ? "Please wait..." : creating ? "Create account" : "Sign in"}
            disabled={busy} onPress={submit} style={styles.submit} />
        </View>
        {!creating && <Text style={styles.welcome}>Welcome back!</Text>}
        <Pressable accessibilityRole="button" disabled={busy} onPress={switchMode} style={styles.link}>
          <Text style={styles.linkText}>
            {creating ? "Already have an account? Sign in" : "New here? Create an account"}
          </Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  panel: { width: "100%", maxWidth: 440, alignSelf: "center" },
  brand: { color: colors.primaryLight, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  form: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 20 },
  title: { color: colors.primary, fontSize: 28, fontWeight: "700", marginBottom: 12 },
  label: { color: colors.text, fontSize: 15, fontWeight: "600", marginTop: 8 },
  hint: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  error: { color: colors.status.dropped, marginVertical: 6 },
  submit: { marginTop: 16 },
  welcome: { color: colors.primary, textAlign: "center", fontSize: 19, fontWeight: "600", marginTop: 22 },
  link: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  linkText: { color: colors.primaryLight, fontWeight: "600", textAlign: "center" },
});
