import { headers } from "next/headers";
import { assertionFromHeaders, can, getAdminSession } from "../../../lib/session.ts";
import { proxyDashboardRequest } from "../../../lib/api-proxy.ts";
import { isLocalPreviewEnabled } from "../../../lib/preview-auth.ts";

export const dynamic = "force-dynamic";

async function proxy(request: Request): Promise<Response> {
  const session = await getAdminSession();
  if (!session || !can(session, "read")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store, private" },
    });
  }
  // Local UI preview uses a synthetic session and must not require a signed
  // Access assertion. proxyDashboardRequest forwards to the local booking
  // Worker's gated preview path using a plain marker header, never the mock
  // identity or any browser credential.
  if (isLocalPreviewEnabled()) return proxyDashboardRequest(request, "");

  const assertion = assertionFromHeaders(await headers());
  if (!assertion) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store, private" },
    });
  }
  return proxyDashboardRequest(request, assertion);
}

export const GET = proxy;
export const HEAD = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
