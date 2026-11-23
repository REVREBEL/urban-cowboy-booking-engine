export const dynamic = "force-dynamic";

/** Deployable smoke endpoint. Reports configuration shape, never values. */
export function GET() {
  const apiBaseConfigured = Boolean(process.env.API_BASE_URL?.trim());
  return new Response(
    JSON.stringify({
      status: "ok",
      app: "admin-app",
      apiBaseConfigured,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, private",
      },
    },
  );
}
