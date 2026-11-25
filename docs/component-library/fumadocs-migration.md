# Component documentation

The component library is a static Fumadocs site in `docs-app`. It imports the real React components from `src` and renders them with deterministic, docs-only fixtures. The site does not call Mews, D1, the Worker or admin APIs.

## Add a component page

1. Add a `*.story.tsx` file in `docs-app/components` that imports the real component and exports a `defineStory` example.
2. Use local state and deterministic fixtures for interactive behavior. Do not start a booking, payment or admin write.
3. Add a client wrapper in `docs-app/components/story-controls.tsx`.
4. Add the MDX page under `docs-app/content/docs/components/` with props, variants, responsive notes and a source link.
5. Add the page to `docs-app/content/docs/components/meta.json` and to the docs smoke page list when a new route is introduced.

`@fumadocs/story`, `createNextStory`, `defineStoryFactory`, `.WithControl` and the `.story.tsx` suffix are part of the live docs runtime.

## Shared preview layout

`docs-app/app/globals.css` owns `--component-docs-max-width: 1600px`. Docs pages and story frames use the same canvas width, the article owns the horizontal inset, and direct prose keeps a readable measure on wide screens. Runtime tests cover mobile, desktop and wide viewport overflow.

## Verification

Run from the repository root:

```bash
npm run test:docs
npm run typecheck
npm run lint:controls
npm run test:docs:dev
npm run docs:build
npm run docs:smoke
npm run test:docs:runtime
```

`docs:smoke` checks exported pages, rendered component markers, static assets and the absence of API or token strings. Playwright serves the export under the configured Pages base path and verifies search, deep links, responsive layouts and representative interactions. Published-site evidence is retained in `docs/component-library/live-verification*.json`.

## Publication

`REVREBEL/urban-cowboy-booking-engine` is public. GitHub Pages publication requires explicit opt-in on `main` through `DOCS_PAGES_ENABLED == "true"`. The workflow uses `DOCS_BASE_PATH`, defaults to `/urban-cowboy-booking-engine`, and supports `/` for a custom-domain root. The deployment URL comes from `actions/deploy-pages`.

No production cutover is part of the component documentation workflow. It does not change booking-engine or Cloudflare Worker behavior.

## Storybook retirement

COW-115 removed the Storybook and Chromatic runtime, dependencies, CI jobs, source stories and historical inventory generator. Fumadocs examples, the Vite component library, Node test suites and Playwright checks remain the active verification paths. Historical references to former Storybook states in component prose describe migrated variants; they are not runtime dependencies.
