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

\`\`\`bash
npm run deploy:d1
\`\`\`

This command uses the project's shared \`.env\`, verifies the REVREBEL account and exact D1 ID, runs \`npm run test:seed\` against a local in-memory database with foreign keys enabled, refreshes the ignored Wrangler config, exports a dated **remote backup** to \`backups/d1/\`, imports the idempotent \`seed.sql\` against the **remote** D1 database, and asserts table counts, Catskills/Denver/Nashville time zones, and Room Type/Building location assignments.

The command **does not** deploy Worker code or alter table schema. It does not import the 238 photo hotspots because the source export lacks stable media IDs; this must be resolved before adding those records. The backup folder is gitignored, but backups must be stored securely outside Git.

After changing Webflow export CSVs, regenerate and review the seed first:

\`\`\`bash
npm run seed:d1
npm run test:seed
npm run deploy:d1
\`\`\`

**Important:** The seed contains source-derived editorial records. Running it again uses upserts and can overwrite edits made directly in D1. Establish the editorial source-of-truth policy before switching to D1-native editing.

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
