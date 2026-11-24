# COW-100 — W2 Gate 1 acceptance (`gate1-v1.0`)

**Status:** W2 records acceptance of the shared integration contract version `gate1-v1.0` proposed by W3.5 (COW-107). The joint gate is **not** declared complete: W1 acceptance (A6) and W3 final acceptance (A8) are still outstanding, and all content flags remain at their Webflow defaults.

## Contract version

`gate1-v1.0`, as published by W3.5 in `docs/application/gate1-integration-contract.md`. W2 accepts the following W2-owned sections as written:

| Section | W2 verification |
| --- | --- |
| §3 Guest read contracts | Published-only, tenant/location-scoped reads are implemented for policy language, site settings and add-ons (`worker/content-adapters.ts`, `worker/property-settings.ts`, `worker/d1.ts`). Events occurrences are D1 schedule-only. Ambiguous or missing published rows fail closed to Webflow. Flags default to `webflow`; no flag gates a Mews route. |
| §4 Publication semantics | Published snapshots are content-addressed, pinned and immutable (`worker/published-snapshots.ts`, `d1-snapshots-parity.md`). Publication/rollback refresh snapshots in the same transaction path; draft saves do not. `room_types`/`locations` publication state lives in additive extension tables with `state_source` so editor decisions cannot be reverted by a reseed. |
| §5 Media identity | `media_assets.id` / `media_versions.id` are immutable by trigger. Webflow file IDs, CDN URLs, Squarespace and Mews asset IDs are aliases resolved tenant-safely. The delivery URL is mutable: a URL-only reimport updates `media_assets.squarespace_url` **and the current version's** URL in place, leaving version IDs and `current_version_id` untouched. The published gallery read resolves `COALESCE(v.url, a.url)`, so the new URL reaches guests. Placements key on the master ID, and shared images support one master with many room placements. |
| §7 Open decisions (A4/A7 rows) | Reference sync stays ID-only: `mews_reference_sync` rejects all ARI reference types in SQL and in Zod (`tests/mewsAriAuthority.test.ts`). Per-room gallery parity thresholds and flag-flip timing remain W3/W1-owned and are not changed here. Calendar snapshot stays in KV/Cache. |

## Evidence attached

- Schema: `migrations/0001_init.sql` … `0012_editorial_publication_state.sql`, checksummed in `migrations/manifest.json`; `npm run d1:migrate:check` applies all 12 twice with clean FK/integrity.
- Contracts: `src/types/d1-contracts.ts`; fixtures in `tests/fixtures/`.
- Reconciliation: `docs/generated/d1-reconciliation.json`, `docs/generated/cms-field-mapping.json`, `docs/generated/source-inventory-baseline.json`.
- Deliverable docs: `w2-1-source-schema-authority-assessment.md`, `w2-2-editorial-publication-contracts.md`, `w2-3-cms-import-reconciliation.md`, `webflow-photo-import.md`, `webflow-photo-hotspots.md`, `d1-snapshots-parity.md`.
- Tests: `npm test` 585 passing; `node --test tests/editorialPublicationState.test.ts tests/webflowPhotoImport.test.ts tests/mewsAriAuthority.test.ts`; `npm run typecheck`, `npm run lint:controls`, `npm run seed:check` all pass.
- No content flag was flipped. No ARI value is stored in D1.

## Gate readiness

- A4 (D1 guest-read, publication and media contracts documented): **W2 side met**.
- A7 (W2 records acceptance of `gate1-v1.0`): **met by this document and the COW-100 comment**.
- A9 (all three gate issues link the same document/version): **partial** — the contract file is currently only in the W3 worktree branch; it must be pushed to `main` (or linked by permalink) before the gate is declared complete.
- A6/A8 (W1 and W3 final acceptance): outstanding; W2 does not declare Gate 1 complete.

W2.6 (COW-101) remains blocked until all three Gate 1 issues are complete.
