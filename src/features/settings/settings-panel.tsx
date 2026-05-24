"use client";

import { useSyncExternalStore } from "react";

import { useLocaleCopy } from "@/lib/i18n/use-locale-copy";
import {
  clearAppLocalData,
  getSettingsStoreServerSnapshot,
  getSettingsStoreSnapshot,
  subscribeSettingsStore,
  writeSettingsStore,
} from "@/lib/settings/local-storage";
import type { AppLocale, ThemePreference } from "@/lib/settings/store";

export function SettingsPanel() {
  const copy = useLocaleCopy();
  const settings = useSyncExternalStore(
    subscribeSettingsStore,
    getSettingsStoreSnapshot,
    getSettingsStoreServerSnapshot,
  );

  function updateTheme(theme: ThemePreference) {
    writeSettingsStore({ ...settings, theme });
  }

  function updateLocale(locale: AppLocale) {
    writeSettingsStore({ ...settings, locale });
  }

  const themeOptions: { label: string; value: ThemePreference }[] = [
    { label: copy.settingsPanel.system, value: "system" },
    { label: copy.settingsPanel.light, value: "light" },
    { label: copy.settingsPanel.dark, value: "dark" },
  ];

  const localeOptions: { label: string; value: AppLocale }[] = [
    { label: copy.settingsPanel.english, value: "en" },
    { label: copy.settingsPanel.thai, value: "th" },
  ];

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
        <div>
          <p className="text-sm font-medium text-muted">
            {copy.settingsPanel.title}
          </p>
          <h1 className="text-2xl font-semibold tracking-normal">
            {copy.settingsPanel.heading}
          </h1>
        </div>

        <div className="mt-6 grid gap-5">
          <fieldset className="rounded-lg border border-border bg-background p-4">
            <legend className="px-1 text-sm font-semibold">
              {copy.settingsPanel.theme}
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {themeOptions.map((option) => (
                <button
                  aria-pressed={settings.theme === option.value}
                  className={`h-11 rounded-md border px-3 text-sm font-semibold transition ${
                    settings.theme === option.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-foreground hover:border-primary"
                  }`}
                  key={option.value}
                  onClick={() => updateTheme(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-border bg-background p-4">
            <legend className="px-1 text-sm font-semibold">
              {copy.settingsPanel.language}
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {localeOptions.map((option) => (
                <button
                  aria-pressed={settings.locale === option.value}
                  className={`h-11 rounded-md border px-3 text-sm font-semibold transition ${
                    settings.locale === option.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-foreground hover:border-primary"
                  }`}
                  key={option.value}
                  onClick={() => updateLocale(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="rounded-lg border border-border bg-background p-4">
            <h2 className="text-sm font-semibold">
              {copy.settingsPanel.localData}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {copy.settingsPanel.clearLocalDataDescription}
            </p>
            <button
              className="mt-4 h-11 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-accent transition hover:border-accent"
              onClick={clearAppLocalData}
              type="button"
            >
              {copy.settingsPanel.clearLocalData}
            </button>
          </div>
        </div>
      </div>

      <aside className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-semibold">{copy.settingsPanel.about}</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <div>
            <dt className="font-medium text-muted">{copy.settingsPanel.app}</dt>
            <dd className="mt-1 font-semibold">AP Flour</dd>
          </div>
          <div>
            <dt className="font-medium text-muted">
              {copy.settingsPanel.version}
            </dt>
            <dd className="mt-1 font-semibold">0.1.0</dd>
          </div>
          <div>
            <dt className="font-medium text-muted">
              {copy.settingsPanel.storage}
            </dt>
            <dd className="mt-1 leading-6">
              {copy.settingsPanel.storageDescription}
            </dd>
          </div>
        </dl>
      </aside>
    </section>
  );
}
