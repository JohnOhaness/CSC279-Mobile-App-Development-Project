import { useState } from "react";
import { StyleSheet, View } from "react-native";
import DealsList from "../../components/DealsList";
import NewsFeed from "../../components/NewsFeed";
import StatusChips from "../../components/StatusChips";
import { colors } from "../../theme/colors";

const TABS = ["deals", "news"];

export default function News() {
  const [tab, setTab] = useState("deals");

  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <StatusChips options={TABS} selected={tab} onSelect={setTab} />
      </View>
      {tab === "deals" ? <DealsList /> : <NewsFeed />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: 16, paddingTop: 12 },
});
