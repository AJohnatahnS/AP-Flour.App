"use client";

import Link from "next/link";

import { SavedPresetsSummary } from "@/features/presets/saved-presets-summary";
import { useLocaleCopy } from "@/lib/i18n/use-locale-copy";
import { getLocalizedToolCatalog } from "@/lib/tools/catalog";

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

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {toolCatalog.map((tool) => (
            <article
              className={`min-h-40 rounded-lg border border-border border-l-4 ${tool.tone} bg-surface p-4 shadow-sm`}
              key={tool.name}
            >
              <div className="flex h-full flex-col justify-between gap-5">
                <div>
                  <h2 className="text-xl font-semibold">{tool.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{tool.description}</p>
                </div>
                <Link
                  className="flex h-10 w-full items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                  href={getToolHref(tool.id)}
                >
                  {tool.action}
                </Link>
              </div>
            </article>
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

function getToolHref(toolId: string) {
  switch (toolId) {
    case "dice":
      return "/dice";
    case "wheel":
      return "/wheel";
    case "picker":
      return "/picker";
    case "score":
      return "/score";
    case "timer":
      return "/timer";
    default:
      return "/";
  }
}
