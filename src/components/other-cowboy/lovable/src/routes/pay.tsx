import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Lock } from "lucide-react";

import { BookingShell } from "@/components/booking/BookingShell";
import { RoomGallery } from "@/components/booking/RoomGallery";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { addonTotal } from "@/lib/booking/addons";
import { roomPhotos } from "@/lib/booking/photos";
import { useBooking } from "@/lib/booking/store";
import { bookingTotals, money } from "@/lib/booking/totals";

const title = "Review and pay — Urban Cowboy";
const description =
  "Check your room, rate, extras and total before you confirm your Urban Cowboy stay.";

export const Route = createFileRoute("/pay")({
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
  component: PayStep,
});

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PayStep() {
  const { booking, setTermsAccepted, confirmBooking } = useBooking();
  const navigate = useNavigate();
  const totals = bookingTotals(booking);
  const { room, rate, stayNights } = totals;

  const ready = Boolean(room && rate && stayNights > 0 && booking.termsAccepted);

  return (
    <BookingShell current="pay">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Link
            to="/extras"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to extras
          </Link>

          <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-6xl">
            Review and pay
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            One last look. This is a demonstration checkout — no card is taken and no real
            reservation is made.
          </p>

          {room ? (
            <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
              <RoomGallery
                photos={roomPhotos(room.id)}
                className="h-56 sm:h-72"
                priority
              />
              <div className="space-y-4 p-6">
                <div>
                  <p className="font-label text-[10px] text-muted-foreground">
                    {room.house}
                  </p>
                  <p className="mt-1 font-brand text-3xl">{room.name}</p>
                  <p className="text-sm text-muted-foreground">{room.headline}</p>
                </div>
                <dl className="grid gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="font-label text-xs text-muted-foreground">
                      Arrival
                    </dt>
                    <dd>{formatDate(booking.stay.arrival)}</dd>
                  </div>
                  <div>
                    <dt className="font-label text-xs text-muted-foreground">
                      Departure
                    </dt>
                    <dd>{formatDate(booking.stay.departure)}</dd>
                  </div>
                  <div>
                    <dt className="font-label text-xs text-muted-foreground">
                      Guest
                    </dt>
                    <dd>
                      {booking.guest.firstName || booking.guest.lastName
                        ? `${booking.guest.firstName} ${booking.guest.lastName}`.trim()
                        : "—"}
                    </dd>
                  </div>
                </dl>
                {rate && (
                  <p className="rounded-xl bg-secondary/60 p-4 text-sm">
                    <span className="font-label text-lg">
                      {rate.name}
                    </span>
                    <span className="mt-1 block text-muted-foreground">{rate.terms}</span>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-border bg-secondary/50 p-6 text-sm">
              No room chosen yet.{" "}
              <Link to="/room" className="underline underline-offset-4">
                Choose a room
              </Link>{" "}
              to see your total.
            </div>
          )}

          <label className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
            <Checkbox
              checked={booking.termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <span className="text-sm">
              I agree to the rate terms and the property policies.
              <span className="block text-muted-foreground">
                Quiet after 10pm, dogs on leads in shared spaces, cancellation per your
                chosen rate.
              </span>
            </span>
          </label>

          <Button
            size="lg"
            className="mt-6 w-full sm:w-auto"
            disabled={!ready}
            onClick={() => {
              confirmBooking();
              navigate({ to: "/confirmation" });
            }}
          >
            <Lock className="size-4" />
            Confirm stay (demonstration)
          </Button>
        </div>

        <div className="space-y-6">
          <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="font-label text-xs text-muted-foreground">
              Your total
            </p>

            <dl className="mt-5 space-y-3 text-sm">
              {room && rate && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">
                    {money(totals.nightly)} × {stayNights} night
                    {stayNights === 1 ? "" : "s"}
                  </dt>
                  <dd>{money(totals.roomTotal)}</dd>
                </div>
              )}
              {totals.addons.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">{addon.name}</dt>
                  <dd>{money(addonTotal(addon, stayNights))}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                <dt className="text-muted-foreground">Taxes and fees</dt>
                <dd>{money(totals.tax)}</dd>
              </div>
            </dl>

            <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
              <span className="font-label text-xs text-muted-foreground">
                Total
              </span>
              <span className="text-3xl">{money(totals.total)}</span>
            </div>
          </aside>
        </div>
      </div>
    </BookingShell>
  );
}
