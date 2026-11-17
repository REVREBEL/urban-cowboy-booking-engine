// Shared-token gate for private operational routes.
//
// There is no session/JWT verification here: ADMIN_TOKEN is a single shared
// secret, so the only principal it can represent is "admin". Do not add a
// role list argument until a verified session supplies real roles — a list
// checked against a hardcoded value would give the appearance of scoping
// without enforcing it. Never derive authorization from client headers or
// query parameters such as ?tenant=.

export function requireAdmin(
  request: Request,
  env?: { ADMIN_TOKEN?: string },
): Response | null {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const expected = env?.ADMIN_TOKEN;
  if (!expected || !token || token !== expected) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
  return null;
}
