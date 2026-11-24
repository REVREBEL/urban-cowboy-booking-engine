/**
 * COW-114: explicit local-only authentication preview.
 *
 * This is a UI preview convenience, not an identity provider. It is enabled
 * only when the developer opts in AND the runtime is a local development
 * process. A deployed Worker (production build) can never activate it, and the
 * synthetic identity is never an Access assertion and is never forwarded to
 * the booking Worker.
 */
import type { AdminSession } from "./auth.ts";

export const LOCAL_PREVIEW_ENV = "ADMIN_LOCAL_PREVIEW";
export const PREVIEW_EMAIL = "local-preview@invalid.local";

/** Vite sets DEV=true in the local dev worker and false in production builds. */
const viteDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;

export function isLocalPreviewEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[LOCAL_PREVIEW_ENV] === "1" && (env.NODE_ENV === "development" || viteDev);
}

/** A deterministic administrator identity for UI work. No credential material. */
export function previewAdminSession(env: NodeJS.ProcessEnv = process.env): AdminSession {
  const tenantId = env.TENANT_ID?.trim() || "urban-cowboy";
  return {
    sub: "local-preview-admin",
    email: PREVIEW_EMAIL,
    groups: [],
    roles: ["viewer", "admin"],
    tenantId,
    expiresAt: null,
  };
}
