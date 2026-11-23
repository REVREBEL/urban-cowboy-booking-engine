# COW-69 Storybook to Fumadocs migration

## COW-85 follow-up coverage and live verification

Coverage matrix after the M3 slice: **142 stories — 58 documented, 78 planned, 6 excluded**;
**41 production candidates — 0 deferred, 41 dispositioned** (32 excluded, 9 now family-covered or
documented). The previous 9 deferred entries are resolved with evidence:

| Candidate | Disposition | Evidence |
| --- | --- | --- |
| Stars, HotBadge, FavoriteBadge, ViewersNudge, SavingsLine, HoldTimer | family-covered | `docs-app/content/docs/components/conversion-badges.mdx` (interactive visibility/count/timer states) |
| InlineUpsell, UpsellCard | family-covered | `docs-app/content/docs/components/extras-upsell.mdx` (deterministic `ShapedProduct` fixture, inline and card demos) |
| ExpandedSearchButton | family-covered | `docs-app/content/docs/components/search-bar.mdx` (expanded panel demo with props and section/value callbacks) |
| RoomListCard | documented | `docs-app/content/docs/components/room-list-card.mdx` (theme variants, deterministic `ShapedRoom` fixture) |

New production-relevant pages (six): `search-bar`, `search-dropdowns` (guests, location, promo),
`booking-chrome` (header + contact bar), `conversion-badges`, `extras-upsell`, `room-list-card`.
Each uses the real source component with a docs-only
harness, deterministic fixture, props/variants table, responsive notes and a source link. No page
calls Mews, starts a booking or writes admin state. `BookingFooter` is intentionally not demoed:
it calls `api.locations()` and reads live booking context.

`npm run docs:inventory:check` now fails when a `documented` row points at a missing or unindexed
page, when an `excluded` row has no rationale, or when a production candidate has an invalid
category, no rationale, or a claimed `documented`/`family-covered` page that is missing or not in
`components/meta.json`. Fresh generated files alone are no longer enough to pass.

### Live published-site check

Checked **2026-11-20T08:18Z** (UTC), before these new pages were merged/deployed:

| Check | Result |
| --- | --- |
| `https://revrebel.github.io/urban-cowboy-booking-engine/` | 200, redirects to `http://resource-hub.revrebel.io/urban-cowboy-booking-engine/` |
| Deep link `/components/button/` (custom domain) | 200, rendered marker `Book Your Stay` |
| `/search-index.json` | 200, 252,398 bytes |
| Asset URLs | base-path prefixed `/urban-cowboy-booking-engine/_next/static/...` |
| `/components/search-bar/` | 404 — expected until main deploys this PR |

Follow-ups: (1) the custom domain currently redirects to **http** and `https://resource-hub.revrebel.io`
fails certificate validation (`SSL: no alternative certificate subject name matches`); the Pages
custom-domain certificate needs fixing. (2) Re-run the live checks after merge/deploy to confirm the
six new pages, static search entries and interactive demos are published.

## COW-85 M3 — remaining historical catalog audit

Four family pages were added in this M3 slice, covering 16 previously planned stories with real
source imports and docs-only deterministic harnesses:

| Page | Stories covered |
| --- | --- |
| `focus-amenity.mdx` | `FocusAmenity`, `FocusAmenityAction`, `FocusAmenityCard`, `FocusAmenityCount`, `FocusAmenityIcon`, `SideFocusAmenityBar` |
| `rate-offers.mdx` | `RateOfferCard`, `ConfigurableRateOffer`, `RateOfferSidePanel`, `PolicyDisplay` |
| `booking-summary.mdx` | `StaySummary`, `ReservationSummaryBar` |
| `booking-details.mdx` | `BestRateGuaranteedLabel`, `PropertyLocationLabel`, `PropertyPropertyLabel`, `RusticLodgeSignboard` |
| M1 context (not added here) | `room-list-card.mdx`, `extras-upsell.mdx`, `search-bar.mdx` — already merged in PR #355 |

`CheckoutStep`, `BookingSummary` and `StayBreakdown` remain planned: they embed `BookingSummary` or
read the live `BookingProvider`, which loads hotel data, geolocation and tracking. Demoing them
would have side effects, so the documentation explicitly records the need for a side-effect-free
fixture. The remaining 78 planned rows carry category-specific rationales in the matrix: generic
shadcn/ui primitives, rate/room presentation variants needing live fixtures, and implementation-detail
icon sets. No row claims coverage merely because a related page exists.

All planned rows now have a specific note; the inventory generator and `docs:inventory:check` verify
that documented rows point at real indexed pages and that exclusions/candidate dispositions carry
evidence.

## COW-85 M4 — live published-site verification

Dated baseline: **2026-11-23T16:44Z** against `https://revrebel.github.io/urban-cowboy-booking-engine/`
(which 301s to `http://resource-hub.revrebel.io/urban-cowboy-booking-engine/`). Reproduce with
`node scripts/fumadocs/verify-live-site.mjs`.

