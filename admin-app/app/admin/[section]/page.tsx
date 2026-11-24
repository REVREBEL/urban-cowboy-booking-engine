import { notFound, redirect } from "next/navigation";
import { routeIdFromSegment } from "../../../lib/routes.ts";

/** Deep links under /admin resolve to the guarded App Router section. */
export default async function AdminDeepLink({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const route = routeIdFromSegment(section);
  if (!route) notFound();
  redirect(`/${route}`);
}
