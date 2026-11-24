// Role and tenant gate for private operational routes.
//
// Identity and tenant scope come from a verified Cloudflare Access JWT and
// server-side configuration (worker/access.ts). There is no shared-token
// fallback. A ?tenant= query parameter can narrow nothing: it is accepted only
// when it matches the configured scope and rejected otherwise.

import { tokenFromRequest, verifyAccessJwt, type AccessClaims, type AccessEnv } from "./access.ts";

export type Role = "viewer" | "admin";

export interface AuthEnv extends AccessEnv {
  // Comma-separated Access emails / group IDs allowed the admin role.
  ADMIN_EMAILS?: string;
  ADMIN_GROUPS?: string;
  // Tenant this Worker serves. Bound server-side; never taken from the request.
  TENANT_ID?: string;
  // COW-114: local-only D1 preview. Intentionally absent from wrangler.toml
  // [vars] and from the deploy script, so a deployed Worker never has it.
  LOCAL_DEV_PREVIEW?: string;
}

/** Plain marker header used by the local preview; never a signed assertion. */
export const LOCAL_PREVIEW_HEADER = "x-local-preview";
export const PREVIEW_EMAIL = "local-preview@invalid.local";

export interface Principal {
  sub: string;
  email: string;
  groups: string[];
  roles: Role[];
  tenantId: string;
}

function allowlist(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function principalFromClaims(claims: AccessClaims, env: AuthEnv): Principal {
  const groups = Array.isArray(claims.groups)
    ? claims.groups.filter((group): group is string => typeof group === "string")
    : [];
  const email = typeof claims.email === "string" ? claims.email : "";
  const roles: Role[] = ["viewer"];
  const adminEmails = allowlist(env.ADMIN_EMAILS);
  const adminGroups = allowlist(env.ADMIN_GROUPS);
  if (
    (email && adminEmails.includes(email.toLowerCase())) ||
    groups.some((group) => adminGroups.includes(group.toLowerCase()))
  ) {
    roles.push("admin");
  }
  return {
    sub: typeof claims.sub === "string" ? claims.sub : "",
    email,
    groups,
    roles,
    tenantId: env.TENANT_ID?.trim() ?? "",
  };
}

function deny(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" ||
    hostname === "::1" || hostname === "[::1]";
}

/**
 * COW-114 local D1 preview gate. All three conditions must hold:
 *   1. an opt-in binding that is absent from every deployed Worker config,
 *   2. a loopback request host (a workers.dev/custom-domain request fails),
 *   3. an explicit plain-text marker header (never a JWT or shared secret).
 * A deployed Worker therefore fails closed even if the header is supplied.
 */
export function isLocalDevPreview(request: Request, env: AuthEnv): boolean {
  if (env.LOCAL_DEV_PREVIEW !== "1") return false;
  if (request.headers.get(LOCAL_PREVIEW_HEADER)?.trim() !== "1") return false;
  try {
    return isLoopbackHost(new URL(request.url).hostname);
  } catch {
    return false;
  }
}

function localPreviewPrincipal(env: AuthEnv): Principal {
  const configured = env.TENANT_ID?.trim() ?? "";
  // Local wrangler.toml carries unrendered __ENV_* placeholders; never treat
  // one as a real tenant scope for the preview identity.
  const tenantId = configured && !configured.startsWith("__ENV_")
    ? configured
    : "urban-cowboy";
  return {
    sub: "local-preview-admin",
    email: PREVIEW_EMAIL,
    groups: [],
    roles: ["viewer", "admin"],
    tenantId,
  };
}

async function verifiedPrincipal(
  request: Request,
  env: AuthEnv,
  role: Role,
): Promise<Principal | Response> {
  // Centralized local preview identity: no JWT is read, verified or forwarded
  // on this path. The real Access verification below is untouched in production.
  if (isLocalDevPreview(request, env)) {
    const principal = localPreviewPrincipal(env);
    if (!principal.roles.includes(role)) return deny(403, "forbidden");
    return principal;
  }
  const claims = await verifyAccessJwt(tokenFromRequest(request), env);
  if (!claims) return deny(401, "unauthorized");
  const principal = principalFromClaims(claims, env);
  if (!principal.roles.includes(role)) return deny(403, "forbidden");
  return principal;
}

/** Returns null when the verified principal holds the role, otherwise a response. */
export async function requireRole(
  request: Request,
  env: AuthEnv,
  role: Role,
): Promise<Response | null> {
  const result = await verifiedPrincipal(request, env, role);
  return result instanceof Response ? result : null;
}

/**
 * Returns the verified principal whose tenantId is the only scope queries may
 * use. A caller-supplied tenant value is rejected unless it matches that scope.
 */
export async function authorizeScopedRequest(
  request: Request,
  env: AuthEnv,
  role: Role,
): Promise<Principal | Response> {
  const principal = await verifiedPrincipal(request, env, role);
  if (principal instanceof Response) return principal;
  if (!principal.tenantId) return deny(503, "tenant_scope_not_configured");
  const requested = new URL(request.url).searchParams.get("tenant");
  if (requested && requested !== principal.tenantId) return deny(403, "forbidden");
  return principal;
}

export function requireViewer(request: Request, env: AuthEnv): Promise<Response | null> {
  return requireRole(request, env, "viewer");
}

export function requireAdmin(request: Request, env: AuthEnv): Promise<Response | null> {
  return requireRole(request, env, "admin");
}
