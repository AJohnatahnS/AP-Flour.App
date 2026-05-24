"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import {
  getPresetStoreServerSnapshot,
  getPresetStoreSnapshot,
  subscribePresetStore,
} from "@/lib/presets/local-storage";
import type { AppPreset } from "@/lib/presets/store";

export function SavedPresetsSummary({
  emptyLabel,
}: {
  emptyLabel: string;
}) {
  const store = useSyncExternalStore(
    subscribePresetStore,
    getPresetStoreSnapshot,
    getPresetStoreServerSnapshot,
  );
  const presets = store.presets;

  if (presets.length === 0) {
    return (
      <span className="rounded-md bg-surface-strong px-3 py-2 text-sm font-medium text-muted">
        {emptyLabel}
      </span>
    );
  }

  return (
    <div className="grid gap-2 sm:min-w-72">
      {presets.slice(0, 3).map((preset) => (
        <Link
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm transition hover:border-primary"
          href={getPresetHref(preset)}
          key={preset.id}
        >
          <span className="font-semibold">{preset.name}</span>
          <span className="ml-2 text-muted">{formatPreset(preset)}</span>
        </Link>
      ))}
    </div>
  );
}

function getPresetHref(preset: AppPreset) {
  if (preset.toolId === "dice") {
    return "/dice";
  }

  if (preset.toolId === "wheel") {
    return "/wheel";
  }

  return "/picker";
}

function formatPreset(preset: AppPreset) {
  if (preset.toolId === "dice") {
    const modifier =
      preset.value.modifier === 0
        ? ""
        : preset.value.modifier > 0
          ? ` +${preset.value.modifier}`
          : ` ${preset.value.modifier}`;

    return `${preset.value.count}d${preset.value.sides}${modifier}`;
  }

  return `${preset.value.items.length} items`;
}
