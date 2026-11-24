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

## Local authentication preview (COW-114)

To iterate on protected UI without a Cloudflare Access login, copy `.dev.vars.example` to `.dev.vars` (or export `ADMIN_LOCAL_PREVIEW=1`) and run the dev server:

```bash
cd admin-app && ADMIN_LOCAL_PREVIEW=1 npx vite dev --port 5174 --strictPort
```

Open `http://localhost:5174/`. The shell renders with a deterministic simulated administrator (`local-preview@invalid.local`), every protected navigation route is visible, and `/` no longer redirects to `/login`. Preview is enabled **only** when `ADMIN_LOCAL_PREVIEW=1` and the runtime is local development (Vite `DEV` or `NODE_ENV=development`). Production and deployed preview builds cannot activate it: the deployment wrapper does not supply the flag, and `isLocalPreviewEnabled()` fails closed in a production runtime. With preview disabled, the existing Access challenge behavior is unchanged.

The mock identity is centralized in `lib/preview-auth.ts` and returned by `lib/session.ts`; individual screens do not bypass authorization. It is never a signed Access assertion and is never forwarded to the booking Worker. In preview mode the same-origin API proxy returns empty local fixtures for reads (`{ "items": [], "preview": true }`) and refuses mutations with `403 preview_read_only`; no production D1 data can be read or mutated. Real Access verification, roles and tenant enforcement remain in force in every nonlocal environment.

## API boundary

Dashboard panels call relative `/api/*` paths on the admin origin. `admin-app/app/api/[...path]/route.ts` verifies the Access session, enforces same-origin mutations and forwards allowed dashboard paths to the booking Worker. Only the server proxy sees `API_BASE_URL` and the Access assertion.

The booking Worker remains the authority for D1 reads and writes, publishing, revisions, rollback and role checks. The proxy does not grant a role or replace Worker authorization.

`API_BASE_URL` is pinned to the Urban Cowboy booking Worker origin in production and `http://localhost:8787` in local development. Both Workers must use the Urban Cowboy admin Access application's AUD. The booking Worker must remain outside a different Access application; otherwise this assertion-forwarding design must be replaced with a service binding that verifies end-user identity independently.

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
