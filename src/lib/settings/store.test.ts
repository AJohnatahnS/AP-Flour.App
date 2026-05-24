import { describe, expect, it } from "vitest";

import {
  defaultSettings,
  parseSettingsStore,
  serializeSettingsStore,
  settingsStorageKey,
  storageKeysToClear,
} from "./store";

describe("settings store", () => {
  it("uses a stable localStorage key", () => {
    expect(settingsStorageKey).toBe("ap-flour.settings.v1");
  });

  it("parses empty, invalid, and unknown-version values as defaults", () => {
    expect(parseSettingsStore(null)).toEqual(defaultSettings);
    expect(parseSettingsStore("not json")).toEqual(defaultSettings);
    expect(parseSettingsStore(JSON.stringify({ version: 99 }))).toEqual(
      defaultSettings,
    );
  });

  it("accepts valid theme and locale settings", () => {
    expect(
      parseSettingsStore(
        JSON.stringify({
          version: 1,
          theme: "dark",
          locale: "th",
        }),
      ),
    ).toEqual({
      version: 1,
      theme: "dark",
      locale: "th",
    });
  });

  it("sanitizes invalid theme and locale settings", () => {
    expect(
      parseSettingsStore(
        JSON.stringify({
          version: 1,
          theme: "purple",
          locale: "fr",
        }),
      ),
    ).toEqual(defaultSettings);
  });

  it("serializes only supported settings", () => {
    expect(
      serializeSettingsStore({
        version: 1,
        theme: "light",
        locale: "en",
      }),
    ).toBe(JSON.stringify({ version: 1, theme: "light", locale: "en" }));
  });

  it("lists app-owned storage keys to clear", () => {
    expect(storageKeysToClear).toContain("ap-flour.settings.v1");
    expect(storageKeysToClear).toContain("ap-flour.presets.v1");
  });
});
