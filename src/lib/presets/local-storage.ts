"use client";

import {
  emptyPresetStore,
  parsePresetStore,
  presetStorageKey,
  serializePresetStore,
  type PresetStore,
} from "@/lib/presets/store";

const listeners = new Set<() => void>();
let cachedRawValue: string | null = null;
let cachedStore: PresetStore = emptyPresetStore;

export function readPresetStore(): PresetStore {
  if (typeof window === "undefined") {
    return emptyPresetStore;
  }

  return parsePresetStore(window.localStorage.getItem(presetStorageKey));
}

export function writePresetStore(store: PresetStore) {
  const nextRawValue = serializePresetStore(store);
  window.localStorage.setItem(presetStorageKey, nextRawValue);
  cachedRawValue = nextRawValue;
  cachedStore = store;
  listeners.forEach((listener) => listener());
}

export function subscribePresetStore(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("ap-flour:local-data-change", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("ap-flour:local-data-change", listener);
  };
}

export function getPresetStoreSnapshot() {
  if (typeof window === "undefined") {
    return emptyPresetStore;
  }

  const rawValue = window.localStorage.getItem(presetStorageKey);

  if (rawValue === cachedRawValue) {
    return cachedStore;
  }

  cachedRawValue = rawValue;
  cachedStore = parsePresetStore(rawValue);

  return cachedStore;
}

export function getPresetStoreServerSnapshot() {
  return emptyPresetStore;
}
