/**
 * Server-only request binding for admin identity.
 *
 * Cloudflare Access injects the signed assertion; verification reuses the
 * booking-engine Worker's verifier instead of introducing a second provider.
 * Never import this module from a client component.
 */
import { headers } from "next/headers";
import { verifyAccessJwt } from "../../worker/access.ts";
import { assertionFromHeaders, authEnvFromProcess, sessionFromClaims, type AdminSession } from "./auth.ts";
import { isLocalPreviewEnabled, previewAdminSession } from "./preview-auth.ts";

export * from "./auth.ts";

/** Returns null for every failure mode. The caller must not inspect the token. */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (isLocalPreviewEnabled()) return previewAdminSession();
  const env = authEnvFromProcess();
  const headerList = await headers();
  const claims = await verifyAccessJwt(assertionFromHeaders(headerList), env);
  return claims ? sessionFromClaims(claims, env) : null;
}
