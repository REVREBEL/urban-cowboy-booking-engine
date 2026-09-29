import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, MoveRight } from "lucide-react";

import { BookingShell } from "@/components/booking/BookingShell";
import { StaySummary } from "@/components/booking/StaySummary";
import { Button } from "@/components/ui/button";
import { ADDONS, addonTotal } from "@/lib/booking/addons";
import { useBooking } from "@/lib/booking/store";
import { bookingTotals, money } from "@/lib/booking/totals";
import { cn } from "@/lib/utils";

const title = "Add to your stay — Urban Cowboy";
const description =
  "Firewood, breakfast, a bathing ritual kit. Small things that make the stay land better.";

export const Route = createFileRoute("/extras")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExtrasStep,
});

function ExtrasStep() {
  const { booking, toggleAddon } = useBooking();
  const navigate = useNavigate();
  const { stayNights, extrasTotal } = bookingTotals(booking);

  return (
    <BookingShell current="extras">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Link
            to="/details"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to your details
          </Link>

          <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-6xl">
            Add to your stay
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            All optional. Add them now and they'll be waiting, or skip straight through.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ADDONS.map((addon) => {
              const selected = booking.addonIds.includes(addon.id);
              return (
                <button
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  aria-pressed={selected}
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl border p-5 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-brand text-xl">{addon.name}</p>
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                        selected ? "border-primary bg-primary" : "border-border",
                      )}
                    >
                      {selected && <Check className="size-3 text-primary-foreground" />}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{addon.blurb}</p>
                  <p className="mt-auto text-sm">
                    {money(addon.price)}{" "}
                    <span className="text-muted-foreground">
                      {addon.unit === "night" ? "per night" : "per stay"}
                    </span>
                    {addon.unit === "night" && stayNights > 1 && (
                      <span className="text-muted-foreground">
                        {" "}
                        · {money(addonTotal(addon, stayNights))} total
                      </span>
                    )}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {booking.addonIds.length > 0
                ? `${booking.addonIds.length} extra${booking.addonIds.length === 1 ? "" : "s"} · ${money(extrasTotal)}`
                : "No extras chosen."}
            </p>
            <Button size="lg" onClick={() => navigate({ to: "/pay" })}>
              Continue to review
              <MoveRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <StaySummary booking={booking} />
        </div>
      </div>
    </BookingShell>
  );
}
