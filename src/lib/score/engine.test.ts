import { describe, expect, it } from "vitest";

import {
  addScorePlayer,
  adjustScore,
  createScorePlayer,
  removeScorePlayer,
  resetAllScores,
  resetScore,
  renameScorePlayer,
  type ScorePlayer,
} from "./engine";

describe("score engine", () => {
  it("creates players with normalized names and zero score", () => {
    expect(createScorePlayer({ id: "p1", name: "  Team   One  " })).toEqual({
      id: "p1",
      name: "Team One",
      score: 0,
    });

    expect(createScorePlayer({ id: "p2", name: "" }).name).toBe("Untitled");
  });

  it("adds a new player without mutating the original list", () => {
    const players: ScorePlayer[] = [
      { id: "p1", name: "One", score: 0 },
    ];

    const nextPlayers = addScorePlayer(players, {
      id: "p2",
      name: "Two",
    });

    expect(nextPlayers).toEqual([
      { id: "p1", name: "One", score: 0 },
      { id: "p2", name: "Two", score: 0 },
    ]);
    expect(players).toHaveLength(1);
  });

  it("adjusts, resets, and renames one player by id", () => {
    const players: ScorePlayer[] = [
      { id: "p1", name: "One", score: 0 },
      { id: "p2", name: "Two", score: 5 },
    ];

    expect(adjustScore(players, "p1", 5)[0].score).toBe(5);
    expect(adjustScore(players, "p2", -10)[1].score).toBe(-5);
    expect(resetScore(players, "p2")[1].score).toBe(0);
    expect(renameScorePlayer(players, "p1", "  Alpha  ")[0].name).toBe("Alpha");
  });

  it("resets all scores", () => {
    expect(
      resetAllScores([
        { id: "p1", name: "One", score: 3 },
        { id: "p2", name: "Two", score: -2 },
      ]),
    ).toEqual([
      { id: "p1", name: "One", score: 0 },
      { id: "p2", name: "Two", score: 0 },
    ]);
  });

  it("removes players but keeps at least one row", () => {
    expect(
      removeScorePlayer(
        [
          { id: "p1", name: "One", score: 0 },
          { id: "p2", name: "Two", score: 0 },
        ],
        "p1",
      ),
    ).toEqual([{ id: "p2", name: "Two", score: 0 }]);

    expect(removeScorePlayer([{ id: "p1", name: "One", score: 0 }], "p1")).toEqual([
      { id: "p1", name: "One", score: 0 },
    ]);
  });
});
