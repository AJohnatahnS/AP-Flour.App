"use client";

import { useEffect, useState } from "react";

import { formatCopy } from "@/lib/i18n/dictionaries";
import { useLocaleCopy } from "@/lib/i18n/use-locale-copy";
import {
  buildStandardDeck,
  drawCards,
  getCardLabel,
  isRedSuit,
  shuffleDeck,
  type PlayingCard,
} from "@/lib/cards/deck";

const maxDrawCount = 10;
const maxHistoryItems = 8;

export function CardsTool() {
  const copy = useLocaleCopy();
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [drawCount, setDrawCount] = useState(1);
  const [latestDraw, setLatestDraw] = useState<PlayingCard[]>([]);
  const [history, setHistory] = useState<PlayingCard[][]>([]);

  useEffect(() => {
    resetDeck();
  }, []);

  function resetDeck() {
    setDeck(shuffleDeck(buildStandardDeck()));
    setLatestDraw([]);
    setHistory([]);
  }

  function handleDraw() {
    if (deck.length === 0) {
      return;
    }

    const result = drawCards(deck, drawCount);
    setDeck(result.remaining);
    setLatestDraw(result.drawn);
    setHistory((items) => [result.drawn, ...items].slice(0, maxHistoryItems));
  }

  const effectiveDrawCount = Math.min(drawCount, deck.length);

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted">
              {copy.tools.cards.title}
            </p>
            <h1 className="text-2xl font-semibold tracking-normal">
              {formatCopy(copy.tools.cards.heading, {
                count: deck.length,
              })}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="h-11 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:border-primary"
              onClick={resetDeck}
              type="button"
            >
              {copy.tools.cards.shuffleDeck}
            </button>
            <button
              className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              disabled={deck.length === 0}
              onClick={handleDraw}
              type="button"
            >
              {copy.tools.cards.draw}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">
              {copy.tools.cards.drawCount}
            </span>
            <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] rounded-md border border-border bg-surface-strong">
              <button
                className="h-11 border-r border-border text-lg font-semibold transition hover:bg-surface disabled:text-muted"
                disabled={drawCount <= 1}
                onClick={() => setDrawCount((count) => Math.max(1, count - 1))}
                type="button"
              >
                -
              </button>
              <input
                className="h-11 min-w-0 bg-transparent px-3 text-center text-sm font-semibold outline-none"
                inputMode="numeric"
                max={maxDrawCount}
                min={1}
                onChange={(event) => {
                  const nextValue = Number.parseInt(event.target.value, 10);
                  if (!Number.isNaN(nextValue)) {
                    setDrawCount(Math.min(Math.max(nextValue, 1), maxDrawCount));
                  }
                }}
                type="number"
                value={drawCount}
              />
              <button
                className="h-11 border-l border-border text-lg font-semibold transition hover:bg-surface disabled:text-muted"
                disabled={drawCount >= maxDrawCount}
                onClick={() =>
                  setDrawCount((count) => Math.min(maxDrawCount, count + 1))
                }
                type="button"
              >
                +
              </button>
            </div>
          </label>

          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-semibold text-foreground">
              {copy.tools.cards.cardsRemaining}
            </p>
            <p className="mt-2 text-4xl font-semibold">{deck.length}</p>
            <p className="mt-1 text-sm text-muted">
              {deck.length === 0
                ? copy.tools.cards.deckEmpty
                : formatCopy(copy.tools.cards.nextDrawCount, {
                    count: effectiveDrawCount,
                  })}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-background p-4">
          {latestDraw.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-muted">
                {copy.tools.cards.latestDraw}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {latestDraw.map((card) => (
                  <PlayingCardView card={card} key={card.id} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-44 items-center justify-center text-center text-sm text-muted">
              {copy.tools.cards.emptyDraw}
            </div>
          )}
        </div>
      </div>

      <aside className="grid gap-5">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {copy.tools.cards.drawHistory}
            </h2>
            <button
              className="h-9 rounded-md border border-border bg-surface-strong px-3 text-sm font-medium text-muted transition hover:text-foreground"
              disabled={history.length === 0}
              onClick={() => {
                setHistory([]);
                setLatestDraw([]);
              }}
              type="button"
            >
              {copy.common.clear}
            </button>
          </div>
          {history.length > 0 ? (
            <ol className="mt-4 grid gap-2">
              {history.map((drawnCards, index) => (
                <li
                  className="rounded-md border border-border bg-background p-3 text-sm font-medium"
                  key={`${drawnCards.map((card) => card.id).join("-")}-${index}`}
                >
                  {drawnCards.map(getCardLabel).join(", ")}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted">
              {copy.tools.cards.emptyHistory}
            </p>
          )}
        </div>
      </aside>
    </section>
  );
}

function PlayingCardView({ card }: { card: PlayingCard }) {
  const redSuit = isRedSuit(card.suit);

  return (
    <div className="aspect-[5/7] rounded-lg border border-border bg-surface p-3 shadow-sm">
      <div
        className={`flex h-full flex-col justify-between rounded-md border border-border bg-background p-3 ${
          redSuit ? "text-red-600" : "text-foreground"
        }`}
      >
        <span className="text-xl font-semibold leading-none">
          {getCardLabel(card)}
        </span>
        <span className="self-center text-5xl font-semibold leading-none">
          {getCardLabel(card).slice(-1)}
        </span>
        <span className="self-end text-xl font-semibold leading-none">
          {getCardLabel(card)}
        </span>
      </div>
    </div>
  );
}
