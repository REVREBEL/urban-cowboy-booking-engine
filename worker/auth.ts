// Minimal RBAC scaffold for admin Worker endpoints.
// Production should validate signed session/JWT and scoped roles.

export type Role = "admin" | "editor" | "viewer";

export function getRole(request: Request): Role {
  const header = request.headers.get("x-uc-role");
  if (header === "admin" || header === "editor" || header === "viewer") return header;
  return "viewer";
}

export function requireRole(request: Request, allowed: Role[]): Response | null {
  const role = getRole(request);
  if (!allowed.includes(role)) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
  return null;
}