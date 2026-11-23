import { StyleSheet, TextInput } from "react-native";
import { colors } from "../theme/colors";

export default function AppTextInput(props) {
  return (
    <TextInput
      placeholder={props.placeholder}
      placeholderTextColor={colors.textMuted}
      keyboardType={props.keyboardType}
      secureTextEntry={props.secureTextEntry}
      onChangeText={props.onChangeText}
      onSubmitEditing={props.onSubmitEditing}
      value={props.value}
      autoCapitalize={props.autoCapitalize}
      autoComplete={props.autoComplete}
      autoCorrect={props.autoCorrect}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 8,
    fontSize: 17,
    color: colors.text,
  },
});
