import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSettings } from "../context/SettingsContext";
import { STATUSES } from "../library/LibraryContext";
import { colors } from "../theme/colors";
import AppButton from "./AppButton";
import AppScreen from "./AppScreen";
import AppTextInput from "./AppTextInput";
import StatusChips from "./StatusChips";
import SteamBrowser from "./SteamBrowser";

const PLATFORMS = [
  "Steam",
  "Epic Games",
  "GOG",
  "PlayStation",
  "Xbox",
  "Switch",
  "Mobile",
  "Other",
];

export default function GameFormModal({
  visible,
  game,
  onClose,
  onSave,
  onDelete,
}) {
  const { settings } = useSettings();
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("backlog");
  const [coverUrl, setCoverUrl] = useState(null);
  const [steamAppId, setSteamAppId] = useState(null);
  const [hours, setHours] = useState("");
  const [allAchievements, setAllAchievements] = useState(false);
  const [error, setError] = useState("");
  const [browsing, setBrowsing] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle(game ? game.title : "");
    setPlatform(game ? game.platform : "");
    setNotes(game ? game.notes : "");
    setStatus(game ? game.status : settings.defaultStatus);
    setCoverUrl(game ? game.coverUrl : null);
    setSteamAppId(game ? (game.steamAppId ?? null) : null);
    setHours(game?.hoursPlayed == null ? "" : String(game.hoursPlayed));
    setAllAchievements(game?.allAchievements === true);
    setError("");
    setBrowsing(false);
  }, [visible, game, settings.defaultStatus]);

  function pickSteamGame(item) {
    setTitle(item.name);
    setPlatform("Steam");
    setCoverUrl(item.image);
    setSteamAppId(item.appId);
    setBrowsing(false);
  }

  function handleSave() {
    if (title.trim().length === 0) {
      setError("Please enter a title.");
      return;
    }
    const input = hours.trim().replace(",", ".");
    const hoursPlayed = input ? Number(input) : null;
    if (
      input &&
      (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(input) ||
        !Number.isFinite(hoursPlayed))
    ) {
      setError("Enter zero or a positive number of hours, such as 2.5.");
      return;
    }
    onSave({
      hoursPlayed,
      allAchievements: status === "completed" && allAchievements,
      title: title.trim(),
      platform,
      notes: notes.trim(),
      status,
      coverUrl,
      steamAppId,
    });
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={browsing ? () => setBrowsing(false) : onClose}
    >
      {browsing ? (
        <SteamBrowser
          initialTerm={title}
          onPick={pickSteamGame}
          onBack={() => setBrowsing(false)}
        />
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <AppScreen safeTop>
            <Text style={styles.heading}>
              {game ? "Edit Game" : "Add Game"}
            </Text>

            <AppButton
              text="Find on Steam"
              onPress={() => setBrowsing(true)}
              style={styles.steamButton}
            />

            <Text style={styles.label}>Title</Text>
            <AppTextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Elden Ring"
            />

            <Text style={styles.label}>Platform</Text>
            <StatusChips
              options={PLATFORMS}
              selected={platform}
              onSelect={setPlatform}
              wrap
            />

            <Text style={styles.label}>Status</Text>
            <StatusChips
              options={STATUSES}
              selected={status}
              onSelect={setStatus}
              wrap
            />

            {status === "completed" && (
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  All achievements collected
                </Text>
                <Switch
                  accessibilityLabel="All achievements collected"
                  value={allAchievements}
                  onValueChange={setAllAchievements}
                />
              </View>
            )}

            <Text style={styles.label}>Hours played</Text>
            <AppTextInput
              accessibilityLabel="Hours played"
              value={hours}
              onChangeText={setHours}
              keyboardType="decimal-pad"
              placeholder="Optional, e.g. 12.5"
            />

            <Text style={styles.label}>Notes</Text>
            <AppTextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional"
            />

            {error.length > 0 && <Text style={styles.error}>{error}</Text>}

            <AppButton
              text="Save"
              onPress={handleSave}
              style={styles.saveButton}
            />
            <AppButton
              text="Cancel"
              onPress={onClose}
              style={{ backgroundColor: colors.textMuted }}
            />
            {game ? (
              <AppButton
                text="Delete Game"
                onPress={() => onDelete(game)}
                style={{ backgroundColor: colors.status.dropped }}
              />
            ) : null}
          </AppScreen>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  switchRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  switchLabel: { flex: 1, color: colors.text, fontSize: 15 },
  flex: { flex: 1 },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  error: { color: colors.status.dropped, marginTop: 8 },
  saveButton: { marginTop: 20 },
  steamButton: { backgroundColor: colors.primaryLight },
});
