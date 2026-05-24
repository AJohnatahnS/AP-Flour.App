"use client";

import Link from "next/link";

import { useLocaleCopy } from "@/lib/i18n/use-locale-copy";

export function AppHeader() {
  const copy = useLocaleCopy();

  return (
    <header className="flex items-center justify-between gap-4">
      <Link
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground"
        href="/"
      >
        {copy.back}
      </Link>
      <p className="text-sm font-medium text-muted">{copy.appName}</p>
    </header>
  );
}
