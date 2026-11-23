import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

export default function AppScreen(props) {
  const insets = useSafeAreaInsets();
  const contentStyle = [styles.content, props.contentStyle];
  if (props.centered === true) contentStyle.push(styles.centered);
  if (props.safeTop === true)
    contentStyle.push({ paddingTop: insets.top + 20 });
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={contentStyle}
        keyboardShouldPersistTaps="handled"
      >
        {props.children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  centered: { justifyContent: "center", padding: 24 },
});
