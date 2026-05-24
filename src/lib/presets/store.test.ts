import { describe, expect, it } from "vitest";

import {
  createDicePreset,
  createRandomListPreset,
  deletePreset,
  emptyPresetStore,
  parsePresetStore,
  presetStorageKey,
  serializePresetStore,
  upsertPreset,
} from "./store";

describe("preset store", () => {
  it("uses a stable localStorage key", () => {
    expect(presetStorageKey).toBe("ap-flour.presets.v1");
  });

  it("creates and parses random-list presets for picker and wheel", () => {
    const preset = createRandomListPreset({
      id: "list-1",
      name: "Players",
      now: 100,
      toolId: "picker",
      items: [
        { id: "a", label: "Alice", color: "#ef4444", weight: 2, enabled: true },
        { id: "b", label: "Bob", color: "#22c55e", weight: 1, enabled: false },
      ],
    });

    const parsed = parsePresetStore(
      serializePresetStore({ version: 1, presets: [preset] }),
    );

    expect(parsed.presets).toEqual([preset]);
  });

  it("rejects invalid random-list presets from storage", () => {
    const parsed = parsePresetStore(
      JSON.stringify({
        version: 1,
        presets: [
          {
            id: "bad",
            toolId: "picker",
            name: "Bad",
            value: { items: [] },
            createdAt: 100,
            updatedAt: 100,
          },
        ],
      }),
    );

    expect(parsed.presets).toHaveLength(0);
  });

  it("parses empty and invalid stored values as an empty versioned store", () => {
    expect(parsePresetStore(null)).toEqual(emptyPresetStore);
    expect(parsePresetStore("not json")).toEqual(emptyPresetStore);
    expect(parsePresetStore(JSON.stringify({ version: 999, presets: [] }))).toEqual(
      emptyPresetStore,
    );
  });

  it("creates a dice preset without roll results or cheat fields", () => {
    const preset = createDicePreset({
      config: { sides: 20, count: 2, modifier: 3 },
      id: "dice-1",
      name: "Boss fight",
      now: 100,
    });

    expect(preset).toEqual({
      id: "dice-1",
      toolId: "dice",
      name: "Boss fight",
      value: { sides: 20, count: 2, modifier: 3 },
      createdAt: 100,
      updatedAt: 100,
    });
  });

  it("rejects invalid dice presets from storage", () => {
    const stored = serializePresetStore({
      version: 1,
      presets: [
        createDicePreset({
          config: { sides: 6, count: 2, modifier: 0 },
          id: "valid",
          name: "Valid",
          now: 100,
        }),
        {
          id: "invalid",
          toolId: "dice",
          name: "Bad",
          value: { sides: 7, count: 1, modifier: 0 },
          createdAt: 100,
          updatedAt: 100,
        },
      ],
    });

    expect(parsePresetStore(stored).presets).toHaveLength(1);
    expect(parsePresetStore(stored).presets[0].id).toBe("valid");
  });

  it("upserts by id and sorts newest updates first", () => {
    const first = createDicePreset({
      config: { sides: 6, count: 1, modifier: 0 },
      id: "one",
      name: "One",
      now: 100,
    });
    const second = createDicePreset({
      config: { sides: 8, count: 2, modifier: 1 },
      id: "two",
      name: "Two",
      now: 200,
    });
    const updatedFirst = { ...first, name: "Updated", updatedAt: 300 };

    const store = upsertPreset(upsertPreset(upsertPreset(emptyPresetStore, first), second), updatedFirst);

    expect(store.presets.map((preset) => preset.id)).toEqual(["one", "two"]);
    expect(store.presets[0].name).toBe("Updated");
    expect(store.presets).toHaveLength(2);
  });

  it("deletes presets by id", () => {
    const preset = createDicePreset({
      config: { sides: 6, count: 1, modifier: 0 },
      id: "delete-me",
      name: "Delete me",
      now: 100,
    });

    expect(deletePreset(upsertPreset(emptyPresetStore, preset), "delete-me")).toEqual(
      emptyPresetStore,
    );
  });
});
