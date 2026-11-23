import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
} from "react-native";
import { STATUSES } from "../library/LibraryContext";
import { colors } from "../theme/colors";
import AppButton from "./AppButton";
import AppScreen from "./AppScreen";
import AppTextInput from "./AppTextInput";
import StatusChips from "./StatusChips";

// Add / edit form shown as a full-screen modal.
// game = null  -> "Add Game" mode
// game = {...} -> "Edit Game" mode (shows a Delete button)
export default function GameFormModal({
  visible,
  game,
  onClose,
  onSave,
  onDelete,
}) {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("backlog");
  const [error, setError] = useState("");

  // Reset the fields every time the modal opens
  useEffect(() => {
    if (!visible) return;
    setTitle(game ? game.title : "");
    setPlatform(game ? game.platform : "");
    setNotes(game ? game.notes : "");
    setStatus(game ? game.status : "backlog");
    setError("");
  }, [visible, game]);

  function handleSave() {
    if (title.trim().length === 0) {
      setError("Please enter a title.");
      return;
    }
    onSave({
      title: title.trim(),
      platform: platform.trim(),
      notes: notes.trim(),
      status,
    });
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AppScreen safeTop>
          <Text style={styles.heading}>{game ? "Edit Game" : "Add Game"}</Text>

          <Text style={styles.label}>Title</Text>
          <AppTextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Elden Ring"
          />

          <Text style={styles.label}>Platform</Text>
          <AppTextInput
            value={platform}
            onChangeText={setPlatform}
            placeholder="e.g. PC, PS5, Switch"
          />

          <Text style={styles.label}>Status</Text>
          <StatusChips
            options={STATUSES}
            selected={status}
            onSelect={setStatus}
            wrap
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
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  },
  error: { color: colors.status.dropped, marginTop: 8 },
  saveButton: { marginTop: 20 },
});
