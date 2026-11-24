# Urban Cowboy Worker deployment

The shared project `.env` at the repository root is the **single source of values** for Worker runtime configuration. The committed `wrangler.toml` is a template, **not a production deployment config**. Do not run `wrangler deploy` directly.

## Workflow

```bash
npm ci --legacy-peer-deps
npm run deploy:render  # reads .env, creates ignored .wrangler.generated.toml
npm run deploy:check   # builds and runs Wrangler's dry-run; no remote changes
npm run deploy         # builds, uploads permitted secrets and deploys
```

`npm run deploy` invokes `scripts/deploy-worker.mjs`. It:

1. Reads `.env` using Node's dotenv-compatible parser, including quoted values. It **does not select `.dev.vars`**. A different file can be selected explicitly with `node scripts/deploy-worker.mjs --env-file /absolute/path/to/.env`.
2. Substitutes the `__ENV_...` placeholders declared under `[vars]` in `wrangler.toml`. Required Worker identifiers must exist; optional missing values are omitted. Inserts `CLOUDFLARE_ACCOUNT_ID` as a **top-level** `account_id`.
3. Writes `.wrangler.generated.toml` (gitignored and file mode 0600) next to `wrangler.toml`, keeping relative paths such as `./dist` and `./migrations` intact.
4. Builds the frontend, then runs the project-local Wrangler with `--config .wrangler.generated.toml`.
5. Loads **only** `WEBFLOW_CMS_API_TOKEN` (when present) and `ADMIN_TOKEN` from the same `.env` into a temporary 0600 `--secrets-file`. That file is deleted when the command exits. It never sends `CLOUDFLARE_API_TOKEN` or other project-wide secrets to Worker bindings.

Cloudflare authentication is provided via `CLOUDFLARE_API_TOKEN` (from the process environment when defined, otherwise from `.env`), and `CLOUDFLARE_ACCOUNT_ID`. Neither is a runtime binding. `CLOUDFLARE_ZONE_ID` is not required as an application runtime binding; configure routes/domains separately when appropriate.

## Runtime values

The required nonsecret keys are `MEWS_CLIENT`, `MEWS_BASE_URL`, `MEWS_APP_BASE_URL`, `MEWS_HOTEL_ID`, and `MEWS_CONFIG_ID`. Additional declared `MEWS_*`, `WEBFLOW_*`, and `WEBHOOK_EVENTS` variables in `wrangler.toml` are optional and populated when present in the shared `.env`. `MEWS_CLIENT` is a public-facing application identity, not a secret. `ADMIN_TOKEN` is required as a Worker secret, while `WEBFLOW_CMS_API_TOKEN` is optional during the D1 transition. URLs and IDs may identify production or demo systems; the renderer preserves whichever values are in the selected shared `.env`. Never declare actual credentials in `[vars]` or prefix them `VITE_`.

The D1 binding remains explicitly configured in `wrangler.toml` as `DB` for database `urban-cowboy-content`. It is a **resource binding**, not a plaintext environment variable.


## Deploy content data to remote D1

Worker deploys are separate from data imports. Once migration SQL and seed are reviewed:

```bash
npm run deploy:d1
```

This command uses the project's shared `.env`, verifies the REVREBEL account and exact D1 ID, runs `npm run test:seed` against a local in-memory database with foreign keys enabled, refreshes the ignored Wrangler config, exports a dated **remote backup** to `backups/d1/`, imports the idempotent `seed.sql` against the **remote** D1 database, and asserts table counts, Catskills/Denver/Nashville time zones, and Room Type/Building location assignments.

The command **does not** deploy Worker code or alter table schema. It does not import the 238 photo hotspots because the source export lacks stable media IDs; this must be resolved before adding those records. The backup folder is gitignored, but backups must be stored securely outside Git.

After changing Webflow export CSVs, regenerate and review the seed first:

```bash
npm run seed:d1
npm run test:seed
npm run deploy:d1
```

**Important:** The seed contains source-derived editorial records. Running it again uses upserts and can overwrite edits made directly in D1. Establish the editorial source-of-truth policy before switching to D1-native editing.

## Private admin routes and RBAC

`/api/recovery` (guest PII) and `/api/analytics/summary` (aggregated metrics) now require a
**verified Cloudflare Access JWT**, not a shared secret:

