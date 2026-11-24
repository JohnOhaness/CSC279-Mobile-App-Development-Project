import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export default function GameCard({ game, onPress }) {
  return (
    <Pressable accessibilityRole="button" style={styles.card} onPress={onPress}>
      {game.coverUrl ? (
        <Image source={{ uri: game.coverUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Text style={styles.coverLetter}>
            {game.title ? game.title[0].toUpperCase() : "?"}
          </Text>
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {game.title}
        </Text>
        <Text style={styles.cardSub} numberOfLines={1}>
          {[game.platform, game.hoursPlayed != null && (game.hoursPlayed + " h played")].filter(Boolean).join(" · ") || "No platform"}
        </Text>
      </View>
      {game.allAchievements && (
        <Image
          source={require("../../assets/icons/achievement-placeholder.png")}
          accessibilityLabel="All achievements collected"
          accessible
          resizeMode="contain"
          style={styles.achievement}
        />
      )}
      <View
        style={[styles.badge, { backgroundColor: colors.status[game.status] }]}
      >
        <Text style={styles.badgeText}>{game.status}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  achievement: { width: 24, height: 24, marginRight: 5 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  cover: { width: 48, height: 48, borderRadius: 8 },
  coverPlaceholder: {
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  coverLetter: { fontSize: 20, fontWeight: "700", color: colors.primary },
  cardInfo: { flex: 1, marginHorizontal: 12 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  cardSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
