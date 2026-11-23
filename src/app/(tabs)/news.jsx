import { Text } from "react-native";
import AppScreen from "../../components/AppScreen";
import { colors } from "../../theme/colors";

export default function News() {
  return (
    <AppScreen centered>
      <Text
        style={{ color: colors.primary, fontSize: 20, textAlign: "center" }}
      >
        News
      </Text>
    </AppScreen>
  );
}
