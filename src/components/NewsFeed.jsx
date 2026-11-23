import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSettings } from "../context/SettingsContext";
import { useLibrary } from "../library/LibraryContext";
import { fetchNews } from "../library/steamDeals";
import { colors } from "../theme/colors";

const MAX_GAMES = 10; // keeps the number of Steam requests small
const PRIORITY = { playing: 0, wishlist: 1, backlog: 2, completed: 3 };

export default function NewsFeed() {
  const { games } = useLibrary();
  const { settings, loaded } = useSettings();

  // News for Steam-linked games, favoring what you're playing and wishlisting
  const tracked = useMemo(
    () =>
      games
        .filter((g) => g.steamAppId && g.status !== "dropped")
        .sort((a, b) => (PRIORITY[a.status] ?? 9) - (PRIORITY[b.status] ?? 9))
        .slice(0, MAX_GAMES)
        .map((g) => ({ appId: g.steamAppId, title: g.title })),
    [games],
  );
  const idsKey = tracked.map((g) => g.appId).join(",");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (isRefresh) => {
      if (!loaded) return;
      if (tracked.length === 0) {
        setItems([]);
        return;
      }
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");
      try {
        setItems(await fetchNews(tracked, 2, settings.englishOnly));
      } catch (e) {
        setError("Couldn't load news from Steam. Pull down to try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [idsKey, settings.englishOnly, loaded],
  );

  useEffect(() => {
    load(false);
  }, [load]);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshing={refreshing}
      onRefresh={() => load(true)}
      ListHeaderComponent={
        error.length > 0 ? <Text style={styles.error}>{error}</Text> : null
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => Linking.openURL(item.url).catch(() => {})}
        >
          <Text style={styles.game}>{item.gameTitle}</Text>
          <Text style={styles.title}>{item.title}</Text>
          {item.snippet.length > 0 ? (
            <Text style={styles.snippet} numberOfLines={3}>
              {item.snippet}
            </Text>
          ) : null}
          <View style={styles.meta}>
            <Text style={styles.metaText}>
              {new Date(item.date * 1000).toLocaleDateString()}
            </Text>
            {item.source.length > 0 ? (
              <Text style={styles.metaText}>{item.source}</Text>
            ) : null}
          </View>
        </Pressable>
      )}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator color={colors.primary} style={styles.spinner} />
        ) : (
          <Text style={styles.empty}>
            {tracked.length === 0
              ? "News shows up for games you added with Find on Steam."
              : "No news found right now."}
          </Text>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingTop: 8, flexGrow: 1 },
  spinner: { marginTop: 40 },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },
  error: { color: colors.status.dropped, marginBottom: 8 },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  game: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primaryLight,
    textTransform: "uppercase",
  },
  title: { fontSize: 16, fontWeight: "600", color: colors.text, marginTop: 4 },
  snippet: { fontSize: 14, color: colors.textMuted, marginTop: 6 },
  meta: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  metaText: { fontSize: 12, color: colors.textMuted },
});
