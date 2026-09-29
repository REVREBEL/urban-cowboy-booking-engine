import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MoveRight } from "lucide-react";

import { BookingShell } from "@/components/booking/BookingShell";
import { RoomGallery } from "@/components/booking/RoomGallery";
import { StaySummary } from "@/components/booking/StaySummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { roomPhotos } from "@/lib/booking/photos";
import { useBooking } from "@/lib/booking/store";
import { bookingTotals } from "@/lib/booking/totals";

const title = "Your details — Urban Cowboy";
const description =
  "Tell us who's arriving so we can have the room, the fire and the coffee ready for you.";

export const Route = createFileRoute("/details")({
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
  component: DetailsStep,
});

function DetailsStep() {
  const { booking, setGuest } = useBooking();
  const navigate = useNavigate();
  const { room } = bookingTotals(booking);
  const { guest } = booking;

  const canContinue =
    guest.firstName.trim().length > 0 &&
    guest.lastName.trim().length > 0 &&
    /.+@.+\..+/.test(guest.email);

  return (
    <BookingShell current="details">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Link
            to="/room"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to rooms
          </Link>

          <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-6xl">
            Your details
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Just the essentials. We'll send your confirmation here and keep an eye out for
            you on arrival day.
          </p>

          {!room && (
            <div className="mt-8 rounded-2xl border border-border bg-secondary/50 p-6">
              <p className="text-sm">
                You haven't chosen a room yet.{" "}
                <Link to="/room" className="underline underline-offset-4">
                  Pick one first
                </Link>
                .
              </p>
            </div>
          )}

          <div className="mt-8 grid gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={guest.firstName}
                onChange={(event) => setGuest({ firstName: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={guest.lastName}
                onChange={(event) => setGuest({ lastName: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={guest.email}
                onChange={(event) => setGuest({ email: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={guest.phone}
                onChange={(event) => setGuest({ phone: event.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Anything we should know?</Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder="Arriving late, celebrating something, a bad knee and too many stairs."
                value={guest.notes}
                onChange={(event) => setGuest({ notes: event.target.value })}
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {canContinue
                  ? "Looks good. Extras next."
                  : "Name and a working email, then we can carry on."}
              </p>
              <Button
                size="lg"
                disabled={!canContinue}
                onClick={() => navigate({ to: "/extras" })}
              >
                Continue to extras
                <MoveRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {room && (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <RoomGallery photos={roomPhotos(room.id)} className="h-44" />
              <div className="p-5">
                <p className="font-label text-[10px] text-muted-foreground">
                  {room.house}
                </p>
                <p className="mt-1 font-brand text-2xl">{room.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{room.headline}</p>
              </div>
            </div>
          )}
          <StaySummary booking={booking} />
        </div>
      </div>
    </BookingShell>
  );
}
