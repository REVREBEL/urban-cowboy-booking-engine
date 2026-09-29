import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Mail } from "lucide-react";

import { BookingShell } from "@/components/booking/BookingShell";
import { RoomGallery } from "@/components/booking/RoomGallery";
import { Button } from "@/components/ui/button";
import { addonTotal } from "@/lib/booking/addons";
import { roomPhotos } from "@/lib/booking/photos";
import { useBooking } from "@/lib/booking/store";
import { bookingTotals, money } from "@/lib/booking/totals";

const title = "You're booked — Urban Cowboy";
const description =
  "Your Urban Cowboy stay is confirmed. Here are your dates, your room and what comes next.";

export const Route = createFileRoute("/confirmation")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmationStep,
});

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ConfirmationStep() {
  const { booking } = useBooking();
  const totals = bookingTotals(booking);
  const { room, rate, stayNights } = totals;

  if (!booking.confirmationCode || !room) {
    return (
      <BookingShell current="confirmation">
        <div className="mx-auto max-w-xl px-5 py-20 text-center">
          <h1 className="font-display text-4xl">Nothing to confirm yet</h1>
          <p className="mt-3 text-muted-foreground">
            Start with your dates and we'll walk you through it.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Book a stay</Link>
          </Button>
        </div>
      </BookingShell>
    );
  }

  return (
    <BookingShell current="confirmation">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="font-label inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">
            <CheckCircle2 className="size-4" />
            Confirmed
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] md:text-6xl">
            You're booked, {booking.guest.firstName || "cowboy"}.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Confirmation{" "}
            <span className="text-foreground">{booking.confirmationCode}</span>
            . A copy is on its way to {booking.guest.email || "your inbox"}.
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
            <RoomGallery
              photos={roomPhotos(room.id)}
              className="h-56 sm:h-80"
                            priority
            />
            <div className="space-y-5 p-6">
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
                  <dd className="text-muted-foreground">Check-in from 4pm</dd>
                </div>
                <div>
                  <dt className="font-label text-xs text-muted-foreground">
                    Departure
                  </dt>
                  <dd>{formatDate(booking.stay.departure)}</dd>
                  <dd className="text-muted-foreground">Checkout by 11am</dd>
                </div>
                <div>
                  <dt className="font-label text-xs text-muted-foreground">
                    Rate
                  </dt>
                  <dd>{rate ? rate.name : "—"}</dd>
                  <dd className="text-muted-foreground">
                    {stayNights} night{stayNights === 1 ? "" : "s"}
                  </dd>
                </div>
              </dl>

              {totals.addons.length > 0 && (
                <div className="rounded-xl bg-secondary/60 p-4">
                  <p className="font-label text-[10px] text-muted-foreground">
                    Waiting for you
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {totals.addons.map((addon) => (
                      <li key={addon.id} className="flex justify-between gap-4">
                        <span>{addon.name}</span>
                        <span className="text-muted-foreground">
                          {money(addonTotal(addon, stayNights))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="font-label text-xs text-muted-foreground">
              Paid today
            </p>
            <p className="mt-2 text-4xl">{money(totals.total)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Includes {money(totals.tax)} taxes and fees. Demonstration only — no card was
              charged.
            </p>
          </aside>

          <aside className="rounded-2xl border border-border bg-secondary/50 p-6">
            <p className="font-topic text-xl">What happens next</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Mail className="mt-0.5 size-4 shrink-0" />
                A confirmation email with directions and gate codes.
              </li>
              <li>A note from the front desk the day before you arrive.</li>
              <li>Anything else, reply to that email and we'll sort it.</li>
            </ul>
            <Button asChild variant="outline" className="mt-5 w-full">
              <Link to="/">Book another stay</Link>
            </Button>
          </aside>
        </div>
      </div>
    </BookingShell>
  );
}
