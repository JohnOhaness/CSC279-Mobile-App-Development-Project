import { createContext, useContext } from "react";
import { useLocalValue } from "./useLocalValue";

export const DEFAULT_SETTINGS = {
  region: "us", // Steam store country code, used for prices in Deals
  englishOnly: true, // filter non-English articles out of News
  displayName: "", // empty = use the name guessed from the email
  defaultStatus: "backlog", // status the Add Game form starts with
};

const restoreSettings = (saved) => ({ ...DEFAULT_SETTINGS, ...saved });

const SettingsContext = createContext(null);

export function SettingsProvider({ children, storageKey }) {
  const [settings, setSettings, loaded, error] = useLocalValue(
    storageKey, DEFAULT_SETTINGS, restoreSettings,
  );

  const updateSetting = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <SettingsContext.Provider value={{ settings, loaded, error, updateSetting }}>
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
