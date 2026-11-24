import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

export default function AppButton(props) {
  return (
    <Pressable accessibilityRole="button" disabled={props.disabled} onPress={props.onPress} style={[styles.button, props.style]}>
      <Text style={styles.buttonText}>{props.text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
    alignItems: "center",
    minHeight: 44,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});
