// Role gate for private operational routes.
//
// Identity comes only from a verified Cloudflare Access JWT (worker/access.ts).
// There is no shared-token fallback: a static secret cannot represent a
// principal, and a role list checked against a hardcoded value without a
// verified session would only create the appearance of scoping. Authorization
// never reads client headers or query parameters such as ?tenant=.

import { tokenFromRequest, verifyAccessJwt, type AccessClaims, type AccessEnv } from "./access.ts";

export type Role = "viewer" | "admin";

export interface AuthEnv extends AccessEnv {
  // Comma-separated Access emails / group IDs allowed the admin role.
  ADMIN_EMAILS?: string;
  ADMIN_GROUPS?: string;
}

export interface Principal {
  sub: string;
  email: string;
  groups: string[];
  roles: Role[];
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
  };
}

function deny(status: 401 | 403, error: "unauthorized" | "forbidden"): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/** Returns null when the verified principal holds the role, otherwise a response. */
export async function requireRole(
  request: Request,
  env: AuthEnv,
  role: Role,
): Promise<Response | null> {
  const claims = await verifyAccessJwt(tokenFromRequest(request), env);
  if (!claims) return deny(401, "unauthorized");
  const principal = principalFromClaims(claims, env);
  return principal.roles.includes(role) ? null : deny(403, "forbidden");
}

export function requireViewer(request: Request, env: AuthEnv): Promise<Response | null> {
  return requireRole(request, env, "viewer");
}

export function requireAdmin(request: Request, env: AuthEnv): Promise<Response | null> {
  return requireRole(request, env, "admin");
}
