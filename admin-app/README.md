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

`admin:dev` uses the Cloudflare Vite plugin. Put local nonsecret values in `admin-app/.dev.vars`; the app fails closed when Access or API configuration is missing.

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
