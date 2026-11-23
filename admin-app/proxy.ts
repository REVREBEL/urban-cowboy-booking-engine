import { NextResponse, type NextRequest } from "next/server";

/**
 * Foundation policy for admin routes (Next.js 16 `proxy` convention). W1.3
 * replaces this with real session and role verification at the edge; UI hiding
 * is never an authorization boundary. Until then every admin response is
 * private and non-cacheable.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  if (!request.nextUrl.pathname.startsWith("/_next/")) {
    response.headers.set("Cache-Control", "no-store, private");
  }
  return response;
}

export default proxy;
