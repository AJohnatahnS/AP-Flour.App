import { describe, expect, it } from "vitest";

import {
  buildStandardDeck,
  drawCards,
  getCardLabel,
  shuffleDeck,
  type PlayingCard,
} from "./deck";

describe("buildStandardDeck", () => {
  it("builds a 52-card deck with stable order and unique ids", () => {
    const deck = buildStandardDeck();

    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((card) => card.id)).size).toBe(52);
    expect(deck[0]).toEqual({
      id: "AS",
      rank: "A",
      suit: "spades",
    });
    expect(deck[51]).toEqual({
      id: "KH",
      rank: "K",
      suit: "hearts",
    });
  });
});

describe("shuffleDeck", () => {
  it("uses injected randomness and leaves the original deck unchanged", () => {
    const deck: PlayingCard[] = [
      { id: "AS", rank: "A", suit: "spades" },
      { id: "2S", rank: "2", suit: "spades" },
      { id: "3S", rank: "3", suit: "spades" },
    ];

    const shuffled = shuffleDeck(deck, () => 0);

    expect(shuffled.map((card) => card.id)).toEqual(["2S", "3S", "AS"]);
    expect(deck.map((card) => card.id)).toEqual(["AS", "2S", "3S"]);
  });
});

describe("drawCards", () => {
  it("draws from the top of the deck and returns the remaining deck", () => {
    const deck = buildStandardDeck();
    const result = drawCards(deck, 3);

    expect(result.drawn.map((card) => card.id)).toEqual(["AS", "2S", "3S"]);
    expect(result.remaining).toHaveLength(49);
    expect(result.remaining[0].id).toBe("4S");
  });

  it("clamps the requested draw count to the remaining deck size", () => {
    const deck = buildStandardDeck().slice(0, 2);
    const result = drawCards(deck, 5);

    expect(result.drawn).toHaveLength(2);
    expect(result.remaining).toHaveLength(0);
  });

  it("rejects non-positive and non-integer draw counts", () => {
    const deck = buildStandardDeck();

    expect(() => drawCards(deck, 0)).toThrow("draw count");
    expect(() => drawCards(deck, 1.5)).toThrow("draw count");
  });
});

describe("getCardLabel", () => {
  it("formats compact card labels", () => {
    expect(getCardLabel({ id: "QD", rank: "Q", suit: "diamonds" })).toBe(
      "Q♦",
    );
  });
});
