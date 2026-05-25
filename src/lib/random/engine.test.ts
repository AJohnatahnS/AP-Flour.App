import { describe, expect, it } from "vitest";

import {
  pickWeighted,
  randomInt,
  rollDice,
  type WeightedChoice,
} from "./engine";

describe("randomInt", () => {
  it("maps the low and high random boundaries into an inclusive integer range", () => {
    expect(randomInt(1, 6, () => 0)).toBe(1);
    expect(randomInt(1, 6, () => 0.999_999)).toBe(6);
  });

  it("rejects invalid integer ranges", () => {
    expect(() => randomInt(6, 1, () => 0.5)).toThrow("min must be <= max");
    expect(() => randomInt(1.2, 6, () => 0.5)).toThrow("integers");
  });
});

describe("pickWeighted", () => {
  const choices: WeightedChoice<string>[] = [
    { value: "small", weight: 1 },
    { value: "medium", weight: 2 },
    { value: "large", weight: 3 },
  ];

  it("selects by cumulative positive weight", () => {
    expect(pickWeighted(choices, () => 0)).toBe("small");
    expect(pickWeighted(choices, () => 0.2)).toBe("medium");
    expect(pickWeighted(choices, () => 0.99)).toBe("large");
  });

  it("ignores disabled and zero-weight choices", () => {
    expect(
      pickWeighted(
        [
          { value: "skip", weight: 100, enabled: false },
          { value: "also-skip", weight: 0 },
          { value: "winner", weight: 1 },
        ],
        () => 0,
      ),
    ).toBe("winner");
  });

  it("rejects lists with no enabled positive weights", () => {
    expect(() =>
      pickWeighted(
        [
          { value: "off", weight: 1, enabled: false },
          { value: "zero", weight: 0 },
        ],
        () => 0,
      ),
    ).toThrow("positive weight");
  });
});

describe("rollDice", () => {
  it("rolls multiple dice, applies modifiers, and returns per-die results", () => {
    const result = rollDice(
      {
        sides: 6,
        count: 3,
        modifier: 2,
      },
      {
        random: () => 0,
      },
    );

    expect(result.rolls).toEqual([1, 1, 1]);
    expect(result.total).toBe(5);
  });

  it("uses force-next dice results once when provided", () => {
    const result = rollDice(
      {
        sides: 20,
        count: 2,
        modifier: -1,
      },
      {
        cheat: {
          forceNextResults: [20, 4],
        },
        random: () => 0,
      },
    );

    expect(result.rolls).toEqual([20, 4]);
    expect(result.total).toBe(23);
  });

  it("uses weighted face probabilities for non-forced dice", () => {
    const result = rollDice(
      {
        sides: 6,
        count: 1,
        modifier: 0,
      },
      {
        cheat: {
          faceWeights: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 1,
          },
        },
        random: () => 0,
      },
    );

    expect(result.rolls).toEqual([6]);
    expect(result.total).toBe(6);
  });

  it("rejects invalid dice config and invalid forced results", () => {
    expect(() => rollDice({ sides: 7 as never, count: 1, modifier: 0 })).toThrow(
      "supported die",
    );
    expect(() =>
      rollDice(
        { sides: 6, count: 1, modifier: 0 },
        { cheat: { forceNextResults: [7] } },
      ),
    ).toThrow("forced result");
  });
});
