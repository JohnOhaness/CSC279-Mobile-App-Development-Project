import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

// A row of tappable chips. Used for the status filter and the status picker.
// wrap = true  -> chips wrap onto several lines (good for forms)
// wrap = false -> one horizontally scrolling row (good for filters)
export default function StatusChips({
  options,
  selected,
  onSelect,
  wrap = false,
}) {
  const chips = options.map((option) => {
    const isSelected = option === selected;
    return (
      <Pressable
        key={option}
        onPress={() => onSelect(option)}
        style={[styles.chip, isSelected && styles.chipSelected]}
      >
        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
          {option}
        </Text>
      </Pressable>
    );
  });

  if (wrap) return <View style={styles.wrap}>{chips}</View>;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollRow}
    >
      {chips}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  scrollRow: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: { fontSize: 14, color: colors.text, textTransform: "capitalize" },
  chipTextSelected: { color: colors.onPrimary, fontWeight: "600" },
});
