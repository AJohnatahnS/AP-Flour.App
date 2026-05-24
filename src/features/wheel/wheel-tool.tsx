"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";

import { getConfiguredCheatPin, isValidCheatPin } from "@/lib/cheat/dice";
import {
  applyRandomListCheatWeights,
  findForcedRandomListItem,
} from "@/lib/cheat/random-list";
import {
  getPresetStoreServerSnapshot,
  getPresetStoreSnapshot,
  readPresetStore,
  subscribePresetStore,
  writePresetStore,
} from "@/lib/presets/local-storage";
import {
  createRandomListPreset,
  deletePreset,
  upsertPreset,
  type AppPreset,
  type RandomListPreset,
} from "@/lib/presets/store";
import {
  drawRandomListItem,
  removeRandomListItem,
  sanitizeRandomListItems,
  type RandomListItem,
} from "@/lib/random-list/engine";

const defaultItems: RandomListItem[] = [
  { id: "wheel-1", label: "Alice", color: "#ef4444", weight: 1, enabled: true },
  { id: "wheel-2", label: "Bob", color: "#22c55e", weight: 1, enabled: true },
  { id: "wheel-3", label: "Chris", color: "#3b82f6", weight: 1, enabled: true },
  { id: "wheel-4", label: "Dana", color: "#f59e0b", weight: 1, enabled: true },
];
const cheatGestureThreshold = 5;
const configuredCheatPin = getConfiguredCheatPin(
  process.env.NEXT_PUBLIC_CHEAT_PIN,
);

