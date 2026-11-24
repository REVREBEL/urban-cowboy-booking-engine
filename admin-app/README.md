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

The check performs no build, upload or deployment. The deploy command requires `CLOUDFLARE_API_TOKEN` and the approved values in `.env`. Do not commit `.env`, `.dev.vars` or Cloudflare credentials.

The booking Worker must use the same Access team domain, AUD and admin allowlist so it can verify the assertion forwarded by the admin proxy.
