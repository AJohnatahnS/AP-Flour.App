export const minTimerDurationSeconds = 1;
export const maxTimerDurationSeconds = 86_400;

export function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${padTimeUnit(hours)}:${padTimeUnit(minutes)}:${padTimeUnit(seconds)}`;
  }

  return `${padTimeUnit(minutes)}:${padTimeUnit(seconds)}`;
}

export function clampDurationSeconds(value: number) {
  if (!Number.isFinite(value)) {
    return minTimerDurationSeconds;
  }

  return Math.min(
    Math.max(Math.round(value), minTimerDurationSeconds),
    maxTimerDurationSeconds,
  );
}

export function calculateCountdownRemainingMs({
  durationMs,
  nowMs,
  startedAtMs,
}: {
  durationMs: number;
  nowMs: number;
  startedAtMs: number;
}) {
  const elapsedMs = Math.max(0, nowMs - startedAtMs);
  const remainingMs = Math.max(0, durationMs - elapsedMs);

  return {
    remainingMs,
    isComplete: remainingMs === 0,
  };
}

export function calculateStopwatchElapsedMs({
  accumulatedMs,
  nowMs,
  startedAtMs,
}: {
  accumulatedMs: number;
  nowMs: number;
  startedAtMs: number;
}) {
  return Math.max(0, accumulatedMs + nowMs - startedAtMs);
}

function padTimeUnit(value: number) {
  return String(value).padStart(2, "0");
}
