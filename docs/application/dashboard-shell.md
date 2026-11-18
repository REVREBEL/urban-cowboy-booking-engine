# Dashboard shell and admin navigation (COW-37)

`src/dashboard` remains a separate Vite entry at `/dashboard.html`. It does not import
the Astro portal or its components. The first slice adds a shared shell, a route map,
a centralized API client and consistent panel states.

## Route map

Navigation is hash based so the static entry point needs no server rewrite.

| Hash | Section |
|---|---|
| `#/rooms` | Rooms |
| `#/media` | Media |
| `#/events` | Events |
| `#/rates` | Rates |
| `#/policies` | Policies |
| `#/add-ons` | Add-ons |
| `#/upgrades` | Upgrades |
| `#/recovery` | Recovery |
| `#/analytics` | Analytics (default) |
| `#/settings` | Settings |

`src/dashboard/navigation.ts` owns the route ids, labels, descriptions and groups.
Unknown hashes fall back to Analytics. The shell marks the active link with
`aria-current="page"` and exposes a skip link to `<main id="dashboard-main">`.

## Protection

Worker APIs are protected by Cloudflare Access (COW-31). The browser sends the Access
cookie on same-origin requests and Cloudflare injects the verified JWT header before
the request reaches the Worker. The dashboard never fabricates that header and never
forwards a Supabase token to a Worker route.

`DashboardApp` also checks a Supabase session before rendering the shell. That gate
covers the legacy funnel panel, which reads Supabase carts directly; an unauthenticated
hash cannot render any panel. This is separate from Worker authorization. Role-based
navigation and per-route permissions are not implemented; no role is inferred from
client input. Sign-out is handled in the shell header.

## API client

`createDashboardApi` in `src/dashboard/api.ts` is the only place that builds `/api`
URLs. It uses `credentials: "same-origin"` so the Access cookie reaches the edge,
sends no `Authorization` header, and converts non-2xx responses into
`DashboardApiError` with `status`, `code` and message. `getD1Module` and
`getContentItems` wrap the existing endpoints. Panels receive the client as a prop.

The skip link focuses `<main>` through a ref after `preventDefault()`, so keyboard
navigation does not mutate the hash used by the router.

## Shared states and controls

`src/dashboard/states.tsx` provides loading, error and empty states. Errors expose a
Retry action. `PanelErrorBoundary` wraps every panel so a render failure stays inside
the shell, and a route change clears a previous boundary error. `useDashboardResource`
ignores stale responses when a retry overlaps an in-flight request.

Buttons and pill buttons use the shared `Button` and `PillButton` components with
documented appearance props only. The funnel panel's range selector and refresh action
were migrated to those components; no new local button theme was introduced.

## Verification

```bash
node --test tests/dashboardNavigation.test.ts tests/dashboardApiClient.test.ts tests/dashboardShell.test.ts tests/dashboardAccessIntegration.test.ts
npm run typecheck
npm run lint:controls
npm run build
```

Automated source and unit checks cover the route map, hash fallback, token handling,
error mapping, session gate order and shared-control usage. Keyboard and screen-reader
review of the rendered shell, plus panel screenshots, remain manual checks for a
follow-up.
