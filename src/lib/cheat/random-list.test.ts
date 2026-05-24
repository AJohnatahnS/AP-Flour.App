import { describe, expect, it } from "vitest";

import {
  applyRandomListCheatWeights,
  findForcedRandomListItem,
} from "./random-list";

const items = [
  { id: "a", label: "A", color: "#ef4444", weight: 1, enabled: true },
  { id: "b", label: "B", color: "#22c55e", weight: 2, enabled: true },
  { id: "c", label: "C", color: "#3b82f6", weight: 3, enabled: false },
];

describe("random-list cheat helpers", () => {
  it("finds a forced enabled item by id", () => {
    expect(findForcedRandomListItem(items, "b")?.id).toBe("b");
  });

  it("does not force disabled or missing items", () => {
    expect(findForcedRandomListItem(items, "c")).toBeNull();
    expect(findForcedRandomListItem(items, "missing")).toBeNull();
    expect(findForcedRandomListItem(items, "")).toBeNull();
  });

  it("applies favored item weight without mutating the original list", () => {
    const result = applyRandomListCheatWeights(items, {
      favoredItemId: "a",
      favoredWeight: 10,
    });

    expect(result.find((item) => item.id === "a")?.weight).toBe(10);
    expect(items[0].weight).toBe(1);
  });

  it("ignores inactive favored item settings", () => {
    expect(
      applyRandomListCheatWeights(items, {
        favoredItemId: "",
        favoredWeight: 10,
      }),
    ).toEqual(items);

    expect(
      applyRandomListCheatWeights(items, {
        favoredItemId: "a",
        favoredWeight: 1,
      }),
    ).toEqual(items);
  });
});
