import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "gameLibrary";
const VERSION = 1;

const emptyLibrary = () => ({ version: VERSION, games: [], categories: [] });

export async function loadLibrary() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return emptyLibrary();
    const parsed = JSON.parse(raw);
    // Future: migrate here when parsed.version < VERSION
    return { ...emptyLibrary(), ...parsed };
  } catch (e) {
    console.warn("Failed to load library", e);
    return emptyLibrary();
  }
}

export async function saveLibrary(library) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(library));
  } catch (e) {
    console.warn("Failed to save library", e);
  }
}
