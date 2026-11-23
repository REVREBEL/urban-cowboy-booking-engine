import { isSameOriginMutation } from "../../../../lib/auth.ts";

export const dynamic = "force-dynamic";

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store, private" },
  });

/** Hands logout back to Cloudflare Access; never creates a second session store. */
export function logoutRedirect(request: Request, teamDomain: string | undefined): Response {
  const origin = new URL(request.url).origin;
  const team = (teamDomain ?? "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  if (!/^[a-z0-9][a-z0-9.-]*$/i.test(team)) {
    return json({ error: "access_not_configured" }, 503);
  }
  const target = new URL(`https://${team}/cdn-cgi/access/logout`);
  target.searchParams.set("redirect_uri", `${origin}/login`);
  return new Response(null, {
    status: 303,
    headers: { Location: target.toString(), "Cache-Control": "no-store, private" },
  });
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return json({ error: "invalid_origin" }, 403);
  return logoutRedirect(request, process.env.CF_ACCESS_TEAM_DOMAIN);
}
