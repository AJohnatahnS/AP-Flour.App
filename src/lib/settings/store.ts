import { presetStorageKey } from "@/lib/presets/store";

export const settingsStorageKey = "ap-flour.settings.v1";
export const settingsStoreVersion = 1;

export type ThemePreference = "system" | "light" | "dark";
export type AppLocale = "en" | "th";

export type SettingsStore = {
  version: typeof settingsStoreVersion;
  theme: ThemePreference;
  locale: AppLocale;
};

export const defaultSettings: SettingsStore = {
  version: settingsStoreVersion,
  theme: "system",
  locale: "en",
};

export const storageKeysToClear = [settingsStorageKey, presetStorageKey] as const;

export function parseSettingsStore(value: string | null): SettingsStore {
  if (!value) {
    return defaultSettings;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!isRecord(parsed) || parsed.version !== settingsStoreVersion) {
      return defaultSettings;
    }

    return {
      version: settingsStoreVersion,
      theme: isThemePreference(parsed.theme) ? parsed.theme : defaultSettings.theme,
      locale: isAppLocale(parsed.locale) ? parsed.locale : defaultSettings.locale,
    };
  } catch {
    return defaultSettings;
  }
}

export function serializeSettingsStore(settings: SettingsStore) {
  return JSON.stringify({
    version: settingsStoreVersion,
    theme: isThemePreference(settings.theme)
      ? settings.theme
      : defaultSettings.theme,
    locale: isAppLocale(settings.locale)
      ? settings.locale
      : defaultSettings.locale,
  });
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function isAppLocale(value: unknown): value is AppLocale {
  return value === "en" || value === "th";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
