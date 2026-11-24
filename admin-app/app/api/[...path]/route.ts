import { headers } from "next/headers";
import { assertionFromHeaders, can, getAdminSession } from "../../../lib/session.ts";
import { proxyDashboardRequest } from "../../../lib/api-proxy.ts";

export const dynamic = "force-dynamic";

async function proxy(request: Request): Promise<Response> {
  const session = await getAdminSession();
  if (!session || !can(session, "read")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store, private" },
    });
  }
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
