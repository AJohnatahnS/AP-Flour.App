export type RandomSource = () => number;

export type WeightedChoice<T> = {
  value: T;
  weight: number;
  enabled?: boolean;
};

export const supportedDiceSides = [4, 6, 8, 10, 12, 20] as const;

export type DiceSides = (typeof supportedDiceSides)[number];

export type DiceRollConfig = {
  sides: DiceSides;
  count: number;
  modifier: number;
};

export type DiceCheatOptions = {
  forceNextResults?: number[];
  faceWeights?: Partial<Record<number, number>>;
};

export type RollDiceOptions = {
  random?: RandomSource;
  cheat?: DiceCheatOptions;
};

export type DiceRollResult = DiceRollConfig & {
  rolls: number[];
  total: number;
  rolledAt: number;
};

const defaultRandom: RandomSource = Math.random;

export function randomInt(
  min: number,
  max: number,
  random: RandomSource = defaultRandom,
) {
  assertInteger(min, "min");
  assertInteger(max, "max");

  if (min > max) {
    throw new Error("min must be <= max");
  }

  const normalized = Math.min(Math.max(random(), 0), 0.999_999_999_999);
  return Math.floor(normalized * (max - min + 1)) + min;
}

export function pickWeighted<T>(
  choices: WeightedChoice<T>[],
  random: RandomSource = defaultRandom,
) {
  const activeChoices = choices.filter(
    (choice) => choice.enabled !== false && choice.weight > 0,
  );
  const totalWeight = activeChoices.reduce(
    (total, choice) => total + choice.weight,
    0,
  );

  if (activeChoices.length === 0 || totalWeight <= 0) {
    throw new Error("pickWeighted requires at least one enabled positive weight");
  }

  const threshold = Math.min(Math.max(random(), 0), 0.999_999_999_999) * totalWeight;
  let cursor = 0;

  for (const choice of activeChoices) {
    cursor += choice.weight;
    if (threshold < cursor) {
      return choice.value;
    }
  }

  return activeChoices[activeChoices.length - 1].value;
}

export function rollDice(
  config: DiceRollConfig,
  options: RollDiceOptions = {},
): DiceRollResult {
  validateDiceConfig(config);

  const random = options.random ?? defaultRandom;
  const rolls = Array.from({ length: config.count }, (_, index) =>
    rollSingleDie(config.sides, index, random, options.cheat),
  );
  const subtotal = rolls.reduce((total, roll) => total + roll, 0);

  return {
    ...config,
    rolls,
    total: subtotal + config.modifier,
    rolledAt: Date.now(),
  };
}

function rollSingleDie(
  sides: DiceSides,
  index: number,
  random: RandomSource,
  cheat?: DiceCheatOptions,
) {
  const forced = cheat?.forceNextResults?.[index];

  if (forced !== undefined) {
    if (!Number.isInteger(forced) || forced < 1 || forced > sides) {
      throw new Error(`forced result must be an integer from 1 to ${sides}`);
    }

    return forced;
  }

  if (cheat?.faceWeights) {
    return pickWeighted(
      Array.from({ length: sides }, (_, faceIndex) => {
        const value = faceIndex + 1;
        return {
          value,
          weight: cheat.faceWeights?.[value] ?? 1,
        };
      }),
      random,
    );
  }

  return randomInt(1, sides, random);
}

function validateDiceConfig(config: DiceRollConfig) {
  if (!supportedDiceSides.includes(config.sides)) {
    throw new Error("unsupported die; use D4, D6, D8, D10, D12, or D20");
  }

  assertInteger(config.count, "count");
  assertInteger(config.modifier, "modifier");

  if (config.count < 1 || config.count > 20) {
    throw new Error("count must be between 1 and 20");
  }

  if (config.modifier < -999 || config.modifier > 999) {
    throw new Error("modifier must be between -999 and 999");
  }
}

function assertInteger(value: number, name: string) {
  if (!Number.isInteger(value)) {
    throw new Error(`${name} must be an integer; ranges require integers`);
  }
}
