import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppButton from "../../components/AppButton";
import AppTextInput from "../../components/AppTextInput";
import GameFormModal from "../../components/GameFormModal";
import StatusChips from "../../components/StatusChips";
import { STATUSES, useLibrary } from "../../library/LibraryContext";
import { colors } from "../../theme/colors";

const FILTERS = ["all", ...STATUSES];

function GameCard({ game, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {game.title}
        </Text>
        <Text style={styles.cardSub} numberOfLines={1}>
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

export default function Library() {
  const { games, addGame, updateGame, setStatus, deleteGame } = useLibrary();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // the game being edited, or null when adding

  const visibleGames = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games.filter((g) => {
      const matchesStatus = filter === "all" || g.status === filter;
      const matchesSearch = q.length === 0 || g.title.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [games, query, filter]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(game) {
    setEditing(game);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
  }

  function handleSave(data) {
    if (editing) {
      updateGame(editing.id, {
        title: data.title,
        platform: data.platform,
        notes: data.notes,
      });
      // setStatus also handles the completedAt date
      if (data.status !== editing.status) setStatus(editing.id, data.status);
    } else {
      addGame({
        ...data,
        completedAt: data.status === "completed" ? Date.now() : null,
      });
    }
    closeForm();
  }

  function handleDelete(game) {
    Alert.alert(
      "Delete game?",
      `"${game.title}" will be removed from your library.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteGame(game.id);
            closeForm();
          },
        },
      ],
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <AppTextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search your games"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <StatusChips options={FILTERS} selected={filter} onSelect={setFilter} />
        <AppButton
          text="+ Add Game"
          onPress={openAdd}
          style={styles.addButton}
        />
      </View>

      <FlatList
        data={visibleGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GameCard game={item} onPress={() => openEdit(item)} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {games.length === 0
              ? "No games yet. Add a game to get started."
              : "No games match your search or filter."}
          </Text>
        }
      />

      <GameFormModal
        visible={formOpen}
        game={editing}
        onClose={closeForm}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: 16, paddingTop: 12 },
  addButton: { marginTop: 12 },
  list: { padding: 16, paddingTop: 8, flexGrow: 1 },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardInfo: { flex: 1, marginRight: 12 },
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
