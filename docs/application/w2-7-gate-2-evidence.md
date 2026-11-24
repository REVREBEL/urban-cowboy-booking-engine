# COW-102 — W2 Gate 2 evidence (`gate1-v1.0` contract version)

**Status:** W2 deliverable complete; **joint Gate 2 remains open**. All three Linear issues are marked Done, but W1 and W3 acceptance records explicitly state that deployed evidence is still missing: `admin-portal-gate2-acceptance.md` has no deployed admin URL, real Access/RBAC verification or browser publish/rollback E2E, and `w3-gate2-readiness.md` has no live booking evidence, no Webflow runtime removal and content flags still at Webflow defaults. Issue status is not acceptance. Final migration closeout remains a separate owner decision.

## W2 deliverable checklist

| Requirement | Evidence |
| --- | --- |
| Production schema and migrations current | All 12 migrations in remote `d1_migrations`, including `0012_editorial_publication_state.sql` |
| Required CMS content reconciled | Editorial counts exact (see production reconciliation); 190 provenance rows; one draft room type excluded from published reads |
| Property settings and published snapshots | 10 content-addressed snapshots with pointers for all guest collections |
| Media master records and relationships | 122 permanent master assets, 122 versions, 265 aliases, 156 room placements; zero orphan checks |
| Temporary Webflow importer operational behind adapter | `worker/photo-source-adapter.ts` + `worker/photo-source-webflow.ts`; live fetch used for production, fixture path for tests |
| Master IDs survive URL/provider changes | Alias-based resolution and `sameAs` links; tests for URL change, provider switch, repeated import, room remap |
| Published snapshots and revision/rollback | Immutable content-addressed versions; `rollbackSnapshot()` repoints, no version deleted; publication rows carry `state_source` so editor decisions survive reseed |
| Squarespace switch limited to adapter | No schema or guest-frontend redesign required; contract in `docs/application/webflow-photo-import.md` |
| Mews ARI direct and no D1 ARI source | `tests/mewsAriAuthority.test.ts`; `mews_reference_sync` empty and restricted to stable reference types |
| No flags flipped in this gate | All content flags remain at Webflow defaults; W3 owns cutover |
| Atomic production apply | D1 REST batch all-or-nothing proven on a disposable database (`docs/generated/d1-rest-batch-atomicity.md`) |

## Signed-off reconciliation

`docs/generated/w2-6-production-reconciliation.md` contains the verified remote counts, orphan checks, migration ledger, snapshot pointers and source-issue notes. Backup exports are in `backups/d1/` (uncommitted).

## Sample record traces

- Draft room type `6abd4a1debcab0ea7e461c9a`: `room_type_publication.status = 'draft'`, excluded from `roomTypes` snapshot (21 published of 22).
- Webflow file ID `aaaaaaaaaaaaaaaaaaaaaaaa` (fixture) and the 122 live assets: source IDs are aliases on `media_assets.id`; URLs live on the asset/current version; placements key on the master ID.
- `roomGallery` snapshot `0f88a332…` covers 22 rooms and resolves per-room URLs from the registry, not from a live Webflow request.

## Cross-stream confirmations

- W2 confirms production D1 schema/data parity and media integrity to W1.7 and W3.7 (comments recorded on COW-95 and COW-111).
- COW-95 and COW-111 are marked Done and W2 confirmations were posted on both issues, but their own acceptance records list outstanding deployed evidence (W1) and live cutover/runtime removal (W3). The joint gate is therefore not complete; COW-102 stays open until those records are satisfied.