export function WheelTool() {
  const [items, setItems] = useState<RandomListItem[]>(defaultItems);
  const [result, setResult] = useState<RandomListItem | null>(null);
  const [history, setHistory] = useState<RandomListItem[]>([]);
  const [removeWinner, setRemoveWinner] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [presetName, setPresetName] = useState("");
  const [lastSavedPresetId, setLastSavedPresetId] = useState<string | null>(null);
  const cheatGestureCountRef = useRef(0);
  const [isCheatPromptOpen, setIsCheatPromptOpen] = useState(false);
  const [cheatPinInput, setCheatPinInput] = useState("");
  const [cheatError, setCheatError] = useState("");
  const [isCheatUnlocked, setIsCheatUnlocked] = useState(false);
  const [forceNextItemId, setForceNextItemId] = useState("");
  const [favoredItemId, setFavoredItemId] = useState("");
  const [favoredWeight, setFavoredWeight] = useState(8);
  const presetStore = useSyncExternalStore(
    subscribePresetStore,
    getPresetStoreSnapshot,
    getPresetStoreServerSnapshot,
  );
  const presets = useMemo(
    () => filterWheelPresets(presetStore.presets),
    [presetStore.presets],
  );
  const activeItems = items.filter((item) => item.enabled);
  const wheelBackground = buildWheelBackground(activeItems);

  function handleSpin() {
    const forcedItem = isCheatUnlocked
      ? findForcedRandomListItem(items, forceNextItemId)
      : null;
    const weightedItems = isCheatUnlocked
      ? applyRandomListCheatWeights(items, {
          favoredItemId,
          favoredWeight,
        })
      : items;
    const pickedItem = forcedItem ?? drawRandomListItem(weightedItems);

    if (!pickedItem) {
      setResult(null);
      return;
    }

    const pickedIndex = Math.max(
      activeItems.findIndex((item) => item.id === pickedItem.id),
      0,
    );
    const segmentDegrees = activeItems.length > 0 ? 360 / activeItems.length : 360;
    const targetOffset = pickedIndex * segmentDegrees + segmentDegrees / 2;

    setRotation((currentRotation) => currentRotation + 1080 + (360 - targetOffset));
    setResult(pickedItem);
    setHistory((currentHistory) => [pickedItem, ...currentHistory].slice(0, 8));

    if (removeWinner) {
      setItems((currentItems) => removeRandomListItem(currentItems, pickedItem.id));
    }

    if (forcedItem) {
      setForceNextItemId("");
    }
  }

  function handleCheatGesture() {
    const nextCount = cheatGestureCountRef.current + 1;

    if (nextCount >= cheatGestureThreshold) {
      cheatGestureCountRef.current = 0;
      setIsCheatPromptOpen(true);
      return;
    }

    cheatGestureCountRef.current = nextCount;
  }

  function handleUnlockCheat() {
    if (isValidCheatPin(cheatPinInput, configuredCheatPin)) {
      setIsCheatUnlocked(true);
      setIsCheatPromptOpen(false);
      setCheatPinInput("");
      setCheatError("");
      return;
    }

    setCheatError("Incorrect PIN");
  }

  function handleUpdateItem(id: string, nextItem: Partial<RandomListItem>) {
    setItems((currentItems) =>
      sanitizeRandomListItems(
        currentItems.map((item) =>
          item.id === id ? { ...item, ...nextItem } : item,
        ),
      ),
    );
  }

  function handleAddItem() {
    setItems((currentItems) =>
      sanitizeRandomListItems([
        ...currentItems,
        {
          id: createItemId(),
          label: `Item ${currentItems.length + 1}`,
          color: "#64748b",
          weight: 1,
          enabled: true,
        },
      ]),
    );
  }

  function handleRemoveItem(id: string) {
    setItems((currentItems) => removeRandomListItem(currentItems, id));
  }

  function handleSavePreset() {
    const store = readPresetStore();
    const id = lastSavedPresetId ?? createItemId();
    const existingPreset = store.presets.find((preset) => preset.id === id);
    const now = Date.now();
    const preset = createRandomListPreset({
      id,
      items,
      name: presetName,
      now,
      toolId: "wheel",
    });
    const nextStore = upsertPreset(store, {
      ...preset,
      createdAt: existingPreset?.createdAt ?? preset.createdAt,
    });

    writePresetStore(nextStore);
    setPresetName(preset.name);
    setLastSavedPresetId(preset.id);
  }

  function loadPreset(preset: RandomListPreset) {
    setItems(preset.value.items);
    setPresetName(preset.name);
    setLastSavedPresetId(preset.id);
    setResult(null);
    setHistory([]);
    setRotation(0);
  }

  function handleDeletePreset(id: string) {
    writePresetStore(deletePreset(readPresetStore(), id));

    if (lastSavedPresetId === id) {
      setLastSavedPresetId(null);
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button
              className="text-left text-sm font-medium text-muted"
              onClick={handleCheatGesture}
              type="button"
            >
              Wheel
            </button>
            <h1 className="text-2xl font-semibold tracking-normal">
              Spin {activeItems.length} active items
            </h1>
          </div>
          <button
            className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            disabled={activeItems.length === 0}
            onClick={handleSpin}
            type="button"
          >
            Spin
          </button>
        </div>

        {isCheatPromptOpen && !isCheatUnlocked ? (
          <div className="mt-4 rounded-lg border border-border bg-background p-4">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Admin PIN</span>
                <input
                  className="h-11 rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
                  inputMode="numeric"
                  maxLength={4}
                  onChange={(event) => setCheatPinInput(event.target.value)}
                  type="text"
                  value={cheatPinInput}
                />
              </label>
              <button
                className="h-11 self-end rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                onClick={handleUnlockCheat}
                type="button"
              >
                Unlock
              </button>
            </div>
            {cheatError ? (
              <p className="mt-2 text-sm font-medium text-accent">{cheatError}</p>
            ) : null}
          </div>
        ) : null}

        {isCheatUnlocked ? (
          <div className="mt-4 rounded-lg border border-accent bg-accent-soft p-4 text-foreground">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Admin controls</h2>
              <button
                className="h-8 rounded-md border border-border bg-surface px-2 text-xs font-medium text-muted transition hover:text-foreground"
                onClick={() => {
                  setIsCheatUnlocked(false);
                  setForceNextItemId("");
                  setFavoredItemId("");
                }}
                type="button"
              >
                Lock
              </button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-muted">
                  Force next
                </span>
                <select
                  className="h-10 rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
                  onChange={(event) => setForceNextItemId(event.target.value)}
                  value={forceNextItemId}
                >
                  <option value="">None</option>
                  {activeItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-muted">
                  Favored item
                </span>
                <select
                  className="h-10 rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
                  onChange={(event) => setFavoredItemId(event.target.value)}
                  value={favoredItemId}
                >
                  <option value="">None</option>
                  {activeItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-muted">
                  Favored weight
                </span>
                <input
                  className="h-10 rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
                  min={2}
                  onChange={(event) =>
                    setFavoredWeight(Number.parseInt(event.target.value, 10) || 2)
                  }
                  type="number"
                  value={favoredWeight}
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-muted">
              Runtime only. Presets keep the original list and weights.
            </p>
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <div className="flex items-center justify-center">
            <div className="relative aspect-square w-full max-w-80">
              <div className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-[12px] border-t-[24px] border-x-transparent border-t-foreground" />
              <div
                aria-label="Spin wheel"
                className="h-full w-full rounded-full border border-border shadow-sm transition-transform duration-700 ease-out"
                style={{
                  background: wheelBackground,
                  transform: `rotate(${rotation}deg)`,
                }}
              />
              <div className="absolute inset-[42%] rounded-full border border-border bg-surface shadow-sm" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-4">
            {result ? (
              <div>
                <p className="text-sm font-medium text-muted">Winner</p>
                <div className="mt-2 flex items-center gap-3">
                  <span
                    className="h-5 w-5 rounded-full border border-border"
                    style={{ backgroundColor: result.color }}
                  />
                  <span className="text-4xl font-semibold">{result.label}</span>
                </div>
              </div>
            ) : (
              <div className="flex min-h-40 items-center justify-center text-center text-sm text-muted">
                Spin the wheel to choose a winner.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-background p-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">
                Preset name
              </span>
              <input
                className="h-11 rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
                maxLength={48}
                onChange={(event) => setPresetName(event.target.value)}
                placeholder="Prize wheel"
                type="text"
                value={presetName}
              />
            </label>
            <button
              className="h-11 self-end rounded-md border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:border-primary"
              onClick={handleSavePreset}
              type="button"
            >
              Save preset
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Items</h2>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-muted">
                <input
                  checked={removeWinner}
                  className="h-4 w-4 accent-[var(--primary)]"
                  onChange={(event) => setRemoveWinner(event.target.checked)}
                  type="checkbox"
                />
                Remove winner
              </label>
              <button
                className="h-9 rounded-md border border-border bg-surface px-3 text-sm font-semibold transition hover:border-primary"
                onClick={handleAddItem}
                type="button"
              >
                Add
              </button>
            </div>
          </div>

          {items.map((item) => (
            <div
              className="grid gap-2 rounded-md border border-border bg-surface p-3 sm:grid-cols-[2.5rem_minmax(0,1fr)_5rem_4rem_4.5rem]"
              key={item.id}
            >
              <input
                aria-label={`${item.label} color`}
                className="h-10 w-10 rounded-md border border-border bg-transparent"
                onChange={(event) =>
                  handleUpdateItem(item.id, { color: event.target.value })
                }
                type="color"
                value={item.color}
              />
              <input
                aria-label={`${item.label} label`}
                className="h-10 min-w-0 rounded-md border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
                onChange={(event) =>
                  handleUpdateItem(item.id, { label: event.target.value })
                }
                type="text"
                value={item.label}
              />
              <input
                aria-label={`${item.label} weight`}
                className="h-10 rounded-md border border-border bg-background px-2 text-sm outline-none transition focus:border-primary"
                min={1}
                onChange={(event) =>
                  handleUpdateItem(item.id, {
                    weight: Number.parseInt(event.target.value, 10) || 1,
                  })
                }
                type="number"
                value={item.weight}
              />
              <label className="flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background text-xs font-medium text-muted">
                <input
                  checked={item.enabled}
                  className="h-4 w-4 accent-[var(--primary)]"
                  onChange={(event) =>
                    handleUpdateItem(item.id, { enabled: event.target.checked })
                  }
                  type="checkbox"
                />
                On
              </label>
              <button
                className="h-10 rounded-md border border-border bg-background px-2 text-xs font-medium text-muted transition hover:text-foreground"
                onClick={() => handleRemoveItem(item.id)}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <aside className="grid gap-5">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold">Wheel presets</h2>
          {presets.length > 0 ? (
            <ol className="mt-4 grid gap-2">
              {presets.map((preset) => (
                <li
                  className="rounded-md border border-border bg-background p-3"
                  key={preset.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      className="min-w-0 text-left"
                      onClick={() => loadPreset(preset)}
                      type="button"
                    >
                      <span className="block truncate text-sm font-semibold">
                        {preset.name}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {preset.value.items.length} items
                      </span>
                    </button>
                    <button
                      className="h-8 rounded-md border border-border px-2 text-xs font-medium text-muted transition hover:text-foreground"
                      onClick={() => handleDeletePreset(preset.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted">
              No wheel presets saved.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold">Spin history</h2>
          {history.length > 0 ? (
            <ol className="mt-4 grid gap-2">
              {history.map((item, index) => (
                <li
                  className="flex items-center gap-2 rounded-md border border-border bg-background p-3 text-sm font-medium"
                  key={`${item.id}-${index}`}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted">
              No spins yet.
            </p>
          )}
        </div>
      </aside>
    </section>
  );
}

function buildWheelBackground(items: RandomListItem[]) {
  if (items.length === 0) {
    return "conic-gradient(#deded4 0deg 360deg)";
  }

  const segmentSize = 360 / items.length;
  const segments = items.map((item, index) => {
    const start = index * segmentSize;
    const end = start + segmentSize;
    return `${item.color} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function filterWheelPresets(presets: AppPreset[]): RandomListPreset[] {
  return presets.filter(
    (preset): preset is RandomListPreset => preset.toolId === "wheel",
  );
}

function createItemId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `item-${Date.now()}`;
}
