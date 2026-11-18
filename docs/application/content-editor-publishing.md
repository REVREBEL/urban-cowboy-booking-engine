# Editorial draft and publishing workflow (COW-38)

This document covers the backend publishing workflow delivered first for COW-38. The field-component UI port from `cowboy-dashboard` is the next slice and is listed under Remaining work.

## Invariants

1. **Drafts never reach guests.** `PATCH /api/content/editor/items/:id` writes a new `content_revisions` row but leaves `content_items.status` and the published snapshot untouched.
2. **Publishing is explicit.** Only `/publish` (and `/rollback`) set `status='published'`, stamp `published_at`, write an audit entry and refresh the published `contentItems` snapshot from COW-32.
3. **Roles and tenant are checked in the Worker.** Every handler calls `authorizeScopedRequest(request, env, "admin")`. A caller-supplied `?tenant=` is accepted only when it matches the configured scope. The UI is not part of the trust boundary.
4. **No auto-publish.** The source `ItemEditor` publishes on save; the ported editor must call `saveEditorDraft` then explicitly `publishEditorItem`. This API enforces the separation regardless of UI behavior.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/content/editor/items` | List content items with status and current revision |
| GET | `/api/content/editor/items/:id?revisionId=` | Item, revision history and a preview payload for an explicit revision |
| POST | `/api/content/editor/items` | Create a draft with kind, slug, optional location and initial payload |
| PATCH | `/api/content/editor/items/:id` | Save a new draft revision (requires `expectedRevisionId`) |
| POST | `/api/content/editor/items/:id/publish` | Publish the current or a named revision and refresh the snapshot |
| POST | `/api/content/editor/items/:id/rollback` | Repoint the published item to an earlier revision |

All responses use `Cache-Control: no-store, private`.

## Validation and conflict detection

- `src/types/editor-contracts.ts` defines Zod contracts for kinds, slugs, payload size and required optimistic-lock field. Staged payloads are bounded JSON objects; prototype-pollution keys are rejected on the **raw** body because Zod strips `__proto__` from record output.
- A draft save must include the `current_revision_id` as `expectedRevisionId`. A stale editor gets `409 edit_conflict` with the current revision id instead of overwriting a newer draft.
- Publishing or rolling back to a revision that does not belong to the item returns `404 revision_not_found`.

## Audit and rollback

Every write appends to `audit_log` with the acting principal's email, action (`draft_created`, `draft_saved`, `content_published`, `content_rolled_back`), target and JSON metadata. `content_items.current_revision_id` identifies the live revision; rollback repoints it and stamps the earlier revision as published. A typed browser client lives in `src/lib/editorClient.ts`.

If the COW-32 snapshot refresh fails after a publish, the publish itself still succeeds and the response reports `snapshotRefreshed: false`; an admin can retry with `POST /api/content/snapshots/refresh`. This is logged, not silently ignored.

## Verification

```bash
node --test tests/contentEditorPublishing.test.ts  # 5 tests: draft isolation, conflicts, publish/rollback, auth, validation
npm test
npm run typecheck
```

## Remaining work (next slice)

- Split the 2,290-line `cowboy-dashboard/src/components/ItemEditor.tsx` into typed field components and domain editors (`src/dashboard/editor/...`), port field groups from `src/lib/field-groups.ts` and `field-layouts.ts`, selects/references, reorder and per-field validation.
- Wire the new components to `editorClient`, add preview and publish/rollback controls, and add edit-conflict UI handling.
- Add field-level validation schemas per collection (the API currently validates structure, bounds and concurrency, not each CMS field's semantics).
- Add dashboard screenshots for the editor and publishing flow, and confirm the published snapshot only changes on publish at the UI level.
- Retire the inherited Supabase-backed `/dashboard` reads once the editors are ported.
