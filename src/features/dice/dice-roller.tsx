"use client";

import { useMemo, useState } from "react";

import {
  rollDice,
  supportedDiceSides,
  type DiceRollResult,
  type DiceSides,
} from "@/lib/random/engine";

const maxHistoryItems = 5;

export function DiceRoller() {
  const [sides, setSides] = useState<DiceSides>(6);
  const [count, setCount] = useState(2);
  const [modifier, setModifier] = useState(0);
  const [latestRoll, setLatestRoll] = useState<DiceRollResult | null>(null);
  const [history, setHistory] = useState<DiceRollResult[]>([]);

  const rollLabel = useMemo(() => {
    const modifierLabel =
      modifier === 0 ? "" : modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
    return `${count}d${sides}${modifierLabel}`;
  }, [count, modifier, sides]);

  function handleRoll() {
    const result = rollDice({ sides, count, modifier });
    setLatestRoll(result);
    setHistory((items) => [result, ...items].slice(0, maxHistoryItems));
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted">Dice Roller</p>
            <h1 className="text-2xl font-semibold tracking-normal">
              Roll {rollLabel}
            </h1>
          </div>
          <button
            className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            onClick={handleRoll}
            type="button"
          >
            Roll
          </button>
        </div>

        <div className="mt-6 grid gap-5">
          <fieldset>
            <legend className="text-sm font-semibold text-foreground">Die</legend>
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
              label="Dice"
              max={20}
              min={1}
              onChange={setCount}
              value={count}
            />
            <NumberStepper
              label="Modifier"
              max={999}
              min={-999}
              onChange={setModifier}
              value={modifier}
            />
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-background p-4">
          {latestRoll ? (
            <div>
              <p className="text-sm font-medium text-muted">Latest result</p>
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
                  <span
                    className="inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-semibold"
                    key={`${latestRoll.rolledAt}-${index}`}
                  >
                    {roll}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-36 items-center justify-center text-center text-sm text-muted">
              Choose dice, then roll to see total and per-die results.
            </div>
          )}
        </div>
      </div>

      <aside className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recent rolls</h2>
          <button
            className="h-9 rounded-md border border-border bg-surface-strong px-3 text-sm font-medium text-muted transition hover:text-foreground"
            disabled={history.length === 0}
            onClick={() => {
              setHistory([]);
              setLatestRoll(null);
            }}
            type="button"
          >
            Clear
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
                  Rolls: {item.rolls.join(", ")}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted">
            No rolls yet.
          </p>
        )}
      </aside>
    </section>
  );
}

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
