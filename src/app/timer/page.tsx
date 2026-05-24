import Link from "next/link";

import { TimerTool } from "@/features/timer/timer-tool";

export default function TimerPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground"
            href="/"
          >
            Back
          </Link>
          <p className="text-sm font-medium text-muted">AP Flour</p>
        </header>
        <TimerTool />
      </div>
    </main>
  );
}
