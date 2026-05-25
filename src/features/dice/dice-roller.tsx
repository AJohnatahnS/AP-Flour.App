"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";

import {
  buildDiceCheatOptions,
  getConfiguredCheatPin,
  isValidCheatPin,
} from "@/lib/cheat/dice";
import { useLocaleCopy } from "@/lib/i18n/use-locale-copy";
import {
  getPresetStoreServerSnapshot,
  getPresetStoreSnapshot,
  readPresetStore,
  subscribePresetStore,
  writePresetStore,
} from "@/lib/presets/local-storage";
import {
  createDicePreset,
  deletePreset,
  upsertPreset,
  type AppPreset,
  type DicePreset,
} from "@/lib/presets/store";
import {
  rollDice,
  supportedDiceSides,
  type DiceRollResult,
  type DiceSides,
} from "@/lib/random/engine";

const maxHistoryItems = 5;
const cheatGestureThreshold = 5;
const configuredCheatPin = getConfiguredCheatPin(
  process.env.NEXT_PUBLIC_CHEAT_PIN,
);

export function DiceRoller() {
  const copy = useLocaleCopy();
  const [sides, setSides] = useState<DiceSides>(6);
  const [count, setCount] = useState(2);
  const [modifier, setModifier] = useState(0);
  const [latestRoll, setLatestRoll] = useState<DiceRollResult | null>(null);
  const [history, setHistory] = useState<DiceRollResult[]>([]);
  const [presetName, setPresetName] = useState("");
  const [lastSavedPresetId, setLastSavedPresetId] = useState<string | null>(null);
  const cheatGestureCountRef = useRef(0);
  const [isCheatPromptOpen, setIsCheatPromptOpen] = useState(false);
  const [cheatPinInput, setCheatPinInput] = useState("");
  const [cheatError, setCheatError] = useState("");
  const [isCheatUnlocked, setIsCheatUnlocked] = useState(false);
  const [forceNextText, setForceNextText] = useState("");
  const [favoredFace, setFavoredFace] = useState<number | undefined>();
  const [favoredWeight, setFavoredWeight] = useState(8);
  const [cheatRollError, setCheatRollError] = useState("");
  const presetStore = useSyncExternalStore(
    subscribePresetStore,
    getPresetStoreSnapshot,
    getPresetStoreServerSnapshot,
  );
  const presets = useMemo(
    () => filterDicePresets(presetStore.presets),
    [presetStore.presets],
  );

  const rollLabel = useMemo(() => {
    const modifierLabel =
      modifier === 0 ? "" : modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
    return `${count}d${sides}${modifierLabel}`;
  }, [count, modifier, sides]);

  function handleRoll() {
    try {
      const cheat = isCheatUnlocked
        ? buildDiceCheatOptions({
            count,
            favoredFace,
            favoredWeight,
            forceNextText,
            sides,
          })
        : undefined;
      const result = rollDice({ sides, count, modifier }, { cheat });
      setLatestRoll(result);
      setHistory((items) => [result, ...items].slice(0, maxHistoryItems));
      setCheatRollError("");

      if (cheat?.forceNextResults) {
        setForceNextText("");
      }
    } catch (error) {
      setCheatRollError(
        error instanceof Error ? error.message : copy.tools.dice.invalidCheatSettings,
      );
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

    setCheatError(copy.tools.dice.incorrectPin);
  }

  function loadPreset(preset: DicePreset) {
    setSides(preset.value.sides);
    setCount(preset.value.count);
    setModifier(preset.value.modifier);
    setPresetName(preset.name);
    setLastSavedPresetId(preset.id);
  }

  function handleSavePreset() {
    const store = readPresetStore();
    const id = lastSavedPresetId ?? createPresetId();
    const existingPreset = store.presets.find((preset) => preset.id === id);
    const now = Date.now();
    const preset = createDicePreset({
      config: { sides, count, modifier },
      id,
      name: presetName,
      now,
    });
    const nextStore = upsertPreset(store, {
      ...preset,
      createdAt: existingPreset?.createdAt ?? preset.createdAt,
    });

    writePresetStore(nextStore);
    setPresetName(preset.name);
    setLastSavedPresetId(preset.id);
  }

  function handleDeletePreset(id: string) {
    const nextStore = deletePreset(readPresetStore(), id);
    writePresetStore(nextStore);

    if (lastSavedPresetId === id) {
      setLastSavedPresetId(null);
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button
              className="text-left text-sm font-medium text-muted"
              onClick={handleCheatGesture}
              type="button"
            >
              {copy.tools.dice.title}
            </button>
            <h1 className="text-2xl font-semibold tracking-normal">
              {copy.tools.dice.rollHeading.replace("{rollLabel}", rollLabel)}
            </h1>
          </div>
          <button
            className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            onClick={handleRoll}
            type="button"
          >
            {copy.tools.dice.roll}
          </button>
        </div>

        {isCheatPromptOpen && !isCheatUnlocked ? (
          <div className="mt-4 rounded-lg border border-border bg-background p-4">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label className="grid gap-2">
                <span className="text-sm font-semibold">
                  {copy.common.adminPin}
                </span>
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
                {copy.common.unlock}
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
              <h2 className="text-sm font-semibold">
                {copy.common.adminControls}
              </h2>
              <button
                className="h-8 rounded-md border border-border bg-surface px-2 text-xs font-medium text-muted transition hover:text-foreground"
                onClick={() => {
                  setIsCheatUnlocked(false);
                  setForceNextText("");
                  setFavoredFace(undefined);
                  setCheatRollError("");
                }}
                type="button"
              >
                {copy.common.lock}
              </button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-muted">
                  {copy.tools.dice.forceNextResult}
                </span>
                <input
                  className="h-10 rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
                  inputMode="numeric"
                  onChange={(event) => setForceNextText(event.target.value)}
                  placeholder="6, 6"
                  type="text"
                  value={forceNextText}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-muted">
                  {copy.tools.dice.favoredFace}
                </span>
                <select
                  className="h-10 rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
                  onChange={(event) =>
                    setFavoredFace(
                      event.target.value ? Number(event.target.value) : undefined,
                    )
                  }
                  value={favoredFace ?? ""}
                >
                  <option value="">{copy.common.none}</option>
                  {Array.from({ length: sides }, (_, index) => index + 1).map(
                    (face) => (
                      <option key={face} value={face}>
                        {face}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <NumberStepper
                label={copy.tools.dice.favoredWeight}
                max={100}
                min={2}
                onChange={setFavoredWeight}
                value={favoredWeight}
              />
            </div>
            {cheatRollError ? (
              <p className="mt-2 text-sm font-medium text-accent">
                {cheatRollError}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 grid gap-5">
          <fieldset>
            <legend className="text-sm font-semibold text-foreground">
              {copy.tools.dice.die}
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {supportedDiceSides.map((side) => (
                <button
                  aria-pressed={sides === side}
                  className={`h-11 rounded-md border px-3 text-sm font-semibold transition ${
                    sides === side
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface-strong text-foreground hover:border-primary"
                  }`}
                  key={side}
                  onClick={() => setSides(side)}
                  type="button"
                >
                  D{side}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <NumberStepper
              label={copy.tools.dice.dice}
              max={20}
              min={1}
              onChange={setCount}
              value={count}
            />
            <NumberStepper
              label={copy.tools.dice.modifier}
              max={999}
              min={-999}
              onChange={setModifier}
              value={modifier}
            />
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-background p-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">
                {copy.common.presetName}
              </span>
              <input
                className="h-11 rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
                maxLength={48}
                onChange={(event) => setPresetName(event.target.value)}
                placeholder={copy.tools.dice.presetPlaceholder}
                type="text"
                value={presetName}
              />
            </label>
            <button
              className="h-11 self-end rounded-md border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:border-primary"
              onClick={handleSavePreset}
              type="button"
            >
              {copy.common.savePreset}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            {copy.tools.dice.presetHelp}
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-background p-4">
          {latestRoll ? (
            <div>
              <p className="text-sm font-medium text-muted">
                {copy.tools.dice.latestResult}
              </p>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <span className="text-6xl font-semibold leading-none">
                  {latestRoll.total}
                </span>
                <span className="pb-1 text-sm font-medium text-muted">
                  {formatRoll(latestRoll)}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {latestRoll.rolls.map((roll, index) => (
                  <DieFace
                    index={index}
                    key={`${latestRoll.rolledAt}-${index}`}
                    roll={roll}
                    sides={latestRoll.sides}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-36 items-center justify-center text-center text-sm text-muted">
              {copy.tools.dice.emptyResult}
            </div>
          )}
        </div>
      </div>

      <aside className="grid gap-5">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold">{copy.tools.dice.presets}</h2>
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
                        {formatPresetValue(preset)}
                      </span>
                    </button>
                    <button
                      className="h-8 rounded-md border border-border px-2 text-xs font-medium text-muted transition hover:text-foreground"
                      onClick={() => handleDeletePreset(preset.id)}
                      type="button"
                    >
                      {copy.common.delete}
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted">
              {copy.tools.dice.emptyPresets}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            {copy.tools.dice.recentRolls}
          </h2>
          <button
            className="h-9 rounded-md border border-border bg-surface-strong px-3 text-sm font-medium text-muted transition hover:text-foreground"
            disabled={history.length === 0}
            onClick={() => {
              setHistory([]);
              setLatestRoll(null);
            }}
            type="button"
          >
            {copy.common.clear}
          </button>
        </div>
        {history.length > 0 ? (
          <ol className="mt-4 grid gap-2">
            {history.map((item) => (
              <li
                className="rounded-md border border-border bg-background p-3"
                key={item.rolledAt}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-muted">
                    {formatRoll(item)}
                  </span>
                  <span className="text-xl font-semibold">{item.total}</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {copy.tools.dice.rolls}: {item.rolls.join(", ")}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.rolls.map((roll, index) => (
                    <DieFace
                      index={index}
                      key={`${item.rolledAt}-${index}`}
                      roll={roll}
                      sides={item.sides}
                      size="sm"
                    />
                  ))}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted">
            {copy.tools.dice.emptyHistory}
          </p>
        )}
        </div>
      </aside>
    </section>
  );
}

function DieFace({
  index,
  roll,
  sides,
  size = "md",
}: {
  index: number;
  roll: number;
  sides: DiceSides;
  size?: "sm" | "md";
}) {
  const isD6 = sides === 6 && roll >= 1 && roll <= 6;
  const containerSize =
    size === "sm" ? "h-8 w-8 rounded" : "h-14 w-14 rounded-lg";
  const pipSize = size === "sm" ? "h-1.5 w-1.5" : "h-2.5 w-2.5";
  const label = `Die ${index + 1}: D${sides} rolled ${roll}`;

  if (!isD6) {
    return (
      <span
        aria-label={label}
        className={`inline-grid ${containerSize} place-items-center border border-border bg-surface text-center shadow-sm`}
        role="img"
        title={label}
      >
        <span className="grid leading-none">
          <span className={size === "sm" ? "text-[0.55rem]" : "text-[0.65rem]"}>
            D{sides}
          </span>
          <span className={size === "sm" ? "text-sm font-bold" : "text-lg font-bold"}>
            {roll}
          </span>
        </span>
      </span>
    );
  }

  return (
    <span
      aria-label={label}
      className={`inline-grid ${containerSize} grid-cols-3 grid-rows-3 gap-0.5 border border-border bg-surface p-1.5 shadow-sm`}
      role="img"
      title={label}
    >
      {Array.from({ length: 9 }, (_, pipIndex) => (
        <span
          className={`place-self-center rounded-full bg-foreground ${
            d6PipIndexes[roll].includes(pipIndex) ? pipSize : "h-0 w-0"
          }`}
          key={pipIndex}
        />
      ))}
    </span>
  );
}

const d6PipIndexes: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function NumberStepper({
  label,
  max,
  min,
  onChange,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}) {
  function setClampedValue(nextValue: number) {
    onChange(Math.min(Math.max(nextValue, min), max));
  }

  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] rounded-md border border-border bg-surface-strong">
        <button
          className="h-11 border-r border-border text-lg font-semibold transition hover:bg-surface disabled:text-muted"
          disabled={value <= min}
          onClick={() => setClampedValue(value - 1)}
          type="button"
        >
          -
        </button>
        <input
          className="h-11 min-w-0 bg-transparent px-3 text-center text-sm font-semibold outline-none"
          inputMode="numeric"
          max={max}
          min={min}
          onChange={(event) => {
            const nextValue = Number.parseInt(event.target.value, 10);
            if (!Number.isNaN(nextValue)) {
              setClampedValue(nextValue);
            }
          }}
          type="number"
          value={value}
        />
        <button
          className="h-11 border-l border-border text-lg font-semibold transition hover:bg-surface disabled:text-muted"
          disabled={value >= max}
          onClick={() => setClampedValue(value + 1)}
          type="button"
        >
          +
        </button>
      </div>
    </label>
  );
}

function formatRoll(result: DiceRollResult) {
  const modifierLabel =
    result.modifier === 0
      ? ""
      : result.modifier > 0
        ? ` + ${result.modifier}`
        : ` - ${Math.abs(result.modifier)}`;

  return `${result.count}d${result.sides}${modifierLabel}`;
}

function filterDicePresets(presets: AppPreset[]): DicePreset[] {
  return presets.filter((preset) => preset.toolId === "dice");
}

function createPresetId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `preset-${Date.now()}`;
}

function formatPresetValue(preset: DicePreset) {
  const modifier =
    preset.value.modifier === 0
      ? ""
      : preset.value.modifier > 0
        ? ` + ${preset.value.modifier}`
        : ` - ${Math.abs(preset.value.modifier)}`;

  return `${preset.value.count}d${preset.value.sides}${modifier}`;
}
