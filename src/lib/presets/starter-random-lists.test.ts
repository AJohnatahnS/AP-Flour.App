import { describe, expect, it } from "vitest";

import {
  getPickerStarterPresets,
  getWheelStarterPresets,
} from "@/lib/presets/starter-random-lists";
import { maxRandomListItems } from "@/lib/random-list/engine";

describe("starter random-list presets", () => {
  it("provides bar-friendly wheel starter presets for every locale", () => {
    for (const locale of ["en", "th"] as const) {
      const presets = getWheelStarterPresets(locale);

      expect(presets).toHaveLength(10);
      expect(presets.every((preset) => preset.items.length >= 6)).toBe(true);
      expect(
        presets.every((preset) => preset.items.length <= maxRandomListItems),
      ).toBe(true);
    }
  });

  it("provides longer picker starter presets for every locale", () => {
    for (const locale of ["en", "th"] as const) {
      const presets = getPickerStarterPresets(locale);

      expect(presets).toHaveLength(8);
      expect(presets.every((preset) => preset.items.length >= 15)).toBe(true);
      expect(
        presets.every((preset) => preset.items.length <= maxRandomListItems),
      ).toBe(true);
    }
  });

  it("builds sanitized enabled items with stable ids and colors", () => {
    const [preset] = getWheelStarterPresets("th");

    expect(preset?.id).toBe("starter-who-goes-first");
    expect(preset?.items[0]).toMatchObject({
      id: "who-goes-first-1",
      color: "#ef4444",
      weight: 1,
      enabled: true,
    });
  });
});
