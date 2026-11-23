import { publicSession, type AdminSession } from "../../../lib/auth.ts";

const noStore = { "Cache-Control": "no-store, private" };

export function sessionResponse(session: AdminSession | null): Response {
  const body = publicSession(session);
  return new Response(
    JSON.stringify(body ? { authenticated: true, session: body } : { authenticated: false }),
    {
      status: body ? 200 : 401,
      headers: { "Content-Type": "application/json", ...noStore },
    },
  );
}
