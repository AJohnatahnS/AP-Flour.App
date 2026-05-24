import { describe, expect, it } from "vitest";

import {
  buildDiceCheatOptions,
  getConfiguredCheatPin,
  isValidCheatPin,
  parseForcedDiceResults,
} from "./dice";

describe("dice cheat helpers", () => {
  it("uses a configured four-digit PIN with a safe fallback", () => {
    expect(getConfiguredCheatPin("9876")).toBe("9876");
    expect(getConfiguredCheatPin("abcd")).toBe("1234");
    expect(getConfiguredCheatPin(undefined)).toBe("1234");
  });

  it("validates PIN input exactly", () => {
    expect(isValidCheatPin("1234", "1234")).toBe(true);
    expect(isValidCheatPin(" 1234 ", "1234")).toBe(true);
    expect(isValidCheatPin("12345", "1234")).toBe(false);
    expect(isValidCheatPin("0000", "1234")).toBe(false);
  });

  it("parses comma-separated forced dice results within die and count bounds", () => {
    expect(parseForcedDiceResults("20, 4", 20, 3)).toEqual([20, 4]);
    expect(parseForcedDiceResults("", 6, 2)).toBeUndefined();
    expect(parseForcedDiceResults("1,2,3", 6, 2)).toEqual([1, 2]);
  });

  it("rejects invalid forced dice results", () => {
    expect(() => parseForcedDiceResults("0", 6, 1)).toThrow("between 1 and 6");
    expect(() => parseForcedDiceResults("7", 6, 1)).toThrow("between 1 and 6");
    expect(() => parseForcedDiceResults("two", 6, 1)).toThrow("whole numbers");
  });

  it("builds runtime dice cheat options from forced results and weighted face settings", () => {
    expect(
      buildDiceCheatOptions({
        count: 2,
        favoredFace: 6,
        favoredWeight: 8,
        forceNextText: "5, 6",
        sides: 6,
      }),
    ).toEqual({
      forceNextResults: [5, 6],
      faceWeights: {
        6: 8,
      },
    });
  });

  it("omits inactive weighted face settings", () => {
    expect(
      buildDiceCheatOptions({
        count: 1,
        favoredFace: undefined,
        favoredWeight: 8,
        forceNextText: "",
        sides: 6,
      }),
    ).toBeUndefined();
  });
});
