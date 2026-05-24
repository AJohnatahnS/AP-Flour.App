import {
  supportedDiceSides,
  type DiceRollConfig,
  type DiceSides,
} from "@/lib/random/engine";
import {
  sanitizeRandomListItems,
  type RandomListItem,
} from "@/lib/random-list/engine";

export const presetStorageKey = "ap-flour.presets.v1";
export const presetStoreVersion = 1;

export type PresetToolId = "dice" | "picker" | "wheel";

export type DicePresetValue = DiceRollConfig;
export type RandomListPresetValue = {
  items: RandomListItem[];
};

export type DicePreset = {
  id: string;
  toolId: "dice";
  name: string;
  value: DicePresetValue;
  createdAt: number;
  updatedAt: number;
};

export type RandomListPreset = {
  id: string;
  toolId: "picker" | "wheel";
  name: string;
  value: RandomListPresetValue;
  createdAt: number;
  updatedAt: number;
};

export type AppPreset = DicePreset | RandomListPreset;

export type PresetStore = {
  version: typeof presetStoreVersion;
  presets: AppPreset[];
};

export const emptyPresetStore: PresetStore = {
  version: presetStoreVersion,
  presets: [],
};

export function parsePresetStore(value: string | null): PresetStore {
  if (!value) {
    return emptyPresetStore;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!isRecord(parsed) || parsed.version !== presetStoreVersion) {
      return emptyPresetStore;
    }

    const rawPresets = Array.isArray(parsed.presets) ? parsed.presets : [];

    return {
      version: presetStoreVersion,
      presets: rawPresets.filter(isAppPreset).sort(sortNewestFirst),
    };
  } catch {
    return emptyPresetStore;
  }
}

export function serializePresetStore(store: PresetStore) {
  return JSON.stringify({
    version: presetStoreVersion,
    presets: store.presets.filter(isAppPreset).sort(sortNewestFirst),
  });
}

export function createDicePreset({
  config,
  id,
  name,
  now,
}: {
  config: DiceRollConfig;
  id: string;
  name: string;
  now: number;
}): DicePreset {
  if (!isDiceConfig(config)) {
    throw new Error("invalid dice preset config");
  }

  return {
    id,
    toolId: "dice",
    name: normalizePresetName(name),
    value: config,
    createdAt: now,
    updatedAt: now,
  };
}

export function createRandomListPreset({
  id,
  items,
  name,
  now,
  toolId,
}: {
  id: string;
  items: RandomListItem[];
  name: string;
  now: number;
  toolId: "picker" | "wheel";
}): RandomListPreset {
  const sanitizedItems = sanitizeRandomListItems(items);

  if (sanitizedItems.length === 0) {
    throw new Error("random-list preset requires at least one item");
  }

  return {
    id,
    toolId,
    name: normalizePresetName(name),
    value: {
      items: sanitizedItems,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function upsertPreset(store: PresetStore, preset: AppPreset): PresetStore {
  const presets = [
    preset,
    ...store.presets.filter((existingPreset) => existingPreset.id !== preset.id),
  ];

  return {
    version: presetStoreVersion,
    presets: presets.filter(isAppPreset).sort(sortNewestFirst),
  };
}

export function deletePreset(store: PresetStore, id: string): PresetStore {
  return {
    version: presetStoreVersion,
    presets: store.presets.filter((preset) => preset.id !== id),
  };
}

function isAppPreset(value: unknown): value is AppPreset {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.createdAt !== "number" ||
    typeof value.updatedAt !== "number"
  ) {
    return false;
  }

  if (value.toolId === "dice") {
    return isDiceConfig(value.value);
  }

  return (
    (value.toolId === "picker" || value.toolId === "wheel") &&
    isRandomListPresetValue(value.value)
  );
}

function isDiceConfig(value: unknown): value is DiceRollConfig {
  if (!isRecord(value)) {
    return false;
  }

  const { count, modifier, sides } = value;

  return (
    typeof sides === "number" &&
    supportedDiceSides.includes(sides as DiceSides) &&
    typeof count === "number" &&
    Number.isInteger(count) &&
    count >= 1 &&
    count <= 20 &&
    typeof modifier === "number" &&
    Number.isInteger(modifier) &&
    modifier >= -999 &&
    modifier <= 999
  );
}

function normalizePresetName(name: string) {
  const normalized = name.trim().replace(/\s+/g, " ");
  return normalized.length > 0 ? normalized.slice(0, 48) : "Untitled preset";
}

function isRandomListPresetValue(value: unknown): value is RandomListPresetValue {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    return false;
  }

  const sanitizedItems = sanitizeRandomListItems(value.items);

  return sanitizedItems.length > 0 && sanitizedItems.length === value.items.length;
}

function sortNewestFirst(a: AppPreset, b: AppPreset) {
  return b.updatedAt - a.updatedAt;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
