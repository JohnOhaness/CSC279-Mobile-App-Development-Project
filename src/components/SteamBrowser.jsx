import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { browseSteam } from "../library/Steam";
import { colors } from "../theme/colors";
import AppButton from "./AppButton";
import AppTextInput from "./AppTextInput";

// When you have the trash icon, save it in assets/icons and swap these two lines:
const TRASH_ICON = null;
// const TRASH_ICON = require("../../assets/icons/trash.png");

function mergeUnique(existing, incoming) {
  const seen = new Set(existing.map((item) => item.appId));
  return [...existing, ...incoming.filter((item) => !seen.has(item.appId))];
}

// Full-screen Steam list: top sellers by default, or search by typing.
// onPick(item) is called with { appId, name, image } when a game is tapped.
export default function SteamBrowser({ initialTerm = "", onPick, onBack }) {
  const insets = useSafeAreaInsets();

  const [term, setTerm] = useState(initialTerm);
  const [activeTerm, setActiveTerm] = useState(initialTerm.trim());
  const [items, setItems] = useState([]);
  const [nextStart, setNextStart] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const requestId = useRef(0); // lets us ignore slow, outdated responses

  async function loadPage(searchTerm, start) {
    const id = ++requestId.current;
    const isFirstPage = start === 0;
    if (isFirstPage) setLoading(true);
    else setLoadingMore(true);
    setError("");

    try {
      const page = await browseSteam({ term: searchTerm, start });
      if (id !== requestId.current) return;
      setItems((prev) =>
        isFirstPage ? page.items : mergeUnique(prev, page.items),
      );
      setNextStart(page.nextStart);
      setHasMore(page.hasMore);
    } catch (e) {
      if (id !== requestId.current) return;
      setError("Couldn't reach Steam. Check your connection and try again.");
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }

  useEffect(() => {
    loadPage(activeTerm, 0);
  }, []);

  function runSearch() {
    const trimmed = term.trim();
    setActiveTerm(trimmed);
    setItems([]);
    setHasMore(false);
    loadPage(trimmed, 0);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <Pressable onPress={onBack} style={styles.backRow}>
        <Text style={styles.backText}>‹ Back to form</Text>
      </Pressable>

      <View style={styles.headingRow}>
        <Text style={styles.heading} numberOfLines={1}>
          {activeTerm.length > 0
            ? `Results for "${activeTerm}"`
            : "Top sellers on Steam"}
        </Text>
        <Pressable
          onPress={() => setTerm("")}
          disabled={term.length === 0}
          hitSlop={8}
          accessibilityLabel="Clear search text"
          style={[
            styles.clearButton,
            term.length === 0 && styles.clearButtonDisabled,
          ]}
        >
          {TRASH_ICON ? (
            <Image
              source={TRASH_ICON}
              style={styles.clearIcon}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.clearPlaceholder}>✕</Text>
          )}
        </Pressable>
      </View>

      <AppTextInput
        value={term}
        onChangeText={setTerm}
        onSubmitEditing={runSearch}
        placeholder="Search Steam (empty = top sellers)"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <AppButton
        text="Search"
        onPress={runSearch}
        style={styles.searchButton}
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.appId}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => onPick(item)}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]} />
            )}
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={styles.spinner} />
          ) : error.length > 0 ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <Text style={styles.muted}>No games found.</Text>
          )
        }
        ListFooterComponent={
          items.length > 0 ? (
            <View>
              {error.length > 0 && <Text style={styles.error}>{error}</Text>}
              {hasMore ? (
                <AppButton
                  text={loadingMore ? "Loading..." : "Load more"}
                  onPress={() => loadPage(activeTerm, nextStart)}
                  style={styles.loadMore}
                />
              ) : null}
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  backRow: { paddingVertical: 6 },
  backText: { color: colors.primaryLight, fontSize: 16, fontWeight: "600" },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  heading: {
    flex: 1,
    marginRight: 12,
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonDisabled: { opacity: 0.35 },
  clearIcon: { width: 18, height: 18, tintColor: colors.onPrimary },
  clearPlaceholder: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  searchButton: { marginTop: 0, backgroundColor: colors.primaryLight },
  list: { paddingTop: 8, paddingBottom: 24, flexGrow: 1 },
  spinner: { marginTop: 40 },
  muted: { color: colors.textMuted, textAlign: "center", marginTop: 40 },
  error: { color: colors.status.dropped, textAlign: "center", marginTop: 16 },
  loadMore: { marginTop: 8 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  image: { width: 96, height: 36, borderRadius: 4 },
  imagePlaceholder: { backgroundColor: colors.border },
  name: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.text },
});
