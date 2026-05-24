export type ScorePlayer = {
  id: string;
  name: string;
  score: number;
};

const maxNameLength = 48;
const minScore = -9999;
const maxScore = 9999;

export function createScorePlayer({
  id,
  name,
}: {
  id: string;
  name: string;
}): ScorePlayer {
  return {
    id,
    name: normalizeName(name),
    score: 0,
  };
}

export function addScorePlayer(
  players: ScorePlayer[],
  player: { id: string; name: string },
) {
  return [...players, createScorePlayer(player)];
}

export function adjustScore(
  players: ScorePlayer[],
  id: string,
  amount: number,
) {
  return players.map((player) =>
    player.id === id
      ? { ...player, score: clampScore(player.score + amount) }
      : player,
  );
}

export function resetScore(players: ScorePlayer[], id: string) {
  return players.map((player) =>
    player.id === id ? { ...player, score: 0 } : player,
  );
}

export function resetAllScores(players: ScorePlayer[]) {
  return players.map((player) => ({ ...player, score: 0 }));
}

export function renameScorePlayer(
  players: ScorePlayer[],
  id: string,
  name: string,
) {
  return players.map((player) =>
    player.id === id ? { ...player, name: normalizeName(name) } : player,
  );
}

export function removeScorePlayer(players: ScorePlayer[], id: string) {
  if (players.length <= 1) {
    return players;
  }

  return players.filter((player) => player.id !== id);
}

function normalizeName(name: string) {
  const normalized = name.trim().replace(/\s+/g, " ");
  return (normalized || "Untitled").slice(0, maxNameLength);
}

function clampScore(score: number) {
  return Math.min(Math.max(score, minScore), maxScore);
}
