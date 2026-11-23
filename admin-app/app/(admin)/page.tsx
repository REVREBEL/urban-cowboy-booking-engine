import { Button } from "@/components/ui/Button";
import { getAdminRuntimeConfig } from "../../lib/env";

export const dynamic = "force-dynamic";

export default function AdminHome() {
  const config = getAdminRuntimeConfig();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Admin Portal foundation</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          The Cloudflare Next.js app is running on vinext with the booking engine&apos;s
          Tailwind v4 design system and shared controls. Routes, authentication and the
          domain editors are delivered by W1.3 and W1.4.
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-border p-4">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Shared API origin</dt>
          <dd className="mt-1 break-all font-mono text-sm">
            {config.apiBaseUrl || "same-origin (relative /api requests)"}
          </dd>
        </div>
        <div className="rounded-md border border-border p-4">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">API request deadline</dt>
          <dd className="mt-1 font-mono text-sm">{config.requestTimeoutMs} ms</dd>
        </div>
      </dl>

      <div>
        <Button asChild size="small">
          <a href="/api/health">Check health endpoint</a>
        </Button>
      </div>
    </section>
  );
}
