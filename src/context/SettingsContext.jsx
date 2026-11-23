import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const KEY = "appSettings";

export const DEFAULT_SETTINGS = {
  region: "us", // Steam store country code, used for prices in Deals
  englishOnly: true, // filter non-English articles out of News
  displayName: "", // empty = use the name guessed from the email
  defaultStatus: "backlog", // status the Add Game form starts with
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Load saved settings once on startup
  useEffect(() => {
    async function load() {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      } catch (e) {
        console.warn("Failed to load settings", e);
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  // Save whenever a setting changes
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(KEY, JSON.stringify(settings)).catch((e) =>
      console.warn("Failed to save settings", e),
    );
  }, [settings, loaded]);

  const updateSetting = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <SettingsContext.Provider value={{ settings, loaded, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