- Set `CF_ACCESS_TEAM_DOMAIN` (e.g. `revrebel.cloudflareaccess.com`) and `CF_ACCESS_AUD`
  (the Access application's AUD). Without them the gate returns 401. It fails closed.
- The Worker accepts the JWT in `Cf-Access-Jwt-Assertion` or `Authorization: Bearer`, verifies
  its RS256 signature against `https://<team>/cdn-cgi/access/certs`, and checks issuer,
  audience, expiry and not-before. JWKS responses are cached for 10 minutes; fetch failures
  fail closed.
- Every verified principal gets the `viewer` role. `admin` is granted only when the token's
  `email` matches `ADMIN_EMAILS` or one of its `groups` matches `ADMIN_GROUPS` (comma-separated
  allowlists). Analytics requires `viewer`; recovery requires `admin`.
- Both routes query only the tenant in `TENANT_ID`. A request with a `?tenant=` value that
  differs gets 403 before D1 is touched. Without `TENANT_ID`, both routes return 503.
  Cross-tenant data is never addressed by a query parameter.
- The legacy `ADMIN_TOKEN` binding is no longer consulted for authorization. The role matrix
  lives in `tests/auth.test.ts` and the tenant scope tests in `tests/tenantScope.test.ts`.

## Admin Portal deployment

The Admin Portal deploys as a separate Worker through the guarded root wrapper:

```bash
npm run admin:deploy:check
npm run admin:deploy
```

The check reads the shared `.env`, validates the REVREBEL account and exits without a build,
upload or deployment. The deploy passes only these nonsecret runtime bindings:
`CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, `ADMIN_EMAILS`, optional `ADMIN_GROUPS`, `TENANT_ID`,
`API_BASE_URL` and optional `API_REQUEST_TIMEOUT_MS`. `CLOUDFLARE_API_TOKEN` authenticates the
deployment and is never an admin Worker binding.

Dashboard browsers call the admin origin. The admin Worker verifies the Access session and
forwards allowed API requests to `API_BASE_URL` with the verified assertion. The deployment
wrapper pins the production booking Worker origin and the current admin Access AUD. The booking
Worker must use the same AUD and remain outside a different Access application. Do not configure
the admin API base as the admin Worker origin itself.

## Apply D1 schema migrations

Schema changes are separate from Worker deploys and content imports. Migration files are
named `<4-digit-sequence>_<snake_case>.sql` and recorded with a SHA-256 checksum in
`migrations/manifest.json`. An applied migration must never be edited — add a new numbered
file instead. The runner rejects drift, sequence gaps and conflict markers.

```bash
npm run d1:migrate:plan     # ordered list + checksums; makes no changes
npm run d1:migrate:check    # apply every migration twice to a fresh in-memory DB with FK enforcement
npm run d1:migrate:record   # regenerate the manifest after adding and reviewing a migration
npm run d1:migrate:remote   # guarded apply to the approved production D1
```

`d1:migrate:remote` shares the approved-account guard with `deploy:d1` (single source:
`scripts/lib/d1-target.mjs`), renders the ignored Wrangler config, exports a dated
`backups/d1/pre-migration-…sql` snapshot, then applies migrations with Wrangler, which owns
the remote `d1_migrations` ledger and rolls back a failing migration. Verify remote state
with `wrangler d1 migrations list urban-cowboy-content --remote --config .wrangler.generated.toml`.
CI runs `npm run test:migrate` and `npm run d1:migrate:check` on every PR.

## CI and local development

GitHub Actions test runs may use `wrangler dev --local` with the committed template and mocked backend data; **those are not production deployments**. For a local Worker with real project bindings, generate the config with `npm run deploy:render`, then use:

```bash
npx wrangler dev --config .wrangler.generated.toml --local --port 8787
```

Use `npm run deploy:check` before each production push. The dry run does not upload secrets or make changes remotely; validate the live Worker bindings and D1 API separately after deployment.

## Safety

- Do not commit `.env`, `.dev.vars`, `.wrangler.generated.toml`, or generated secret files.
- Do not forward every key in the shared `.env`: other integrations may store unrelated credentials there.
- `[vars]` values are plaintext Worker configuration. Put sensitive values in the secret allowlist and deploy them via `--secrets-file`.
- Deployment overwrites Wrangler-managed plaintext variables in Cloudflare; review the rendered config when introducing a new binding. Existing Worker secrets not in `--secrets-file` are preserved.
- Deployment is **not** a D1 database migration. Apply and verify D1 schema/data changes independently.
