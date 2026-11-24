/**
 * Pure admin authorization logic. Safe to import from tests and route handlers.
 * Identity still originates from the Worker's verified Cloudflare Access JWT;
 * this module only derives roles and capabilities from verified claims.
 */
import type { AccessClaims } from "../../worker/access.ts";
import { principalFromClaims, type Principal, type Role } from "../../worker/auth.ts";

export type AdminCapability =
  | "read"
  | "edit"
  | "publish"
  | "settings"
  | "recovery"
  | "destructiveMedia";

/** Every capability is checked on the server; UI visibility is never the gate. */
export const CAPABILITY_ROLES: Readonly<Record<AdminCapability, Role>> = {
  read: "viewer",
  edit: "admin",
  publish: "admin",
  settings: "admin",
  // The Worker's /api/recovery handler requires the admin role.
  recovery: "admin",
  destructiveMedia: "admin",
};

export interface AdminAuthEnv {
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
  ADMIN_EMAILS?: string;
  ADMIN_GROUPS?: string;
  TENANT_ID?: string;
}

export interface AdminSession extends Principal {
  /** Access token expiry in epoch seconds; null only for injected fixtures. */
  expiresAt: number | null;
}

export function authEnvFromProcess(): AdminAuthEnv {
  return {
    CF_ACCESS_TEAM_DOMAIN: process.env.CF_ACCESS_TEAM_DOMAIN,
    CF_ACCESS_AUD: process.env.CF_ACCESS_AUD,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    ADMIN_GROUPS: process.env.ADMIN_GROUPS,
    TENANT_ID: process.env.TENANT_ID,
  };
}

export function sessionFromClaims(claims: AccessClaims, env: AdminAuthEnv): AdminSession {
  const principal = principalFromClaims(claims, env);
  return {
    ...principal,
    expiresAt: typeof claims.exp === "number" && Number.isFinite(claims.exp) ? claims.exp : null,
  };
}

export function can(session: AdminSession | null, capability: AdminCapability): boolean {
  if (!session) return false;
  return session.roles.includes(CAPABILITY_ROLES[capability]);
}

/** Local sign-in state for the shell; no credential material is returned. */
export function publicSession(session: AdminSession | null) {
  if (!session) return null;
  return {
    email: session.email,
    roles: session.roles,
    tenantId: session.tenantId,
    expiresAt: session.expiresAt,
  };
}

/**
 * Mutations require an explicit same-origin Origin header. A missing or foreign
 * Origin fails closed. Cloudflare Access still verifies identity independently.
 */
export function isSameOriginMutation(request: Request): boolean {
  if (request.method === "GET" || request.method === "HEAD") return true;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function assertionFromHeaders(headerList: Headers): string | null {
  const assertion = headerList.get("cf-access-jwt-assertion")?.trim();
  if (assertion) return assertion;
  const bearer = /^Bearer\s+(.+)$/i.exec(headerList.get("authorization") ?? "");
  return bearer?.[1]?.trim() ?? null;
}
