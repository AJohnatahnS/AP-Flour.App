import { describe, expect, it } from "vitest";

import {
  calculateCountdownRemainingMs,
  calculateStopwatchElapsedMs,
  clampDurationSeconds,
  formatDuration,
} from "./engine";

describe("timer engine", () => {
  it("formats durations as mm:ss or hh:mm:ss", () => {
    expect(formatDuration(0)).toBe("00:00");
    expect(formatDuration(65_000)).toBe("01:05");
    expect(formatDuration(3_661_000)).toBe("01:01:01");
  });

  it("clamps countdown duration seconds to a practical range", () => {
    expect(clampDurationSeconds(-1)).toBe(1);
    expect(clampDurationSeconds(90)).toBe(90);
    expect(clampDurationSeconds(99_999)).toBe(86_400);
    expect(clampDurationSeconds(Number.NaN)).toBe(1);
  });

  it("calculates countdown remaining and completion state", () => {
    expect(
      calculateCountdownRemainingMs({
        durationMs: 60_000,
        nowMs: 10_000,
        startedAtMs: 0,
      }),
    ).toEqual({ remainingMs: 50_000, isComplete: false });

    expect(
      calculateCountdownRemainingMs({
        durationMs: 60_000,
        nowMs: 61_000,
        startedAtMs: 0,
      }),
    ).toEqual({ remainingMs: 0, isComplete: true });
  });

  it("calculates stopwatch elapsed with paused carry-over", () => {
    expect(
      calculateStopwatchElapsedMs({
        accumulatedMs: 5_000,
        nowMs: 9_000,
        startedAtMs: 7_000,
      }),
    ).toBe(7_000);
  });
});
