import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLibrary } from "../../library/LibraryContext";

const STATUS_COLORS = {
  backlog: "#8E8E93",
  playing: "#007AFF",
  completed: "#34C759",
  dropped: "#FF3B30",
  wishlist: "#AF52DE",
};

function StatCard({ label, value, color }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function GameRow({ game, onPress }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      {game.coverUrl ? (
        <Image source={{ uri: game.coverUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Text style={styles.coverLetter}>
            {game.title ? game.title[0].toUpperCase() : "?"}
          </Text>
        </View>
      )}
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {game.title}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {game.platform || "No platform"}
        </Text>
      </View>
      <View
        style={[styles.badge, { backgroundColor: STATUS_COLORS[game.status] }]}
      >
        <Text style={styles.badgeText}>{game.status}</Text>
      </View>
    </Pressable>
  );
}

function Section({ title, children, actionLabel, onAction }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {actionLabel ? (
          <Pressable onPress={onAction}>
            <Text style={styles.sectionAction}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const { games, loaded } = useLibrary();

  const stats = useMemo(() => {
    const count = (status) => games.filter((g) => g.status === status).length;
    const completed = count("completed");
    // Wishlist games aren't owned, so leave them out of the completion rate
    const owned = games.filter((g) => g.status !== "wishlist").length;
    return {
      total: games.length,
      playing: count("playing"),
      completed,
      backlog: count("backlog"),
      percent: owned > 0 ? Math.round((completed / owned) * 100) : 0,
    };
  }, [games]);

  const playing = useMemo(
    () => games.filter((g) => g.status === "playing").slice(0, 5),
    [games],
  );

  // New games are added to the front of the array, so the first 5 are the latest
  const recent = useMemo(() => games.slice(0, 5), [games]);

  const openLibrary = () => router.push("/library");

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (games.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Your library is empty</Text>
        <Text style={styles.emptyText}>
          Add your first game to start tracking what you play.
        </Text>
        <Pressable style={styles.primaryButton} onPress={openLibrary}>
          <Text style={styles.primaryButtonText}>Go to Library</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Your Games</Text>

      <View style={styles.statsRow}>
        <StatCard label="Total" value={stats.total} color="#111" />
        <StatCard
          label="Playing"
          value={stats.playing}
          color={STATUS_COLORS.playing}
        />
        <StatCard
          label="Backlog"
          value={stats.backlog}
          color={STATUS_COLORS.backlog}
        />
        <StatCard
          label="Done"
          value={stats.completed}
          color={STATUS_COLORS.completed}
        />
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>Completion rate</Text>
          <Text style={styles.progressPercent}>{stats.percent}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${stats.percent}%` }]} />
        </View>
      </View>

      <Section
        title="Currently Playing"
        actionLabel="See all"
        onAction={openLibrary}
      >
        {playing.length > 0 ? (
          playing.map((game) => (
            <GameRow key={game.id} game={game} onPress={openLibrary} />
          ))
        ) : (
          <Text style={styles.mutedText}>
            Nothing in progress. Pick something from your backlog!
          </Text>
        )}
      </Section>

      <Section
        title="Recently Added"
        actionLabel="See all"
        onAction={openLibrary}
      >
        {recent.map((game) => (
          <GameRow key={game.id} game={game} onPress={openLibrary} />
        ))}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F2F2F7" },
  content: { padding: 16, paddingBottom: 32 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F2F2F7",
  },
  heading: { fontSize: 28, fontWeight: "700", marginBottom: 16, color: "#111" },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 12, color: "#8E8E93", marginTop: 2 },

  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: { fontSize: 14, color: "#444" },
  progressPercent: { fontSize: 14, fontWeight: "700", color: "#111" },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E5EA",
    overflow: "hidden",
  },
  progressFill: { height: 8, backgroundColor: "#34C759" },

  section: { marginTop: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#111" },
  sectionAction: { fontSize: 14, color: "#007AFF" },
  mutedText: { color: "#8E8E93", fontSize: 14 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  cover: { width: 48, height: 48, borderRadius: 8 },
  coverPlaceholder: {
    backgroundColor: "#E5E5EA",
    alignItems: "center",
    justifyContent: "center",
  },
  coverLetter: { fontSize: 20, fontWeight: "700", color: "#8E8E93" },
  rowInfo: { flex: 1, marginHorizontal: 12 },
  rowTitle: { fontSize: 16, fontWeight: "600", color: "#111" },
  rowSub: { fontSize: 13, color: "#8E8E93", marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
