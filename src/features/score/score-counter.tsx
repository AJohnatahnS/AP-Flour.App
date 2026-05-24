"use client";

import { useState } from "react";

import { formatCopy } from "@/lib/i18n/dictionaries";
import { useLocaleCopy } from "@/lib/i18n/use-locale-copy";
import {
  addScorePlayer,
  adjustScore,
  removeScorePlayer,
  renameScorePlayer,
  resetAllScores,
  resetScore,
  type ScorePlayer,
} from "@/lib/score/engine";

const defaultPlayers: ScorePlayer[] = [
  { id: "score-1", name: "Team 1", score: 0 },
  { id: "score-2", name: "Team 2", score: 0 },
];

const scoreActions = [1, -1, 5, -5] as const;

export function ScoreCounter() {
  const copy = useLocaleCopy();
  const [players, setPlayers] = useState<ScorePlayer[]>(() =>
    defaultPlayers.map((player, index) => ({
      ...player,
      name: formatCopy(copy.tools.score.defaultPlayer, { count: index + 1 }),
    })),
  );

  function handleAddPlayer() {
    setPlayers((currentPlayers) =>
      addScorePlayer(currentPlayers, {
        id: createPlayerId(),
        name: formatCopy(copy.tools.score.defaultPlayer, {
          count: currentPlayers.length + 1,
        }),
      }),
    );
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted">
              {copy.tools.score.title}
            </p>
            <h1 className="text-2xl font-semibold tracking-normal">
              {copy.tools.score.heading}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              className="h-11 rounded-md border border-border bg-surface px-4 text-sm font-semibold transition hover:border-primary"
              onClick={handleAddPlayer}
              type="button"
            >
              {copy.tools.score.addPlayer}
            </button>
            <button
              className="h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              onClick={() => setPlayers((currentPlayers) => resetAllScores(currentPlayers))}
              type="button"
            >
              {copy.tools.score.resetAll}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {players.map((player) => (
            <article
              className="rounded-lg border border-border bg-background p-4"
              key={player.id}
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-muted">
                    {copy.tools.score.nameLabel}
                    <input
                      className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-base font-semibold outline-none transition focus:border-primary"
                      maxLength={48}
                      onChange={(event) =>
                        setPlayers((currentPlayers) =>
                          renameScorePlayer(
                            currentPlayers,
                            player.id,
                            event.target.value,
                          ),
                        )
                      }
                      type="text"
                      value={player.name}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between gap-3 lg:justify-end">
                  <span className="min-w-24 text-right text-5xl font-semibold leading-none">
                    {player.score}
                  </span>
                  <button
                    className="h-10 rounded-md border border-border bg-surface px-3 text-sm font-medium text-muted transition hover:text-foreground disabled:opacity-50"
                    disabled={players.length <= 1}
                    onClick={() =>
                      setPlayers((currentPlayers) =>
                        removeScorePlayer(currentPlayers, player.id),
                      )
                    }
                    type="button"
                  >
                    {copy.common.remove}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {scoreActions.map((amount) => (
                  <button
                    className="h-10 rounded-md border border-border bg-surface text-sm font-semibold transition hover:border-primary"
                    key={amount}
                    onClick={() =>
                      setPlayers((currentPlayers) =>
                        adjustScore(currentPlayers, player.id, amount),
                      )
                    }
                    type="button"
                  >
                    {amount > 0 ? `+${amount}` : amount}
                  </button>
                ))}
                <button
                  className="h-10 rounded-md border border-border bg-surface text-sm font-semibold text-muted transition hover:text-foreground"
                  onClick={() =>
                    setPlayers((currentPlayers) =>
                      resetScore(currentPlayers, player.id),
                    )
                  }
                  type="button"
                >
                  {copy.common.reset}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-semibold">{copy.tools.score.leaderboard}</h2>
        <ol className="mt-4 grid gap-2">
          {[...players]
            .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
            .map((player, index) => (
              <li
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-3"
                key={player.id}
              >
                <span className="text-sm font-medium text-muted">
                  {index + 1}. {player.name}
                </span>
                <span className="text-xl font-semibold">{player.score}</span>
              </li>
            ))}
        </ol>
      </aside>
    </section>
  );
}

function createPlayerId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `player-${Date.now()}`;
}
