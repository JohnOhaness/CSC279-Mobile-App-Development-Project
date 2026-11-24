import { StyleSheet, Switch, Text, View } from "react-native";
import AppScreen from "../components/AppScreen";
import AppTextInput from "../components/AppTextInput";
import StatusChips from "../components/StatusChips";
import { useSettings } from "../context/SettingsContext";
import { colors } from "../theme/colors";

// label shown in the app -> Steam store country code
const REGIONS = [
  { label: "United States", cc: "us" },
  { label: "United Kingdom", cc: "gb" },
  { label: "Europe", cc: "de" },
  { label: "Canada", cc: "ca" },
  { label: "Australia", cc: "au" },
  { label: "Brazil", cc: "br" },
  { label: "Turkey", cc: "tr" },
  { label: "India", cc: "in" },
];
const DEFAULT_STATUS_OPTIONS = ["backlog", "wishlist", "playing"];

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Setting({ label, description, children, last }) {
  return (
    <View style={[styles.setting, last && styles.settingLast]}>
      <Text style={styles.label}>{label}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      <View style={styles.control}>{children}</View>
    </View>
  );
}

export default function Settings() {
  const { settings, updateSetting } = useSettings();

  const currentRegion = REGIONS.find((r) => r.cc === settings.region);

  return (
    <AppScreen>
      <Section title="Preferences">
        <Setting
          label="Steam store region"
          description="Sets the currency and prices shown in Deals."
        >
          <StatusChips
            wrap
            options={REGIONS.map((r) => r.label)}
            selected={currentRegion ? currentRegion.label : ""}
            onSelect={(label) =>
              updateSetting("region", REGIONS.find((r) => r.label === label).cc)
            }
          />
        </Setting>

        <Setting
          last
          label="English-only news"
          description="Hide articles that aren't in English."
        >
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {settings.englishOnly ? "On" : "Off"}
            </Text>
            <Switch
              accessibilityLabel="English-only news"
              value={settings.englishOnly}
              onValueChange={(value) => updateSetting("englishOnly", value)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={colors.surface}
            />
          </View>
        </Setting>
      </Section>

      <Section title="Profile">
        <Setting
          last
          label="Display name"
          description="Shown on your profile. Leave empty to use the name from your email."
        >
          <AppTextInput
            value={settings.displayName}
            onChangeText={(text) => updateSetting("displayName", text)}
            placeholder="Your name"
            autoCorrect={false}
          />
        </Setting>
      </Section>

      <Section title="Library">
        <Setting
          last
          label="Default status for new games"
          description="The status the Add Game form starts with."
        >
          <StatusChips
            wrap
            options={DEFAULT_STATUS_OPTIONS}
            selected={settings.defaultStatus}
            onSelect={(status) => updateSetting("defaultStatus", status)}
          />
        </Setting>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  setting: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLast: { borderBottomWidth: 0 },
  label: { fontSize: 16, fontWeight: "600", color: colors.text },
  description: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  control: { marginTop: 10 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchText: { fontSize: 14, color: colors.textMuted },
});
