<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- Unit tests: `npm test`
- Unit tests with coverage: `npm run test:coverage`
- E2E tests: `npm run test:e2e`

## Required Verification

Before reporting completion after code changes, run the smallest relevant verification:

- Formatting/lint for touched files
- Typecheck for TypeScript changes
- Unit tests for changed logic
- Build for routing, config, or framework changes
- Playwright check for visible UI changes

If a relevant check cannot be run, state why and describe the remaining risk.

## Next.js Local Docs

Before changing Next.js routing, config, server actions, caching, middleware, or build behavior, inspect the relevant docs under `node_modules/next/dist/docs/`.

Do not rely only on model memory for Next.js APIs in this repo.

## Local Conventions

- Follow the existing folder structure and naming.
- Prefer existing components, hooks, utilities, API clients, and test helpers before adding new abstractions.
- Keep changes scoped to the requested feature or bug.
- Do not introduce new dependencies without a clear reason.
- Preserve user changes and unrelated local work.

## App Context

AP Flour is a local-first PWA for quick group play tools: dice, wheel, picker, score, timer, saved presets, Thai/English UI, dark mode, and runtime-only cheat controls.

Prefer fast, touch-friendly, mobile-first interactions. Do not add accounts, server sync, analytics, or network persistence unless explicitly requested.

## Architecture

- `src/app/**` owns routes and page composition.
- `src/features/**` owns feature UI components.
- `src/lib/**` owns pure logic, stores, i18n, random engines, and persistence helpers.
- Keep game/tool logic in `src/lib/**` where it can be unit tested.
- Keep client-only browser APIs behind `"use client"` components or local-storage helpers.

## Local-First Data

- Saved presets and settings are device-local only.
- Do not introduce backend persistence or account-based sync by default.
- Never save runtime-only cheat settings into presets.
- When changing localStorage schemas, preserve existing user data or add a migration path.

## Localization

- User-facing copy must come from `src/lib/i18n/dictionaries.ts`.
- Keep `en` and `th` dictionaries structurally aligned.
- When adding dictionary placeholders, keep placeholder names identical across locales.
- Verify Thai text in the browser, not only terminal output.

## Adding Tools

When adding a new play tool:

- Add the route under `src/app/<tool>/page.tsx`.
- Add feature UI under `src/features/<tool>/`.
- Add pure logic under `src/lib/<tool>/` with unit tests.
- Register it in `src/lib/tools/catalog.ts`.
- Add English and Thai copy.
- Add or update E2E smoke coverage.

## Randomness And Cheat Controls

- Keep random selection logic deterministic enough to unit test by injecting or isolating randomness.
- Cheat controls are runtime-only admin tools.
- Do not expose cheat state in saved presets, shared data, or default UI flows.
- Validate weights, dice faces, item counts, and forced results at logic boundaries.

## UI And PWA Verification

For visible UI changes, check desktop and mobile-sized viewports.

Prioritize touch targets, readable Thai/English labels, dark mode, and no layout overflow.

For PWA-related changes, verify install metadata, icons, service worker behavior, and offline/local-first assumptions.

## Environment

- Never commit `.env*` files containing secrets.
- Use `.env.example` for documenting required variables.
- When adding a required environment variable, update `.env.example` and relevant setup docs.
