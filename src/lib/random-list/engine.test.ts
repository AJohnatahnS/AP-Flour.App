import { describe, expect, it } from "vitest";

import {
  drawRandomListItem,
  removeRandomListItem,
  sanitizeRandomListItems,
  type RandomListItem,
} from "./engine";

describe("sanitizeRandomListItems", () => {
  it("normalizes labels, colors, weights, and enabled state", () => {
    expect(
      sanitizeRandomListItems([
        { id: "one", label: "  Alice  ", color: "#abc", weight: 2, enabled: true },
        { id: "two", label: "", color: "not-color", weight: -1, enabled: false },
      ]),
    ).toEqual([
      { id: "one", label: "Alice", color: "#abc", weight: 2, enabled: true },
      { id: "two", label: "Untitled item", color: "#64748b", weight: 1, enabled: false },
    ]);
  });

  it("limits stored list size and label length", () => {
    const items = Array.from({ length: 80 }, (_, index) => ({
      id: String(index),
      label: "x".repeat(80),
      color: "#0f766e",
      weight: 1,
      enabled: true,
    }));

    const result = sanitizeRandomListItems(items);

    expect(result).toHaveLength(60);
    expect(result[0].label).toHaveLength(48);
  });
});

describe("drawRandomListItem", () => {
  const items: RandomListItem[] = [
    { id: "a", label: "A", color: "#ef4444", weight: 1, enabled: true },
    { id: "b", label: "B", color: "#22c55e", weight: 2, enabled: true },
    { id: "c", label: "C", color: "#3b82f6", weight: 3, enabled: false },
  ];

  it("draws from enabled weighted items", () => {
    expect(drawRandomListItem(items, () => 0)?.id).toBe("a");
    expect(drawRandomListItem(items, () => 0.9)?.id).toBe("b");
  });

  it("returns null when no enabled item can be drawn", () => {
    expect(
      drawRandomListItem([
        { id: "off", label: "Off", color: "#64748b", weight: 10, enabled: false },
      ]),
    ).toBeNull();
  });
});

describe("removeRandomListItem", () => {
  it("removes a winner without mutating the original list", () => {
    const items: RandomListItem[] = [
      { id: "a", label: "A", color: "#ef4444", weight: 1, enabled: true },
      { id: "b", label: "B", color: "#22c55e", weight: 1, enabled: true },
    ];

    expect(removeRandomListItem(items, "a").map((item) => item.id)).toEqual(["b"]);
    expect(items).toHaveLength(2);
  });
});