| Check | Result |
| --- | --- |
| All 10 M1/M3 component pages + home | 200 at desktop (1280×900) and mobile (375×812) |
| Refreshable deep links | All 10 pages survive reload at the same URL |
| Static search | `Focus` finds `focus-amenity`; selecting the result navigates to that page |
| Interactive demos | Amenity rail toggle changes state; rate-panel close/reopen works |
| Console / network errors | **FAILED** — repeated 404s for inline mask/background assets |
| Custom-domain HTTPS | **FAILED** — `resource-hub.revrebel.io` serves a `*.github.io` certificate (`subjectAltName` mismatch) and the redirect targets `http://` |

The 404s are root-relative `url(/assets/...)` references inside inline component styles (the booking
header logo, expanded-search arrow and amenity badge) plus signboard artwork that the docs build did
not copy. The local `docs:smoke` check could not catch them because it only inspects static HTML
`src`/`href`. Fixes are in PR #363: `finalize-docs-assets.mjs` now prefixes inline URLs and
`prepare-docs-assets.mjs` copies the missing assets. The verifier itself now fails on broken images
and missing demo controls instead of silently skipping them.

After PR #363 merged and deployed, the verifier was rerun on 2026-11-23: all 10 pages returned 200
at desktop and mobile, all deep links refreshed, static search and its navigation worked, and both
demo interactions passed. Two findings remained: (1) one `wifi_badge.svg` 404 from `AmenityIcon`'s
default base path, fixed in PR #364 by passing the docs `basePath`; and (2) the known custom-domain
HTTPS downgrade. The verifier now enforces an explicit host allowlist and HTTPS protocol policy
(`DOCS_ALLOW_HTTP=1` only for the documented deviation).

**Post-deploy acceptance (open):** merge PR #364, wait for the Pages deployment from `main`, rerun
`node scripts/fumadocs/verify-live-site.mjs`, and record a passing result here. The custom-domain HTTPS
certificate/redirect remains a separate infrastructure follow-up; the canonical URL must use valid HTTPS.

## COW-70 catalog coverage

`docs/component-library/coverage-matrix.json` is the tracked catalog matrix. Regenerate it
with `npm run docs:inventory`; it maps each historical story to its canonical component,
Fumadocs page, demo exports and status (`documented`, `planned` or `excluded`), and lists
production components with no story as triage candidates. Exclusions carry a rationale
(development-only tooling or Storybook scaffold), never a silent skip.

First migrated group: shared controls. `Button` and `Switch` now have reference pages using
the real source imports and interactive demos. The Button page carries the former
AllColors/TextCases/BorderColors/Clickable/Sizes variants into a deterministic grid; the
Switch page uses a controlled docs-only harness with a paired `Label`.

The coverage matrix is keyed on explicit story-source-to-MDX-page overrides, not basename
matching; `npm run docs:inventory:check` fails CI when generated files are stale. A Playwright
smoke test serves the exported site under the configured Pages base path and verifies that the
DogToggleButton icons load before and after hydration-driven toggling, because rewriting static
HTML alone cannot fix client-rendered image URLs. DogToggleButton accepts an optional
`imageBaseUrl`, and the docs story passes `NEXT_PUBLIC_DOCS_BASE_PATH`.

Second migrated group: search, date and party controls. `DogToggleButton`,
`FindYourStayTravelPartyButton` and `SearchButton` have reference pages with controlled
docs-only harnesses. The travel-party demo uses the real `TravelPartyGroup` for accessible
radio-group semantics, and root-relative component icons are copied and base-path prefixed
during the static docs build.

Third migrated group: rooms, rates and merchandising. `BuildingIcon`, `AmenityIcons` and
`ConfigurableRateCard` have reference pages using the real source components with
deterministic fixtures. `BuildingIcon` also accepts `imageBaseUrl` for its CSS-mask assets,
and the docs build copies every checked-in building SVG so the runtime smoke can verify the
masks resolve under the Pages base path. The rate-card harness keeps expand/confirm state
local; it never creates a reservation or starts a payment.

Fourth migrated group: journey, media and recommendation/compare. The six photo-journey
stories, `Photo`, and the five discovery/results stories have reference pages using the real
source components with deterministic studio fixtures and local icon assets. Journey flows keep
date, guest and selection state in docs-only harnesses; `loadCalendar` is a no-op and no
reservation, payment or admin write is triggered. `PhotoTourArrow`, `RoomMatcherPage` and
`MatchBenefitsCard` gained an optional `imageBaseUrl` for their root-relative assets, and the
docs build copies those icons/illustrations for the static export.

Fifth migrated group: forms, feedback and booking layout. `DateRangePicker`, `PhoneInput`,
`EmptyState`, `ErrorState`, `LoadingState`, `StepLayout`, `StepProgress`, `ProgressBar` and
`ProgressStep` have reference pages with local-only state and the real `BookingProvider` where
the layout needs it. `EmptyState` gained an optional `imageBaseUrl` for its illustration.

The 41 production components with no historical story are triaged explicitly in the coverage
matrix rather than listed as an unexplained backlog. Candidate categories are `excluded`,
`deferred`, `documented` and `family-covered` (COW-85 added the last two), each with a rationale
and, for documented/family-covered rows, a page in `components/meta.json`. Current totals are
32 excluded, 0 deferred, 1 documented and 8 family-covered. The inventory generator fails if a
new candidate has no decision or claims coverage that does not exist, so the record cannot
silently go stale.

