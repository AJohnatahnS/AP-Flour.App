"use client";

import {
  defaultSettings,
  parseSettingsStore,
  serializeSettingsStore,
  settingsStorageKey,
  storageKeysToClear,
  type SettingsStore,
} from "@/lib/settings/store";

const listeners = new Set<() => void>();
let cachedRawValue: string | null = null;
let cachedSettings: SettingsStore = defaultSettings;

export function readSettingsStore(): SettingsStore {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  return parseSettingsStore(window.localStorage.getItem(settingsStorageKey));
}

export function writeSettingsStore(settings: SettingsStore) {
  const nextRawValue = serializeSettingsStore(settings);
  window.localStorage.setItem(settingsStorageKey, nextRawValue);
  cachedRawValue = nextRawValue;
  cachedSettings = settings;
  emitSettingsChange();
}

export function clearAppLocalData() {
  storageKeysToClear.forEach((key) => window.localStorage.removeItem(key));
  cachedRawValue = null;
  cachedSettings = defaultSettings;
  emitSettingsChange();
}

export function subscribeSettingsStore(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getSettingsStoreSnapshot() {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  const rawValue = window.localStorage.getItem(settingsStorageKey);

  if (rawValue === cachedRawValue) {
    return cachedSettings;
  }

  cachedRawValue = rawValue;
  cachedSettings = parseSettingsStore(rawValue);

  return cachedSettings;
}

export function getSettingsStoreServerSnapshot() {
  return defaultSettings;
}

function emitSettingsChange() {
  listeners.forEach((listener) => listener());
  window.dispatchEvent(new Event("ap-flour:local-data-change"));
}
