import { describe, expect, it } from "vitest";

import { dictionaries, formatCopy } from "./dictionaries";

function flattenValues(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (typeof value === "object" && value !== null) {
    return Object.values(value).flatMap(flattenValues);
  }

  return [];
}

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") {
    return [prefix];
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, child]) =>
      flattenKeys(child, prefix ? `${prefix}.${key}` : key),
    );
  }

  return [];
}

describe("dictionaries", () => {
  it("keeps English and Thai dictionaries structurally aligned", () => {
    expect(flattenKeys(dictionaries.th).sort()).toEqual(
      flattenKeys(dictionaries.en).sort(),
    );
  });

  it("contains readable Thai copy instead of mojibake", () => {
    const thaiValues = flattenValues(dictionaries.th);

    expect(thaiValues.some((value) => /[\u0E00-\u0E7F]/.test(value))).toBe(true);
    expect(thaiValues.join(" ")).not.toContain("เธ");
  });

  it("formats placeholder values in localized copy", () => {
    expect(formatCopy("Pick from {count} items", { count: 3 })).toBe(
      "Pick from 3 items",
    );
  });
});
