import { useEffect, useState } from "react";
import { loadLocalValue, saveLocalValue } from "../library/storage";

// Wait for the initial read before allowing changes. Only save user edits.
export function useLocalValue(key, initialValue, restore) {
  const [record, setRecord] = useState({ value: initialValue, loaded: false });
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    loadLocalValue(key).then((saved) => {
      if (active) setRecord({ value: restore(saved), loaded: true });
    }).catch(() => {
      if (active) setError("Could not read saved data. Reopen the app to retry.");
    });
    return () => { active = false; };
  }, [key, restore]);

  useEffect(() => {
    if (!record.changed) return;
    let active = true;
    saveLocalValue(key, record.value).then(() => {
      if (active) setError("");
    }).catch(() => {
      if (active) setError("Could not save this change on your device.");
    });
    return () => { active = false; };
  }, [key, record]);

  function update(change) {
    setRecord((previous) => ({
      value: typeof change === "function" ? change(previous.value) : change,
      loaded: true,
      changed: true,
    }));
  }

  return [record.value, update, record.loaded, error];
}
