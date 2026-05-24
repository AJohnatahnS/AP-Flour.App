import { pickWeighted, type RandomSource } from "@/lib/random/engine";

export type RandomListItem = {
  id: string;
  label: string;
  color: string;
  weight: number;
  enabled: boolean;
};

export const defaultRandomListColor = "#64748b";
export const maxRandomListItems = 60;
export const maxRandomListLabelLength = 48;

export function sanitizeRandomListItems(items: RandomListItem[]) {
  return items.slice(0, maxRandomListItems).map((item, index) => ({
    id: normalizeId(item.id, index),
    label: normalizeLabel(item.label),
    color: normalizeColor(item.color),
    weight: normalizeWeight(item.weight),
    enabled: item.enabled !== false,
  }));
}

export function drawRandomListItem(
  items: RandomListItem[],
  random?: RandomSource,
) {
  const drawableItems = sanitizeRandomListItems(items).filter(
    (item) => item.enabled && item.weight > 0,
  );

  if (drawableItems.length === 0) {
    return null;
  }

  return pickWeighted(
    drawableItems.map((item) => ({
      value: item,
      weight: item.weight,
      enabled: item.enabled,
    })),
    random,
  );
}

export function removeRandomListItem(items: RandomListItem[], id: string) {
  return items.filter((item) => item.id !== id);
}

function normalizeId(id: string, index: number) {
  const normalized = id.trim();
  return normalized.length > 0 ? normalized.slice(0, 64) : `item-${index + 1}`;
}

function normalizeLabel(label: string) {
  const normalized = label.trim().replace(/\s+/g, " ");
  return (normalized || "Untitled item").slice(0, maxRandomListLabelLength);
}

function normalizeColor(color: string) {
  return /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(color)
    ? color
    : defaultRandomListColor;
}

function normalizeWeight(weight: number) {
  if (!Number.isFinite(weight)) {
    return 1;
  }

  return Math.min(Math.max(Math.round(weight), 1), 999);
}
