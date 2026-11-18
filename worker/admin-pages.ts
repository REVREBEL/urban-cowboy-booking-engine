/** COW-68: serve the React dashboard entry at readable admin routes. */

export const ADMIN_PAGE_ROUTES = ["/admin", "/admin/", "/dashboard", "/dashboard/"] as const;

export function isAdminPageRoute(pathname: string): boolean {
  return (ADMIN_PAGE_ROUTES as readonly string[]).includes(pathname);
}

/** Reuses the existing dashboard.html asset; guest routes keep SPA fallback. */
export function dashboardPageRequest(request: Request): Request {
  return new Request(new URL("/dashboard.html", request.url).toString(), request);
}
