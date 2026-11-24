import AsyncStorage from "@react-native-async-storage/async-storage";

let pendingWrite = Promise.resolve();

export function saveLocalValue(key, value) {
  const json = JSON.stringify(value);
  const write = pendingWrite.then(() => AsyncStorage.setItem(key, json));
  pendingWrite = write.catch(() => {});
  return write;
}

export async function loadLocalValue(key) {
  await pendingWrite;
  const raw = await AsyncStorage.getItem(key);
  return raw === null ? null : JSON.parse(raw);
}

export async function loadLibrary(key) {
  const library = await loadLocalValue(key);
  if (library && (!Array.isArray(library.games) || !Array.isArray(library.categories))) {
    throw new Error("Invalid saved library");
  }
  return {
    version: 2,
    games: (library?.games ?? []).map((game) => ({
      notes: "",
      platform: "",
      categories: [],
      ...game,
      hoursPlayed: game.hoursPlayed ?? null,
      allAchievements: game.status === "completed" && game.allAchievements === true,
    })),
    categories: library?.categories ?? [],
  };
}

export const saveLibrary = (key, library) => saveLocalValue(key, library);
