import { NextResponse, type NextRequest } from "next/server";
import { isLocalPreviewEnabled } from "./lib/preview-auth.ts";

/**
 * Edge UX guard only: redirects obviously unauthenticated page requests before
 * they render. It does NOT verify the JWT — the protected (admin) layout and
 * every API handler call getAdminSession()/require capability server-side.
 * Cloudflare Access performs the real sign-in and injects the assertion.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, private");

  // Local UI preview: let the server-side session provider supply the mock
  // identity. This branch can only be reached in a local dev process.
  if (isLocalPreviewEnabled()) return response;

  if (
    pathname === "/login" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/")
  ) {
    return response;
  }

  const assertion = request.headers.get("cf-access-jwt-assertion")?.trim();
  const bearer = /^Bearer\s+(.+)$/i.exec(request.headers.get("authorization") ?? "")?.[1];
  if (assertion || bearer?.trim()) return response;

  const login = request.nextUrl.clone();
  login.pathname = "/login";
  login.search = "";
  login.searchParams.set("next", pathname);
  const redirectResponse = NextResponse.redirect(login);
  redirectResponse.headers.set("Cache-Control", "no-store, private");
  return redirectResponse;
}

export default proxy;
