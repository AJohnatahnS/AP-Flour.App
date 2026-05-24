import type { DiceCheatOptions, DiceSides } from "@/lib/random/engine";

export const fallbackCheatPin = "1234";

export function getConfiguredCheatPin(value: string | undefined) {
  return value && /^\d{4}$/.test(value) ? value : fallbackCheatPin;
}

export function isValidCheatPin(input: string, configuredPin: string) {
  return input.trim() === configuredPin;
}

export function parseForcedDiceResults(
  value: string,
  sides: DiceSides,
  count: number,
) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  return trimmedValue
    .split(",")
    .slice(0, count)
    .map((item) => {
      const result = Number.parseInt(item.trim(), 10);

      if (!Number.isInteger(result) || item.trim() !== String(result)) {
        throw new Error("forced results must be whole numbers");
      }

      if (result < 1 || result > sides) {
        throw new Error(`forced results must be between 1 and ${sides}`);
      }

      return result;
    });
}

export function buildDiceCheatOptions({
  count,
  favoredFace,
  favoredWeight,
  forceNextText,
  sides,
}: {
  count: number;
  favoredFace: number | undefined;
  favoredWeight: number;
  forceNextText: string;
  sides: DiceSides;
}): DiceCheatOptions | undefined {
  const forceNextResults = parseForcedDiceResults(forceNextText, sides, count);
  const faceWeights =
    favoredFace && favoredFace >= 1 && favoredFace <= sides && favoredWeight > 1
      ? { [favoredFace]: favoredWeight }
      : undefined;

  if (!forceNextResults && !faceWeights) {
    return undefined;
  }

  return {
    ...(forceNextResults ? { forceNextResults } : {}),
    ...(faceWeights ? { faceWeights } : {}),
  };
}
