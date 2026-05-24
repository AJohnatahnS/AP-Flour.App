"use client";

import { useEffect, useMemo, useState } from "react";

import {
  calculateCountdownRemainingMs,
  calculateStopwatchElapsedMs,
  clampDurationSeconds,
  formatDuration,
} from "@/lib/timer/engine";

type TimerMode = "countdown" | "stopwatch";
type RunState = "idle" | "running" | "paused" | "complete";

export function TimerTool() {
  const [mode, setMode] = useState<TimerMode>("countdown");
  const [runState, setRunState] = useState<RunState>("idle");
  const [durationSeconds, setDurationSeconds] = useState(300);
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(300_000);
  const [stopwatchElapsedMs, setStopwatchElapsedMs] = useState(0);
  const [stopwatchAccumulatedMs, setStopwatchAccumulatedMs] = useState(0);

  const durationMs = durationSeconds * 1000;
  const displayValue = mode === "countdown" ? remainingMs : stopwatchElapsedMs;
  const statusLabel = useMemo(() => {
    if (runState === "complete") {
      return "Complete";
    }

    return runState[0].toUpperCase() + runState.slice(1);
  }, [runState]);

  useEffect(() => {
    if (runState !== "running" || startedAtMs === null) {
      return;
    }

    const interval = window.setInterval(() => {
      const nowMs = Date.now();

      if (mode === "countdown") {
        const next = calculateCountdownRemainingMs({
          durationMs,
          nowMs,
          startedAtMs,
        });

        setRemainingMs(next.remainingMs);

        if (next.isComplete) {
          setRunState("complete");
          setStartedAtMs(null);
        }
      } else {
        setStopwatchElapsedMs(
          calculateStopwatchElapsedMs({
            accumulatedMs: stopwatchAccumulatedMs,
            nowMs,
            startedAtMs,
          }),
        );
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [durationMs, mode, runState, startedAtMs, stopwatchAccumulatedMs]);

  function handleStartPause() {
    const nowMs = Date.now();

    if (runState === "running") {
      if (mode === "countdown" && startedAtMs !== null) {
        const next = calculateCountdownRemainingMs({
          durationMs,
          nowMs,
          startedAtMs,
        });
        setRemainingMs(next.remainingMs);
      }

      if (mode === "stopwatch" && startedAtMs !== null) {
        const nextElapsedMs = calculateStopwatchElapsedMs({
          accumulatedMs: stopwatchAccumulatedMs,
          nowMs,
          startedAtMs,
        });
        setStopwatchElapsedMs(nextElapsedMs);
        setStopwatchAccumulatedMs(nextElapsedMs);
      }

      setStartedAtMs(null);
      setRunState("paused");
      return;
    }

    if (mode === "countdown" && runState === "complete") {
      setRemainingMs(durationMs);
    }

    setStartedAtMs(nowMs);
    setRunState("running");
  }

  function handleReset() {
    setRunState("idle");
    setStartedAtMs(null);

    if (mode === "countdown") {
      setRemainingMs(durationMs);
    } else {
      setStopwatchElapsedMs(0);
      setStopwatchAccumulatedMs(0);
    }
  }

  function handleModeChange(nextMode: TimerMode) {
    setMode(nextMode);
    setRunState("idle");
    setStartedAtMs(null);
    setRemainingMs(durationMs);
    setStopwatchElapsedMs(0);
    setStopwatchAccumulatedMs(0);
  }

  function updateDuration(nextSeconds: number) {
    const clampedSeconds = clampDurationSeconds(nextSeconds);
    setDurationSeconds(clampedSeconds);

    if (runState !== "running") {
      setRemainingMs(clampedSeconds * 1000);
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted">Timer</p>
            <h1 className="text-2xl font-semibold tracking-normal">
              Countdown and stopwatch
            </h1>
          </div>
          <div className="grid grid-cols-2 rounded-md border border-border bg-background p-1">
            <button
              aria-pressed={mode === "countdown"}
              className={`h-10 rounded px-3 text-sm font-semibold transition ${
                mode === "countdown"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              onClick={() => handleModeChange("countdown")}
              type="button"
            >
              Countdown
            </button>
            <button
              aria-pressed={mode === "stopwatch"}
              className={`h-10 rounded px-3 text-sm font-semibold transition ${
                mode === "stopwatch"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              onClick={() => handleModeChange("stopwatch")}
              type="button"
            >
              Stopwatch
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-background p-5 text-center">
          <p className="text-sm font-medium text-muted">{statusLabel}</p>
          <div className="mt-3 font-mono text-7xl font-semibold tracking-normal sm:text-8xl">
            {formatDuration(displayValue)}
          </div>
        </div>

        {mode === "countdown" ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <NumberInput
              label="Minutes"
              max={1440}
              min={0}
              onChange={(minutes) =>
                updateDuration(minutes * 60 + (durationSeconds % 60))
              }
              value={Math.floor(durationSeconds / 60)}
            />
            <NumberInput
              label="Seconds"
              max={59}
              min={0}
              onChange={(seconds) =>
                updateDuration(Math.floor(durationSeconds / 60) * 60 + seconds)
              }
              value={durationSeconds % 60}
            />
          </div>
        ) : (
          <p className="mt-6 rounded-lg border border-dashed border-border bg-background p-4 text-sm text-muted">
            Stopwatch runs only while this page is open and active.
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            className="h-12 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            onClick={handleStartPause}
            type="button"
          >
            {runState === "running" ? "Pause" : "Start"}
          </button>
          <button
            className="h-12 rounded-md border border-border bg-surface px-4 text-sm font-semibold transition hover:border-primary"
            onClick={handleReset}
            type="button"
          >
            Reset
          </button>
        </div>
      </div>

      <aside className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-semibold">Quick countdowns</h2>
        <div className="mt-4 grid gap-2">
          {[60, 180, 300, 600].map((seconds) => (
            <button
              className="h-10 rounded-md border border-border bg-background px-3 text-sm font-semibold transition hover:border-primary"
              disabled={runState === "running"}
              key={seconds}
              onClick={() => updateDuration(seconds)}
              type="button"
            >
              {formatDuration(seconds * 1000)}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">
          Foreground-only. No sound, vibration, or background alarm.
        </p>
      </aside>
    </section>
  );
}

function NumberInput({
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
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <input
        className="h-11 rounded-md border border-border bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary"
        inputMode="numeric"
        max={max}
        min={min}
        onChange={(event) => {
          const nextValue = Number.parseInt(event.target.value, 10);

          if (!Number.isNaN(nextValue)) {
            onChange(Math.min(Math.max(nextValue, min), max));
          }
        }}
        type="number"
        value={value}
      />
    </label>
  );
}
