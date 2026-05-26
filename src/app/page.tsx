"use client";

import Link from "next/link";

import { SavedPresetsSummary } from "@/features/presets/saved-presets-summary";
import { useLocaleCopy } from "@/lib/i18n/use-locale-copy";
import { getLocalizedToolCatalog, type ToolId } from "@/lib/tools/catalog";

export default function Home() {
  const copy = useLocaleCopy();
  const toolCatalog = getLocalizedToolCatalog(copy);

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted">{copy.tagline}</p>
            <h1 className="text-3xl font-semibold tracking-normal">{copy.appName}</h1>
          </div>
          <Link
            className="h-10 rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground shadow-sm transition hover:bg-surface-strong"
            href="/settings"
          >
            {copy.settings}
          </Link>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {toolCatalog.map((tool) => (
            <Link
              aria-label={tool.action}
              className={`group flex min-h-38 flex-col justify-between gap-3 rounded-lg border p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-44 sm:p-4 ${tool.surfaceClass}`}
              href={tool.href}
              key={tool.name}
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-md shadow-sm transition group-hover:scale-105 sm:h-16 sm:w-16 ${tool.iconClass}`}
              >
                <ToolIcon id={tool.icon} />
              </div>
              <div>
                <h2 className="text-lg font-semibold leading-tight sm:text-xl">
                  {tool.name}
                </h2>
                <p className="mt-2 hidden text-sm leading-6 opacity-75 sm:block">
                  {tool.description}
                </p>
              </div>
              <span className="text-sm font-semibold opacity-80">{tool.action}</span>
            </Link>
          ))}
        </section>

        <section className="rounded-lg border border-dashed border-border bg-surface/70 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">{copy.savedPresets}</h2>
              <p className="mt-1 text-sm text-muted">
                {copy.presetsDescription}
              </p>
            </div>
            <SavedPresetsSummary emptyLabel={copy.noPresets} />
          </div>
        </section>
      </div>
    </main>
  );
}

function ToolIcon({ id }: { id: ToolId }) {
  const iconClassName = "h-9 w-9 sm:h-10 sm:w-10";

  switch (id) {
    case "dice":
      return (
        <svg
          aria-hidden="true"
          className={iconClassName}
          fill="none"
          viewBox="0 0 48 48"
        >
          <rect
            className="fill-current opacity-95"
            height="20"
            rx="4"
            transform="rotate(-10 10 12)"
            width="20"
            x="10"
            y="12"
          />
          <rect
            className="fill-current opacity-70"
            height="20"
            rx="4"
            transform="rotate(8 20 18)"
            width="20"
            x="20"
            y="18"
          />
          <circle className="fill-current text-emerald-600 dark:text-emerald-300" cx="17" cy="20" r="2" />
          <circle className="fill-current text-emerald-600 dark:text-emerald-300" cx="24" cy="27" r="2" />
          <circle className="fill-current text-emerald-600 dark:text-emerald-300" cx="28" cy="27" r="2" />
          <circle className="fill-current text-emerald-600 dark:text-emerald-300" cx="32" cy="27" r="2" />
        </svg>
      );
    case "wheel":
      return (
        <svg
          aria-hidden="true"
          className={iconClassName}
          fill="none"
          viewBox="0 0 48 48"
        >
          <path className="fill-current opacity-95" d="M24 6a18 18 0 0 1 18 18H24z" />
          <path className="fill-current opacity-75" d="M42 24a18 18 0 0 1-18 18V24z" />
          <path className="fill-current opacity-55" d="M24 42A18 18 0 0 1 6 24h18z" />
          <path className="fill-current opacity-35" d="M6 24A18 18 0 0 1 24 6v18z" />
          <circle className="fill-current text-orange-100 dark:text-orange-950" cx="24" cy="24" r="5" />
          <path className="fill-current text-orange-100 dark:text-orange-950" d="m37 8 4 11-11-4z" />
        </svg>
      );
    case "picker":
      return (
        <svg
          aria-hidden="true"
          className={iconClassName}
          fill="none"
          viewBox="0 0 48 48"
        >
          <circle className="stroke-current opacity-50" cx="24" cy="24" r="16" strokeWidth="5" />
          <circle className="stroke-current opacity-75" cx="24" cy="24" r="8" strokeWidth="5" />
          <circle className="fill-current" cx="24" cy="24" r="4" />
          <path className="fill-current text-sky-100 dark:text-sky-950" d="m34 7 2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
        </svg>
      );
    case "cards":
      return (
        <svg
          aria-hidden="true"
          className={iconClassName}
          fill="none"
          viewBox="0 0 48 48"
        >
          <rect
            className="fill-current opacity-55"
            height="27"
            rx="4"
            transform="rotate(-10 12 11)"
            width="19"
            x="12"
            y="11"
          />
          <rect
            className="fill-current opacity-95"
            height="27"
            rx="4"
            transform="rotate(8 18 10)"
            width="19"
            x="18"
            y="10"
          />
          <path className="fill-current text-rose-100 dark:text-rose-950" d="M28 19c-3-5-10 0-5 5l5 5 5-5c5-5-2-10-5-5z" />
        </svg>
      );
    case "score":
      return (
        <svg
          aria-hidden="true"
          className={iconClassName}
          fill="none"
          viewBox="0 0 48 48"
        >
          <rect className="fill-current opacity-90" height="30" rx="5" width="34" x="7" y="9" />
          <path className="stroke-current text-violet-100 dark:text-violet-950" d="M17 19v10M12 24h10M31 19v10" strokeLinecap="round" strokeWidth="4" />
          <path className="stroke-current text-violet-100 dark:text-violet-950" d="M28 19h6M28 29h6" strokeLinecap="round" strokeWidth="4" />
        </svg>
      );
    case "timer":
      return (
        <svg
          aria-hidden="true"
          className={iconClassName}
          fill="none"
          viewBox="0 0 48 48"
        >
          <circle className="fill-current opacity-90" cx="24" cy="26" r="16" />
          <path className="stroke-current text-amber-950" d="M24 17v10l7 4" strokeLinecap="round" strokeWidth="4" />
          <path className="stroke-current text-amber-950" d="M18 6h12M24 6v5" strokeLinecap="round" strokeWidth="4" />
        </svg>
      );
  }
}
