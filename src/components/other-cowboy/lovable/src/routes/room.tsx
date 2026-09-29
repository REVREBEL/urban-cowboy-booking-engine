import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ChevronDown, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { BookingShell } from "@/components/booking/BookingShell";
import { DogToggleButton } from "@/components/booking/DogToggleButton";
import { MatchBenefitsCard } from "@/components/booking/MatchBenefitsCard";
import { PreferenceIconButton } from "@/components/booking/PreferenceIconButton";
import { RoomCard } from "@/components/booking/RoomCard";
import { RoomDetailsFull } from "@/components/booking/RoomDetailsFull";

import { bestMatches, eligibleRooms, nights } from "@/lib/booking/matching";
import {
  GROUP_PREFERENCE,
  PARTY_TYPES,
  PREFERENCES,
  RATES,
  ROOMS,
  type RateId,
} from "@/lib/booking/rooms";
import { useBooking } from "@/lib/booking/store";
import { cn } from "@/lib/utils";

const title = "Find your stay — Urban Cowboy Catskills";
const description =
  "Let us help based on what you're after, or browse every room available on your dates at Urban Cowboy.";

export const Route = createFileRoute("/room")({
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
  component: RoomStep,
});

function RoomStep() {
  const { booking, setParty, togglePreference, setHelpOpen, selectRate, setStay } = useBooking();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [openRoomId, setOpenRoomId] = useState<string | null>(null);
  const [recommendationsReady, setRecommendationsReady] = useState(false);

  const stayNights = nights(booking.stay);
  const available = useMemo(() => eligibleRooms(booking.stay), [booking.stay]);
  const matches = useMemo(
    () => bestMatches(booking.stay, booking.preferences),
    [booking.stay, booking.preferences],
  );

  const partySize = booking.stay.adults + booking.stay.children;
  const preferences = partySize >= 4 ? [...PREFERENCES, GROUP_PREFERENCE] : PREFERENCES;
  const helpOpen = booking.helpOpen;
  const showMatches = helpOpen && booking.preferences.length > 0 && !showAll;
  const recommendationRequested = showMatches || showAll;

  useEffect(() => {
    if (!recommendationRequested) {
      setRecommendationsReady(false);
      return;
    }

    setRecommendationsReady(false);
    const timer = window.setTimeout(() => setRecommendationsReady(true), 850);
    return () => window.clearTimeout(timer);
  }, [booking.preferences, recommendationRequested]);

  const shownRooms: {
    room: (typeof ROOMS)[number];
    label?: string;
    reasons: string[];
    featured?: boolean;
  }[] = showMatches
    ? matches.map((match) => ({
        room: match.room,
        label: match.label,
        reasons: match.reasons,
        featured: match.slot === "best",
      }))
    : available.map((room) => ({ room, reasons: [room.headline] }));
  const featuredMatch = shownRooms[0];

  const openMatch = matches.find((match) => match.room.id === openRoomId);
  const openRoom = ROOMS.find((room) => room.id === openRoomId) ?? null;

  const chosenRoom = ROOMS.find((room) => room.id === booking.roomId) ?? null;
  const chosenRate = RATES.find((rate) => rate.id === booking.rateId) ?? null;

  function handleChooseRate(rateId: RateId) {
    if (!openRoomId) return;
    selectRate(openRoomId, rateId);
    setOpenRoomId(null);
    navigate({ to: "/details" });
  }

  return (
    <BookingShell current="room">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-12 md:pt-16">
        <Link
          to="/"
          className="eyebrow inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to dates
        </Link>

        <h1 className="mt-6 font-display text-5xl leading-none text-foreground md:text-6xl">
          Find your stay
        </h1>
        <p className="mt-4 max-w-xl text-xl text-ink/70">
          8 room types are available for your dates, each with its own way of doing Cowboy.
          Whether you’re looking for a quiet retreat, a little adventure, or room to gather,
          tell us what matters most and we’ll guide you toward the stay that fits.
        </p>

        {/* Two ways in. Choosing help expands the questions right here. */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setHelpOpen(!helpOpen)}
            aria-expanded={helpOpen}
            className={cn(
              "font-button flex items-center gap-2 rounded-full px-6 py-3 text-sm transition-colors",
              helpOpen
                ? "bg-primary text-primary-foreground"
                : "border border-umber text-umber hover:bg-umber hover:text-background",
            )}
          >
            Help me choose
            <ChevronDown className={cn("size-4 transition-transform", helpOpen && "rotate-180")} />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAll(true);
              setHelpOpen(false);
            }}
            className={cn(
              "font-button flex items-center gap-2 rounded-full px-6 py-3 text-sm transition-colors",
              showAll
                ? "bg-accent text-accent-foreground"
                : "border border-accent text-accent hover:bg-accent hover:text-accent-foreground",
            )}
          >
            All {available.length} rooms
            <ArrowRight className="size-4" />
          </button>
        </div>

        {/* Inline reveal: same screen, all point-and-click. */}
        <div
          className={cn(
            "grid transition-all duration-500",
            helpOpen ? "mt-10 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="border border-ink/15 bg-linen p-6 md:p-10">
              <section className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(12rem,1fr)] md:gap-12">
                <div>
                  <h2 className="font-brand text-sm text-umber">
                    Who's Coming Along
                  </h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {PARTY_TYPES.map((option) => {
                      const selected = booking.party === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setParty(selected ? null : option.id)}
                          className={cn(
                            "rounded-xl border-2 p-4 text-left transition-colors",
                            selected
                              ? "border-umber bg-paper"
                              : "border-ink/15 bg-paper/45 hover:border-copper/60",
                          )}
                        >
                          <p className="font-label text-base text-umber">{option.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{option.blurb}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="md:border-l md:border-border md:pl-10">
                  <h2 className="font-brand text-sm text-umber">
                    Traveling with your pup?
                  </h2>
                  <p className="mt-2 max-w-52 text-xs text-muted-foreground">
                    We’ll keep your matches to rooms where they’re welcome to join the adventure.
                  </p>
                  <div className="mt-5">
                    <DogToggleButton
                      selected={booking.stay.pets}
                      onToggle={() => setStay({ pets: !booking.stay.pets })}
                    />
                  </div>
                </div>
              </section>

              <section className="mt-10 border-t border-border pt-8">
                <div className="space-y-2">
                  <h2 className="font-brand text-sm text-umber">
                    What's Your Style?
                  </h2>
                  <p className="max-w-xl text-xs text-muted-foreground">
                    Choose up to two, and we’ll point you toward the rooms that fit your kind of escape.
                  </p>
                </div>

                <div className="mt-6 grid max-w-3xl grid-cols-3 gap-4 sm:gap-6">
                  {preferences.map((preference) => (
                    <PreferenceIconButton
                      key={preference.id}
                      id={preference.id}
                      label={preference.label}
                      description={preference.description}
                      selected={booking.preferences.includes(preference.id)}
                      onToggle={() => togglePreference(preference.id)}
                    />
                  ))}
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                  {booking.preferences.length > 0
                    ? "Your rooms are below."
                    : "Tap what you're after and we'll bring up three rooms."}
                </p>
              </section>
            </div>
          </div>
        </div>

        {recommendationRequested && !recommendationsReady && (
          <div
            className="mt-14 flex min-h-40 flex-col items-center justify-center gap-4 border-y border-ink/15"
            role="status"
            aria-live="polite"
          >
            <LoaderCircle className="size-8 animate-spin text-copper motion-reduce:animate-none" />
            <p className="font-brand text-sm text-umber">
              Finding your stay
            </p>
          </div>
        )}

        {recommendationRequested && recommendationsReady && (
          <div className="mt-14 animate-fade-in motion-reduce:animate-none">
            {!showMatches && (
              <h2 className="font-brand text-lg text-umber">All available rooms</h2>
            )}

            {showMatches && featuredMatch ? (
              <>
                <div className="grid items-stretch gap-8 lg:grid-cols-2">
                  <RoomCard
                    room={featuredMatch.room}
                    label={featuredMatch.label}
                    reasons={featuredMatch.reasons}
                    featured={featuredMatch.featured}
                    onViewDetails={() => setOpenRoomId(featuredMatch.room.id)}
                    onSelect={() => setOpenRoomId(featuredMatch.room.id)}
                  />
                  <MatchBenefitsCard
                    room={featuredMatch.room}
                    reasons={featuredMatch.reasons}
                  />
                </div>

                {shownRooms.length > 1 && (
                  <section className="mt-14">
                    <h2 className="font-brand text-lg text-umber">
                      Other matches to explore
                    </h2>
                    <div className="mt-6 grid gap-8 lg:grid-cols-2">
                      {shownRooms.slice(1).map((entry) => (
                        <RoomCard
                          key={entry.room.id}
                          room={entry.room}
                          label={entry.label}
                          reasons={entry.reasons}
                          featured={entry.featured}
                          onViewDetails={() => setOpenRoomId(entry.room.id)}
                          onSelect={() => setOpenRoomId(entry.room.id)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              !showMatches && (
                <div className="mt-6 grid gap-8 lg:grid-cols-2">
                  {shownRooms.map((entry) => (
                    <RoomCard
                      key={entry.room.id}
                      room={entry.room}
                      label={entry.label}
                      reasons={entry.reasons}
                      featured={entry.featured}
                      onViewDetails={() => setOpenRoomId(entry.room.id)}
                      onSelect={() => setOpenRoomId(entry.room.id)}
                    />
                  ))}
                </div>
              )
            )}

            {showMatches && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="font-button mt-12 rounded-full border border-accent px-6 py-3 text-sm text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                See all {available.length} rooms
              </button>
            )}
          </div>
        )}

        {chosenRoom && chosenRate && (
          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border border-copper bg-snow p-6">
            <div>
              <p className="eyebrow text-[10px] text-muted-foreground">Room and rate chosen</p>
              <p className="font-brand mt-1 text-xl text-umber">{chosenRoom.name}</p>
              <p className="text-sm text-muted-foreground">
                {chosenRate.name} · {chosenRate.terms}
              </p>
            </div>
            <Link
              to="/details"
              className="font-button flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90"
            >
              Continue to your details
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </div>

      {openRoom && (
        <RoomDetailsFull
          room={openRoom}
          reasons={openMatch ? openMatch.reasons : undefined}
          nights={stayNights}
          selectedRateId={booking.roomId === openRoom.id ? booking.rateId : null}
          onClose={() => setOpenRoomId(null)}
          onChooseRate={handleChooseRate}
        />
      )}
    </BookingShell>
  );
}
