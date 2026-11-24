import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardPanelHost } from "../../../components/DashboardPanelHost.tsx";
import { can, getAdminSession } from "../../../lib/session.ts";
import { ROUTE_CAPABILITY, routeIdFromSegment } from "../../../lib/routes.ts";
import { DASHBOARD_NAV } from "../../../../src/dashboard/navigation.ts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Admin section" };

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const route = routeIdFromSegment(section);
  if (!route) notFound();

  const session = await getAdminSession();
  if (!session) notFound();
  const item = DASHBOARD_NAV.find((entry) => entry.id === route);
  if (!item) notFound();

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold">{item.label}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
      </div>
      {can(session, ROUTE_CAPABILITY[route]) ? (
        <DashboardPanelHost route={route} />
      ) : (
        <div role="alert" className="rounded-md border border-border p-4">
          <h2 className="text-lg font-semibold">Insufficient role</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your Access session does not include the admin role required for this section.
            No content was loaded.
          </p>
        </div>
      )}
    </section>
  );
}
