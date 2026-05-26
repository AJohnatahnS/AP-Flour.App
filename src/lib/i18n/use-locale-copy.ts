"use client";

import { useSyncExternalStore } from "react";

import { dictionaries } from "@/lib/i18n/dictionaries";
import {
  getSettingsStoreServerSnapshot,
  getSettingsStoreSnapshot,
  subscribeSettingsStore,
} from "@/lib/settings/local-storage";

export function useLocaleCopy() {
  const settings = useLocaleSettings();

  return dictionaries[settings.locale];
}

export function useLocaleSettings() {
  const settings = useSyncExternalStore(
    subscribeSettingsStore,
    getSettingsStoreSnapshot,
    getSettingsStoreServerSnapshot,
  );

  return settings;
}
