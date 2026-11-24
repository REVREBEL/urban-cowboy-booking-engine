# D1 REST batch atomicity — disposable integration evidence

**Date:** 2026-11-24. **Purpose:** prove that `POST /accounts/{account}/d1/database/{id}/query` with a `batch` payload (the path used by `scripts/lib/d1-api.mjs`) is all-or-nothing for the production apply flow. Worker-binding docs alone do not establish REST behavior.

## Procedure

1. Created a disposable D1 database `cow101-atomicity-probe-tmp` (`35c7c661-2f40-42b7-86e8-f2db7cf9bcb1`) in the approved REVREBEL account. A second run used `cow101-atomicity-proof-2` (`d9e97195-11ad-4f10-b7ee-370c1e3fd2f0`) to capture the raw request/response below.
2. Created `probe (id TEXT PRIMARY KEY, value TEXT NOT NULL)`.
3. Sent one REST batch through `applyBatch()` against that database:
   - statement 1: `INSERT INTO probe (id, value) VALUES ('first','should-roll-back')`
   - statement 2: same statement with `id='first'` (intentional PRIMARY KEY violation)
4. Observed the API response and read the table back.
5. Deleted the disposable database.

## Raw request and result (second run, recorded verbatim)

Disposable database `d9e97195-11ad-4f10-b7ee-370c1e3fd2f0`; same procedure. Request body produced by `applyBatch()`:

```json
{
  "batch": [
    { "sql": "INSERT INTO probe (id, value) VALUES (?, ?)", "params": ["first", "should-roll-back"] },
    { "sql": "INSERT INTO probe (id, value) VALUES (?, ?)", "params": ["first", "duplicate-violation"] }
  ]
}
```

REST response: HTTP **400**, body:

```json
{
  "success": false,
  "result": [],
  "errors": [
    { "code": 7500, "message": "UNIQUE constraint failed: probe.id: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_PRIMARYKEY)" }
  ]
}
```

Independent read-back through the D1 API: `SELECT COUNT(*) AS n FROM probe` → `{ "n": 0 }`. The successful first write was rolled back. Both throwaway databases were deleted after the tests.

## Result

- The REST request returned HTTP 400 with `UNIQUE constraint failed: probe.id: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_PRIMARYKEY)`.
- Read-back query `SELECT COUNT(*) AS n FROM probe` returned `n = 0`. The successful first write was rolled back.

## Conclusion

The Cloudflare D1 REST `/query` batch endpoint used by `applyBatch()` is atomic: a constraint violation in a later statement aborts the whole batch, including earlier successful writes. Therefore the W2.6 production path cannot leave media registry updates committed while the `roomGallery` snapshot pointer stays stale. `applyBatch()` additionally fails closed when the HTTP 200 response omits results or returns fewer results than submitted statements.

The throwaway database was deleted after the test; no production data was involved.
