import type { RandomListItem } from "@/lib/random-list/engine";

export type RandomListCheatWeightOptions = {
  favoredItemId: string;
  favoredWeight: number;
};

export function findForcedRandomListItem(
  items: RandomListItem[],
  forcedItemId: string,
) {
  if (!forcedItemId) {
    return null;
  }

  return (
    items.find((item) => item.id === forcedItemId && item.enabled) ?? null
  );
}

export function applyRandomListCheatWeights(
  items: RandomListItem[],
  options: RandomListCheatWeightOptions,
) {
  if (!options.favoredItemId || options.favoredWeight <= 1) {
    return items;
  }

  return items.map((item) =>
    item.id === options.favoredItemId && item.enabled
      ? { ...item, weight: options.favoredWeight }
      : item,
  );
}
