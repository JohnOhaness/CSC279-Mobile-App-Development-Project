import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useLibrary } from "../library/LibraryContext";
import { colors } from "../theme/colors";
import AppButton from "./AppButton";
import AppScreen from "./AppScreen";

const SETTINGS_ICON = require("../../assets/icons/settings.png");

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY = 24 * 60 * 60 * 1000;

// "john.smith@mail.com" -> "John Smith"
function displayName(email) {
  if (!email) return "Gamer";
  const name = email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .trim();
  return name ? name.replace(/\b\w/g, (c) => c.toUpperCase()) : "Gamer";
}

function ageText(timestamp) {
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / DAY));
  if (days < 30) return `${days} ${days === 1 ? "day" : "days"}`;
  const months = Math.floor(days / 30);
  return `${months} ${months === 1 ? "month" : "months"}`;
}

function Bar({ label, value, max, color }) {
  const width = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0;
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${width}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.barValue}>{value}</Text>
    </View>
  );
}

export default function ProfileOverview() {
  const { games } = useLibrary();
  const { email, logout } = useAuth();
  const router = useRouter();
  const { settings } = useSettings();

  const data = useMemo(() => {
    const now = new Date();
    const total = games.length;
    const completed = games.filter((g) => g.status === "completed");
    const backlog = games.filter((g) => g.status === "backlog");

    const completedThisMonth = completed.filter((g) => {
      if (!g.completedAt) return false;
      const d = new Date(g.completedAt);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;
    const completedThisYear = completed.filter(
      (g) =>
        g.completedAt &&
        new Date(g.completedAt).getFullYear() === now.getFullYear(),
    ).length;

    // Games per platform, biggest first
    const counts = {};
    games.forEach((g) => {
      const platform = g.platform || "No platform";
      counts[platform] = (counts[platform] || 0) + 1;
    });
    const platforms = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    // Longest-waiting backlog game
    const oldestBacklog = backlog.reduce(
      (best, g) =>
        g.addedAt && (!best || g.addedAt < best.addedAt) ? g : best,
      null,
    );

    // Games added in each of the last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: MONTHS[d.getMonth()],
        count: 0,
      });
    }
    games.forEach((g) => {
      if (!g.addedAt) return;
      const d = new Date(g.addedAt);
      const month = months.find(
        (m) => m.key === `${d.getFullYear()}-${d.getMonth()}`,
      );
      if (month) month.count += 1;
    });

    const milestones = [
      {
        id: "first",
        title: "First game",
        detail: "Add 1 game",
        earned: total >= 1,
      },
      {
        id: "collector",
        title: "Collector",
        detail: "Track 10 games",
        earned: total >= 10,
      },
      {
        id: "big",
        title: "Big library",
        detail: "Track 50 games",
        earned: total >= 50,
      },
      {
        id: "finisher",
        title: "Finisher",
        detail: "Complete 1 game",
        earned: completed.length >= 1,
      },
      {
        id: "closer",
        title: "Closer",
        detail: "Complete 10 games",
        earned: completed.length >= 10,
      },
      {
        id: "clear",
        title: "Backlog cleared",
        detail: "Finish your whole backlog",
        earned: total > 0 && backlog.length === 0 && completed.length > 0,
      },
    ];

    return {
      total,
      completedThisMonth,
      completedThisYear,
      platforms,
      oldestBacklog,
      months,
      milestones,
    };
  }, [games]);

  const name = settings.displayName.trim() || displayName(email);
  const earnedCount = data.milestones.filter((m) => m.earned).length;
  const maxPlatform = data.platforms.length > 0 ? data.platforms[0][1] : 0;
  const maxMonth = Math.max(0, ...data.months.map((m) => m.count));

  return (
    <AppScreen>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{name[0].toUpperCase()}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{name}</Text>
          {email ? <Text style={styles.email}>{email}</Text> : null}
        </View>
        <Pressable
          onPress={() => router.push("/settings")}
          hitSlop={10}
          accessibilityLabel="Open settings"
          style={styles.settingsButton}
        >
          <Image
            source={SETTINGS_ICON}
            style={styles.settingsIcon}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      {/* Milestones */}
      <Text style={styles.sectionTitle}>
        Milestones{" "}
        <Text style={styles.sectionCount}>
          {earnedCount} of {data.milestones.length}
        </Text>
      </Text>
      <View style={styles.grid}>
        {data.milestones.map((m) => (
          <View
            key={m.id}
            style={[
              styles.tile,
              m.earned ? styles.tileEarned : styles.tileLocked,
            ]}
          >
            <Text
              style={[styles.tileTitle, m.earned && styles.tileTitleEarned]}
            >
              {m.title}
            </Text>
            <Text
              style={[styles.tileDetail, m.earned && styles.tileDetailEarned]}
            >
              {m.earned ? "Earned" : m.detail}
            </Text>
          </View>
        ))}
      </View>

      {/* Insights */}
      <Text style={styles.sectionTitle}>Library insights</Text>

      {data.total === 0 ? (
        <Text style={styles.muted}>Add some games to see your insights.</Text>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Completed</Text>
            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Text style={styles.bigNumber}>{data.completedThisMonth}</Text>
                <Text style={styles.muted}>this month</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.bigNumber}>{data.completedThisYear}</Text>
                <Text style={styles.muted}>this year</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Games by platform</Text>
            {data.platforms.map(([platform, count]) => (
              <Bar
                key={platform}
                label={platform}
                value={count}
                max={maxPlatform}
                color={colors.primary}
              />
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Longest in your backlog</Text>
            {data.oldestBacklog ? (
              <Text style={styles.bodyText}>
                <Text style={styles.bold}>{data.oldestBacklog.title}</Text> has
                been waiting {ageText(data.oldestBacklog.addedAt)}.
              </Text>
            ) : (
              <Text style={styles.muted}>Nothing in your backlog. Nice!</Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Games added, last 6 months</Text>
            {data.months.map((m) => (
              <Bar
                key={m.key}
                label={m.label}
                value={m.count}
                max={maxMonth}
                color={colors.primaryLight}
              />
            ))}
          </View>
        </>
      )}

      <AppButton text="Log out" onPress={logout} style={styles.logout} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { color: colors.onPrimary, fontSize: 28, fontWeight: "700" },
  headerText: { marginLeft: 16, flex: 1 },
  name: { fontSize: 22, fontWeight: "700", color: colors.primary },
  email: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIcon: { width: 26, height: 26, tintColor: colors.primary },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: 24,
    marginBottom: 10,
  },
  sectionCount: { fontSize: 14, fontWeight: "400", color: colors.textMuted },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: { width: "48.5%", borderRadius: 12, padding: 12, borderWidth: 1 },
  tileEarned: { backgroundColor: colors.primary, borderColor: colors.primary },
  tileLocked: { backgroundColor: colors.surface, borderColor: colors.border },
  tileTitle: { fontSize: 15, fontWeight: "700", color: colors.textMuted },
  tileTitleEarned: { color: colors.onPrimary },
  tileDetail: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  tileDetailEarned: { color: colors.onPrimary },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 10,
  },
  twoCol: { flexDirection: "row" },
  col: { flex: 1 },
  bigNumber: { fontSize: 28, fontWeight: "700", color: colors.text },
  bodyText: { fontSize: 15, color: colors.text },
  bold: { fontWeight: "700" },
  muted: { fontSize: 13, color: colors.textMuted },

  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  barLabel: { width: 90, fontSize: 13, color: colors.text },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  barFill: { height: 10, borderRadius: 5 },
  barValue: {
    width: 28,
    textAlign: "right",
    fontSize: 13,
    color: colors.textMuted,
  },

  logout: { marginTop: 24, backgroundColor: colors.status.dropped },
});
