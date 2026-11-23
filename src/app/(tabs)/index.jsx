import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppButton from "../../components/AppButton";
import AppScreen from "../../components/AppScreen";
import { useLibrary } from "../../library/LibraryContext";
import { colors } from "../../theme/colors";

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
        style={[styles.badge, { backgroundColor: colors.status[game.status] }]}
      >
        <Text style={styles.badgeText}>{game.status}</Text>
      </View>
    </Pressable>
  );
}

function Section({ title, children, onAction }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable onPress={onAction}>
          <Text style={styles.sectionAction}>See all</Text>
        </Pressable>
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
      <AppScreen centered>
        <ActivityIndicator color={colors.primary} />
      </AppScreen>
    );
  }

  if (games.length === 0) {
    return (
      <AppScreen centered>
        <Text style={styles.emptyTitle}>Your library is empty</Text>
        <Text style={styles.emptyText}>
          Add your first game to start tracking what you play.
        </Text>
        <AppButton text="Go to Library" onPress={openLibrary} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <Text style={styles.heading}>Your Games</Text>

      <View style={styles.statsRow}>
        <StatCard label="Total" value={stats.total} color={colors.text} />
        <StatCard
          label="Playing"
          value={stats.playing}
          color={colors.status.playing}
        />
        <StatCard
          label="Backlog"
          value={stats.backlog}
          color={colors.status.backlog}
        />
        <StatCard
          label="Done"
          value={stats.completed}
          color={colors.status.completed}
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

      <Section title="Currently Playing" onAction={openLibrary}>
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

      <Section title="Recently Added" onAction={openLibrary}>
        {recent.map((game) => (
          <GameRow key={game.id} game={game} onPress={openLibrary} />
        ))}
      </Section>

      <AppButton
        text="Open Library"
        onPress={openLibrary}
        style={styles.libraryButton}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    color: colors.primary,
  },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  progressCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: { fontSize: 14, color: colors.textMuted },
  progressPercent: { fontSize: 14, fontWeight: "700", color: colors.primary },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: { height: 8, backgroundColor: colors.primary },

  section: { marginTop: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: colors.text },
  sectionAction: { fontSize: 14, color: colors.primaryLight },
  mutedText: { color: colors.textMuted, fontSize: 14 },

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
  cover: { width: 48, height: 48, borderRadius: 8 },
  coverPlaceholder: {
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  coverLetter: { fontSize: 20, fontWeight: "700", color: colors.primary },
  rowInfo: { flex: 1, marginHorizontal: 12 },
  rowTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  rowSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  libraryButton: { marginTop: 20 },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 6,
  },
  emptyText: { fontSize: 14, color: colors.textMuted, marginBottom: 16 },
});
