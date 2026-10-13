import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StudioPreview } from "./StudioPreview";

/**
 * Studio is a separate, non-transactional route. Do NOT mount BookingProvider
 * here: it loads live Mews configuration and emits booking funnel events.
 */
export function StudioGate() {
  const [status, setStatus] = useState<"loading" | "enabled" | "disabled">("loading");
  const property = new URLSearchParams(window.location.search).get("property") || "hotel";
  useEffect(() => {
    let alive = true;
    void api.locations().then((locations) => {
      if (alive) setStatus(locations[property]?.enableDemoEngine === true ? "enabled" : "disabled");
    }).catch(() => { if (alive) setStatus("disabled"); });
    return () => { alive = false; };
  }, [property]);
  if (status === "loading") return <div className="min-h-dvh grid place-items-center font-body">Loading Studio settings…</div>;
  if (status !== "enabled") return <main className="min-h-dvh grid place-items-center font-body"><div className="text-center"><h1 className="text-2xl font-heading">Studio unavailable</h1><p>The demo engine is disabled for this location.</p><a href="/booking" className="underline">Return to booking</a></div></main>;
  return <StudioPreview property={property} />;
}
