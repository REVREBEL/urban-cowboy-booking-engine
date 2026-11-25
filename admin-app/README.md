# Urban Cowboy Admin Portal

The Admin Portal is a vinext App Router application in the `admin-app` npm workspace. It deploys as the `urban-cowboy-admin` Cloudflare Worker.

## Local commands

Run these from the repository root:

```bash
npm run admin:dev
npm run admin:build
npm run admin:typecheck
npm run admin:deploy:check
```

`admin:dev` uses the Cloudflare Vite plugin. Put local nonsecret values in `admin-app/.dev.vars` (see `.dev.vars.example`); the app fails closed when Access or API configuration is missing.

## Local authentication preview with seeded D1 (COW-114)

Run two local servers. First prepare the booking Worker's local environment from the repository root:

```bash
cp .dev.vars.example .dev.vars
npx wrangler d1 migrations apply urban-cowboy-content --local
npx wrangler d1 execute urban-cowboy-content --local --file seed.sql
npm run dev:worker          # booking Worker on http://localhost:8787
```

Then, in a second terminal:

```bash
npm run admin:dev
```

The root script exports `ADMIN_LOCAL_PREVIEW=1` for you, so the simulated session is active without setting anything by hand. To exercise the real Cloudflare Access path locally, run `npm run dev -w admin-app` instead (the workspace script does not set the flag). The script uses POSIX shell variable syntax; on Windows, export the variable in the shell before running the workspace dev script.

Open `http://localhost:5174/`. The shell renders with a deterministic simulated administrator (`local-preview@invalid.local`), every protected navigation route is visible, `/` no longer redirects to `/login`, and panels show real seeded D1 data (room types, amenities, assignments). If the local Worker is not running, API calls fail with `502 local_preview_worker_unavailable` instead of silently showing empty data.

The preview is gated on both sides:

- **Admin app:** `ADMIN_LOCAL_PREVIEW=1` plus a local dev runtime (Vite `DEV` or `NODE_ENV=development`). Deployed builds fail closed.
- **Booking Worker:** all three of `LOCAL_DEV_PREVIEW=1` (root `.dev.vars`; `wrangler.toml` hard-codes the literal `"0"` for deployed Workers), a loopback request host, and the plain marker header `x-local-preview: 1`. Without all three, normal Access JWT verification applies.

The admin proxy forwards relative `/api/*` to the fixed origin `http://localhost:8787` with only the marker header — no assertion, cookie or authorization is forwarded. The simulated identity is centralized in `lib/preview-auth.ts` and `lib/session.ts`; individual screens do not bypass authorization, and the identity never becomes a signed assertion. The content-source flags in the root `.dev.vars` switch **local** reads to D1; production keeps its Webflow baseline. With preview disabled, the Access challenge path is unchanged and real role/tenant enforcement remains in force in every nonlocal environment.

## API boundary

Dashboard panels call relative `/api/*` paths on the admin origin. `admin-app/app/api/[...path]/route.ts` verifies the Access session, enforces same-origin mutations and forwards allowed dashboard paths to the booking Worker. Only the server proxy sees `API_BASE_URL` and the Access assertion.

The booking Worker remains the authority for D1 reads and writes, publishing, revisions, rollback and role checks. The proxy does not grant a role or replace Worker authorization.

`API_BASE_URL` is pinned to the Urban Cowboy booking Worker origin in production and `http://localhost:8787` in local development. Both Workers must use the Urban Cowboy admin Access application's AUD. The booking Worker must remain outside a different Access application; otherwise this assertion-forwarding design must be replaced with a service binding that verifies end-user identity independently.

The admin Worker enables the `global_fetch_strictly_public` compatibility flag so its server proxy can fetch the public booking Worker URL. Without it, Cloudflare rejects same-zone Worker-to-Worker fetches with error `1042` before the proxy can forward the request.

## Deployment

Use the root deployment wrapper. It reads the shared `.env`, validates the REVREBEL account and passes only these nonsecret runtime bindings:

- `CF_ACCESS_TEAM_DOMAIN`
- `CF_ACCESS_AUD`
- `ADMIN_EMAILS`
- `ADMIN_GROUPS`, optional
- `TENANT_ID`
- `API_BASE_URL`
- `API_REQUEST_TIMEOUT_MS`, optional

```bash
npm run admin:deploy:check
npm run admin:deploy
```

The check performs no build, upload or deployment. The deploy command requires `CLOUDFLARE_API_TOKEN` and the approved values in `.env`. It pins the production API origin and the current admin Access AUD. Do not commit `.env`, `.dev.vars` or Cloudflare credentials.

The booking Worker must use the same Access team domain, AUD and admin allowlist so it can verify the assertion forwarded by the admin proxy.
