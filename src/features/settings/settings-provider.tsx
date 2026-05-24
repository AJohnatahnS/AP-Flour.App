"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  getSettingsStoreServerSnapshot,
  getSettingsStoreSnapshot,
  subscribeSettingsStore,
} from "@/lib/settings/local-storage";

export function SettingsProvider() {
  const settings = useSyncExternalStore(
    subscribeSettingsStore,
    getSettingsStoreSnapshot,
    getSettingsStoreServerSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = settings.locale;

    if (settings.theme === "system") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = settings.theme;
    }
  }, [settings.locale, settings.theme]);

  return null;
}
