import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSettings } from "../context/SettingsContext";
import { useLibrary } from "../library/LibraryContext";
import { fetchPrices } from "../library/steamDeals";
import { colors } from "../theme/colors";

const saleAmount = (row) =>
  row.price && row.price.status === "priced" ? row.price.discountPercent : -1;

function PriceBlock({ price }) {
  if (!price) return <Text style={styles.priceMuted}>Price unknown</Text>;
  if (price.status === "unavailable")
    return <Text style={styles.priceMuted}>Unavailable</Text>;
  if (price.status === "noprice")
    return <Text style={styles.priceMuted}>Free / no price</Text>;

  if (price.discountPercent > 0) {
    return (
      <View style={styles.priceBox}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{price.discountPercent}%</Text>
        </View>
        <Text style={styles.oldPrice}>{price.initialFormatted}</Text>
        <Text style={styles.salePrice}>{price.finalFormatted}</Text>
      </View>
    );
  }
  return <Text style={styles.priceMuted}>{price.finalFormatted}</Text>;
}

export default function DealsList() {
  const { games } = useLibrary();
  const { settings, loaded } = useSettings();

  const wishlist = useMemo(
    () => games.filter((g) => g.status === "wishlist" && g.steamAppId),
    [games],
  );
  const unlinkedCount = games.filter(
    (g) => g.status === "wishlist" && !g.steamAppId,
  ).length;
  const idsKey = wishlist.map((g) => g.steamAppId).join(",");

  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (isRefresh) => {
      if (!loaded) return;
      const ids = idsKey ? idsKey.split(",") : [];
      if (ids.length === 0) {
        setPrices({});
        return;
      }
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");
      try {
        setPrices(await fetchPrices(ids, settings.region));
      } catch (e) {
        setError("Couldn't load prices from Steam. Pull down to try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [idsKey, settings.region, loaded],
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const rows = useMemo(() => {
    const withPrice = wishlist.map((game) => ({
      game,
      price: prices[game.steamAppId],
    }));
    return withPrice.sort(
      (a, b) =>
        saleAmount(b) - saleAmount(a) ||
        a.game.title.localeCompare(b.game.title),
    );
  }, [wishlist, prices]);

  const onSaleCount = rows.filter((r) => saleAmount(r) > 0).length;

  const header = (
    <View style={styles.header}>
      {wishlist.length > 0 && !loading ? (
        <Text style={styles.summary}>
          {onSaleCount} of {wishlist.length} wishlisted{" "}
          {wishlist.length === 1 ? "game is" : "games are"} on sale
        </Text>
      ) : null}
      {error.length > 0 && <Text style={styles.error}>{error}</Text>}
      {unlinkedCount > 0 ? (
        <Text style={styles.note}>
          {unlinkedCount} wishlisted{" "}
          {unlinkedCount === 1 ? "game isn't" : "games aren't"} linked to Steam,
          so prices can't be checked. Edit it and pick it with Find on Steam.
        </Text>
      ) : null}
    </View>
  );

  return (
    <FlatList
      data={rows}
      keyExtractor={(row) => row.game.id}
      contentContainerStyle={styles.list}
      refreshing={refreshing}
      onRefresh={() => load(true)}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <View style={styles.row}>
          {item.game.coverUrl ? (
            <Image source={{ uri: item.game.coverUrl }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, styles.coverPlaceholder]} />
          )}
          <Text style={styles.title} numberOfLines={2}>
            {item.game.title}
          </Text>
          <PriceBlock price={item.price} />
        </View>
      )}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator color={colors.primary} style={styles.spinner} />
        ) : (
          <Text style={styles.empty}>
            No wishlisted Steam games yet. Add a game with the Wishlist status
            using Find on Steam, and its price and any sale will show up here.
          </Text>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingTop: 8, flexGrow: 1 },
  header: { marginBottom: 8 },
  summary: { fontSize: 16, fontWeight: "600", color: colors.primary },
  note: { color: colors.textMuted, fontSize: 13, marginTop: 6 },
  error: { color: colors.status.dropped, marginTop: 6 },
  spinner: { marginTop: 40 },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  cover: { width: 56, height: 36, borderRadius: 6 },
  coverPlaceholder: { backgroundColor: colors.border },
  title: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },

  priceBox: { flexDirection: "row", alignItems: "center", gap: 6 },
  discountBadge: {
    backgroundColor: colors.status.completed,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: { color: colors.onPrimary, fontSize: 12, fontWeight: "700" },
  oldPrice: {
    color: colors.textMuted,
    fontSize: 12,
    textDecorationLine: "line-through",
  },
  salePrice: {
    color: colors.status.completed,
    fontSize: 15,
    fontWeight: "700",
  },
  priceMuted: { color: colors.textMuted, fontSize: 13 },
});