Sixth stage: static search and published-output verification. Catalog search is enabled in
`RootProvider` with Fumadocs' `static` client and a build-time `search-index.json` generated
from the MDX frontmatter and prose; there is no search API route or external service. The
static build also copies the brand fonts into the docs export and rewrites root-relative
`@font-face` URLs under the Pages base path. Playwright serves the export under
`/urban-cowboy-booking-engine` and verifies search-and-navigate, deep links at desktop and
mobile widths, and that no asset 404s occur.

Both `docs:prepare` (assets plus search index) and `docs:build` share the same preparation
step. `docs:dev` runs `dev-docs.mjs`, which performs that preparation on a clean checkout and
watches `docs-app/content/docs` and the source asset tree, refreshing the search index and
copied assets when files change. `npm run test:docs:dev` removes the generated outputs and
verifies that search and representative assets are served by the dev server; the docs CI runs
it on a clean checkout before the production build.

Published site: `https://revrebel.github.io/urban-cowboy-booking-engine/` (redirects to
`resource-hub.revrebel.io`). COW-70's consolidated PR #351 merged and the docs workflow
redeployed from `main`, so the six-stage catalog is published. An earlier COW-70 checkpoint
recorded that the live deployment served only the stage-1 catalog and that stages 2–6
returned 404 until the stacked PRs merged; that was a historical rollout state, not current.
The dated live check for this COW-85 slice and its known follow-ups are recorded in the
COW-85 section above; post-merge verification remains an explicit acceptance item.

To add a component page: create a `*.story.tsx` in `docs-app/components` importing the real
component, expose a `defineStory` export (with a deterministic harness when the component
needs context), add a client wrapper in `story-controls.tsx`, write the MDX page with props,
variants, responsive notes and a source link, then add it to `components/meta.json` and the
smoke page list. Regenerate the matrix and run `npm run docs:build && npm run docs:smoke`.

## Status: Fumadocs live; historical runtime coverage retained

COW-69 established the existing Fumadocs site and its GitHub Pages workflow. COW-70
merged its consolidated catalog (PR #351) and is closed; COW-85 is the follow-up that
continues migrating eligible historical demos and dispositions the remaining candidates.
COW-83 retired the legacy Scry Storybook production and PR-preview deployment workflows
and the Chromatic deployment workflow. The historical Storybook build and Chromium story
sweep **remain as a temporary main CI compatibility gate** until the remaining runtime
checks are replaced with Fumadocs-native coverage. Storybook sources, `.storybook/`,
scripts and packages remain available for that migration.
No booking-engine or Cloudflare Worker cutover is part of this cleanup.

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
   `resolveDocsBasePath()` in `scripts/fumadocs/base-path.mjs` is the single source for
   Next `basePath`/`assetPrefix` and the smoke check. It defaults to
   `/urban-cowboy-booking-engine`, treats `DOCS_BASE_PATH=/` as a custom-domain root, and
   returns no prefix for `next dev` so local development stays at `/`.

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
publication is an explicit opt-in on `main` through the gated workflow described below; PRs run
build and smoke checks only. The published URL comes from `actions/deploy-pages` output rather
than being guessed. The sanitized fixtures, deep links and interactive controls are verified by
the static build and browser smoke checks before publication.

`.github/workflows/docs-pages.yml`:

- PRs run install, typecheck, control lint, static build and smoke checks only.
- Main-branch publication is gated by repository variable `DOCS_PAGES_ENABLED == "true"`.
- For this application the Pages base path is `/urban-cowboy-booking-engine`. It is the
  default in the shared resolver and is set as job-level env in both workflow jobs before
  the build step. Set repository variable `DOCS_BASE_PATH=/` for a custom-domain root.
  The published URL comes from `actions/deploy-pages` output, not from a guessed value.
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

## Remaining gates before removing the historical Storybook runtime sweep

1. Convert the remaining **78 planned** entries in the current coverage matrix, preserving
   meaningful variants and controls. All 41 production candidates are already dispositioned
   (32 excluded, 0 deferred, 1 documented, 8 family-covered).
2. Keep static search and source links current as pages are added (both are in place today).
3. Replace Storybook-based runtime and visual tests with Vitest/Testing Library and
   Playwright checks that run independently.
4. Complete the post-merge live verification of deep links, interactive controls, fonts, icons
   and images on the real Pages URL, and resolve the custom-domain HTTPS certificate/redirect
   follow-up recorded in the COW-85 section.
5. Only then remove the temporary Storybook build/Chromium sweep/artifact upload from
   `.github/workflows/ci.yml`, plus unused Storybook dependencies, `.storybook/`, scripts
   and sources, with a regenerated lockfile. The Scry and Chromatic deploy workflows
   have already been removed by COW-83. Keep the application and Worker unchanged.

The Fumadocs `Component docs` workflow is the active documentation publication path;
retaining the historical runtime gate is solely a regression-coverage bridge.
