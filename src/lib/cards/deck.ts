import type { RandomSource } from "@/lib/random/engine";

export const cardSuits = ["spades", "clubs", "diamonds", "hearts"] as const;
export const cardRanks = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
] as const;

export type CardSuit = (typeof cardSuits)[number];
export type CardRank = (typeof cardRanks)[number];

export type PlayingCard = {
  id: string;
  rank: CardRank;
  suit: CardSuit;
};

export type DrawCardsResult = {
  drawn: PlayingCard[];
  remaining: PlayingCard[];
};

const defaultRandom: RandomSource = Math.random;
const suitCodes: Record<CardSuit, string> = {
  clubs: "C",
  diamonds: "D",
  hearts: "H",
  spades: "S",
};
const suitSymbols: Record<CardSuit, string> = {
  clubs: "♣",
  diamonds: "♦",
  hearts: "♥",
  spades: "♠",
};

export function buildStandardDeck(): PlayingCard[] {
  return cardSuits.flatMap((suit) =>
    cardRanks.map((rank) => ({
      id: `${rank}${suitCodes[suit]}`,
      rank,
      suit,
    })),
  );
}

export function shuffleDeck(
  deck: PlayingCard[],
  random: RandomSource = defaultRandom,
) {
  const shuffled = [...deck];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(
      Math.min(Math.max(random(), 0), 0.999_999_999_999) * (index + 1),
    );
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function drawCards(deck: PlayingCard[], count: number): DrawCardsResult {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("draw count must be a positive integer");
  }

  const safeCount = Math.min(count, deck.length);

  return {
    drawn: deck.slice(0, safeCount),
    remaining: deck.slice(safeCount),
  };
}

export function getCardLabel(card: PlayingCard) {
  return `${card.rank}${suitSymbols[card.suit]}`;
}

export function isRedSuit(suit: CardSuit) {
  return suit === "diamonds" || suit === "hearts";
}
