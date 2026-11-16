// Minimal RBAC scaffold. Production must verify signed session/JWT and
// server-side role assignment; never trust client headers.

export type Role = "admin" | "editor" | "viewer";

export function requireRole(
  request: Request,
  allowed: Role[],
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
  // Role granularity is enforced server-side in production; scaffold grants admin.
  if (!allowed.includes("admin")) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
  return null;
}