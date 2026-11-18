# COW-69 Storybook to Fumadocs migration

## Status: proof of concept, no cutover

This branch adds a Fumadocs static docs workspace and verifies the Story integration with
real components. Storybook remains the current component environment. No Storybook package,
script, workflow or Cloudflare build step is removed yet.

## Inventory

`npm run docs:inventory` regenerates `docs/component-library/inventory.json`.

- 142 story files
- 345 named story exports
- 6 skipped files (2 dev tooling, 4 Storybook scaffold/example harnesses)

Counts by area: booking 38, rooms 17, rates 16, shared controls 49, photo journey 6,
forms 2, icons 3, feedback 3, layout 2, brand 1, media 1, plus skipped groups.
Each entry records source file, title, detected category, export names, planned Fumadocs
page and skip rationale.

## Compatibility decision

Installed versions: Next 16.4.6, `fumadocs-ui` 16.19.4, `fumadocs-core` 16.19.4,
`fumadocs-mdx` 15.6.3, `@fumadocs/story` 1.5.4, React 19.2.0, Tailwind v4.

The Next.js Fumadocs Story integration works with `output: "export"`. The PoC builds three
static HTML pages with no Node server or Worker. `@fumadocs/story/next` transforms the
`*.story.tsx` files, and `defineStoryFactory` supplies interactive controls.

Two static-build details are now part of the pattern:

1. MDX rendered in a server component cannot access `.WithControl` on a client-module
   proxy. A small client wrapper component renders the story control instead.
2. Fumadocs `baseUrl` must be `/` for the static routes emitted by the catch-all page.
   `DOCS_BASE_PATH` is applied through Next `basePath`/`assetPrefix`; a build with a
   project-style subpath was verified to prefix both assets and navigation links.

Search is disabled in the PoC because a static build has no search server. The bulk
migration must add the documented static Orama search or a static-compatible provider.
No server routes, SSR APIs, Mews calls, Worker bindings or D1 access are used.

## Design system continuity

`src/styles/documentation-layout.ts` owns `STORY_MAX_WIDTH = 1600` and the CSS variable
name. Storybook's layout re-exports the same values, and Fumadocs CSS consumes the same
token. The PoC preview frame is full width up to that maximum, uses padding that reduces on
small screens, and does not add nested horizontal scrolling.

The docs app imports the real `Pill`, `PreferenceIconButton` and design tokens from `src`.
`PreferenceIconButton` uses a controlled docs-only harness with deterministic local state.
It never touches booking state, Mews, payments or admin APIs.

## Publication constraints

`REVREBEL/urban-cowboy-booking-engine` is **public** (`private: false`). GitHub Pages
publication is still an explicit opt-in here: this branch does not enable publication or
guess a public URL until the sanitized fixtures, deep links and interactive controls are
verified.

`.github/workflows/docs-pages.yml`:

- PRs run install, typecheck, control lint, static build and smoke checks only.
- Main-branch publication is gated by repository variable `DOCS_PAGES_ENABLED == "true"`.
- For this application the Pages base path is `/urban-cowboy-booking-engine`. The workflow
  derives it from `github.event.repository.name`; `DOCS_BASE_PATH` can override it for a
  custom domain. The published URL comes from `actions/deploy-pages` output, not from a
  guessed value.
- Deploy permissions are limited to `pages: write` and `id-token: write` in the deploy
  job. A `component-docs` concurrency group prevents overlapping publications.

Publication requires an explicit repository decision on public visibility and a check that
the sanitized fixtures contain no guest PII, unpublished content or credentials.

## Verification

```bash
npm run docs:inventory
npm run typecheck
npm run lint:controls
npm run docs:build
npm run docs:smoke
```

`npm run docs:smoke` checks the exported pages, rendered component markers, static assets
and absence of API/token strings. A subpath build was also exercised with
`DOCS_BASE_PATH=/urban-cowboy-booking-engine`.

## Cutover gates before Storybook retirement

1. Convert the remaining 136 planned stories using the generated manifest, preserving
   meaningful variants and controls.
2. Add static-compatible search and source links across all pages.
3. Replace Storybook-based runtime and visual tests with Vitest/Testing Library and
   Playwright checks that run independently.
4. Verify published deep links, interactive controls, fonts, icons and images on the real
   Pages URL after the repository decision.
5. Only then remove Storybook dependencies, `.storybook/`, Chromatic workflow and
   Cloudflare-facing Storybook build coupling. Keep the application and Worker unchanged.

No production cutover happens in this PoC.
