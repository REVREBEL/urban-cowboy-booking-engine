# CMS read migration: Webflow to D1 (COW-39)

Guest-facing CMS reads move to D1 one route at a time. Webflow stays the source of
truth and the default. COW-32 supplies the global flag, immutable snapshots and
parity reports; this change adds per-route flags, same-shaped adapters and safe
fallback. Mews pricing, availability and reservation handlers are untouched.

## Flags and rollback

| Env var | Effect |
|---|---|
| `CONTENT_SOURCE` | Global default: `webflow`, `shadow` or `d1`. |
| `CONTENT_SOURCE_POLICY_LANGUAGE` | Per-route override. Unset inherits `CONTENT_SOURCE`; an explicit invalid value fails safe to `webflow`. |

Rollback is a flag change to `webflow` for one route. No data is deleted and no
schema change is needed. `shadow` compares both sources without serving D1.

## Adapter contract (`worker/content-adapters.ts`)

- `webflow`: call the existing handler unchanged.
- `shadow`: return the Webflow response and persist a structured parity summary to
  `parity_reports` in `ctx.waitUntil`; D1 data is never served. Per-route parity is
  therefore stored in D1, like the COW-32 collection reports.
- `d1`: serve the published D1 row with `X-Content-Source: d1`. If the row is
  missing, malformed, incomplete or the read throws, fall back to Webflow with
  `X-Content-Source: webflow-fallback` and `Cache-Control: no-store`.
- The D1 reader is tenant and location scoped and only reads a published item's
  current revision. Draft content is never served. When no `location` is supplied,
  more than one matching policy is treated as ambiguous and falls back to Webflow
  rather than selecting an arbitrary property's cancellation terms.
- D1 content is served only when all ten `PolicyLanguage` fields normalize to
  non-empty strings. Empty, unrelated-key or partial revisions are not valid D1
  content and must fall back.
- Normalization is shared with the Webflow handler in `worker/policy-language.ts`.
  The Webflow response nests fields under `fieldData`; imported D1 revisions keep
  the flat source row. Both shapes normalize to the same `PolicyLanguage`.

## First migrated route

`/api/content/policy-language` now uses `policyLanguageRead`. Its response shape is
`{ "language": { ... } }` in every mode. The existing Webflow handler remains in
place for fallback and shadow comparison; only the Worker router changed.

## Verification

```bash
node --test tests/contentMigrationPolicy.test.ts tests/policyLanguageCms.test.ts tests/snapshotsParity.test.ts
npm run typecheck
npm run lint:controls
npm run build
```

Tests cover published, draft and malformed D1 rows, per-route flag precedence,
shadow parity, D1-mode responses and the Webflow fallback header. Manual parity
review of rendered cards and the Photo Journey is still required before switching
any production route to `d1`.

## Deferred routes

Rooms, rate cards, buildings, add-ons, amenities, hotspot associations and property
settings keep their Webflow handlers. Each needs its own same-shaped adapter,
parity report and flag before it can move behind `d1`.
