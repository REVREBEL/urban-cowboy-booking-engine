import { useState, type FormEvent } from "react";
import { Mail, Share2, X } from "lucide-react";
import { MatchBenefitsCard } from "@/components/booking/results/MatchBenefitsCard";
import { buildTopMatchCopy } from "@/lib/topMatch";
import { roomDetailTags } from "@/lib/roomTags";
import type { MatchInterest, RecommendationPreferences } from "@/types/merchandising";
import { PREFERENCE_LABELS } from "@/data/findYourStayPreferences";
import { MatcherProgress } from "@/components/booking/discovery/RoomMatcherProgress";
import type { ShapedRoom } from "@/types/mews";
import { RoomsListCard } from "@/components/RoomsListCard";
import { useBooking } from "@/state/booking";

type StudioMatchResultsProps = {
  rooms: ShapedRoom[];
  preferences: RecommendationPreferences;
  checkIn: string;
  imageBaseUrl: string;
  totalAvailable: number;
  onBack: () => void;
  onBrowseAll: () => void;
  onSelectRoom: (room: ShapedRoom) => void;
  onOpenRoomDetails: (room: ShapedRoom) => void;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function choiceLabels(preferences: RecommendationPreferences) {
  return preferences.interests
    .filter(Boolean)
    .map((interest) => PREFERENCE_LABELS[interest as MatchInterest])
    .join(" & ");
}

function partyLabel(preferences: RecommendationPreferences) {
  return preferences.party === "partner"
    ? "COUPLE"
    : preferences.party.toUpperCase();
}

export function StudioMatchResults({
  rooms,
  preferences,
  checkIn,
  imageBaseUrl,
  totalAvailable,
  onBack,
  onBrowseAll,
  onSelectRoom,
  onOpenRoomDetails,
}: StudioMatchResultsProps) {
  const { guest, setGuest, track } = useBooking();
  const [showEmailSave, setShowEmailSave] = useState(false);
  const [email, setEmail] = useState(guest.email);
  const [emailError, setEmailError] = useState("");
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  if (rooms.length === 0) {
    return (
      <section className="min-h-screen bg-alpine-linen py-12">
        <div className="booking-shell max-w-3xl text-center">
          <button type="button" onClick={onBack} className="mb-8 font-number text-xs font-bold uppercase tracking-widest text-ash-900">
            ← Back
          </button>
          <h1 className="font-heading text-5xl font-bold uppercase text-cowboy-umber">
            No Exact Match This Time
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-body text-sm text-ash-900">
            Your current party and eligibility filters removed the available rooms. Browse all eligible rooms or change your answers.
          </p>
          <button type="button" onClick={onBrowseAll} className="mt-7 rounded-full bg-cowboy-umber px-7 py-3 font-number text-xs font-bold uppercase tracking-widest text-alpine-linen">
            Browse Available Rooms
          </button>
        </div>
      </section>
    );
  }

  const top = rooms[0];
  const alternates = rooms.slice(1, 3);
  const copy = buildTopMatchCopy(top.name, preferences, checkIn, top.merchandising);

  async function shareMatches() {
    const alternateNames = alternates.map((room) => room.name).join(" and ");
    const text = alternateNames
      ? top.name + " is my top Urban Cowboy match, with " + alternateNames + " as alternates."
      : top.name + " is my top Urban Cowboy match.";
    const shareData = {
      title: "My Urban Cowboy room matches",
      text,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
    } else {
      await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
    }

    setShared(true);
    window.setTimeout(() => setShared(false), 2500);
  }

  async function saveMatches(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalizedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setEmailError("");
    setGuest({ email: normalizedEmail });

    await track("matches_saved", {
      customer: {
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: normalizedEmail,
        telephone: guest.telephone,
        nationalityCode: guest.nationalityCode,
      },
      matchSave: {
        emailTemplateKey: "room-match-saved-v1",
        deliveryStatus: "pending_template",
        topRoomCategoryId: top.roomTypeId,
        alternateRoomCategoryIds: alternates.map((room) => room.roomTypeId),
        party: preferences.party,
        dog: preferences.dog,
        interests: preferences.interests.filter(Boolean),
        shareUrl: window.location.href,
      },
    });

    setSaved(true);
    setShowEmailSave(false);
  }

  return (
    <section className="min-h-screen bg-paper pb-24 text-smoke">
      <MatcherProgress step={3} />

      <div className="booking-shell pt-10 sm:pt-14">
        <header className="mx-auto mb-10 max-w-3xl space-y-3 text-center">
          <p className="font-label text-xs font-bold uppercase tracking-[0.25em] text-lake-forest">
            ✦ Curated Match Results
          </p>
          <h1 className="font-heading text-3xl font-light uppercase leading-[1.05] tracking-wide text-smoke sm:text-5xl">
            Your Handpicked Catskill Matches
          </h1>
          <p className="font-sans text-sm leading-6 text-ash-900 sm:text-base">
            Based on your party of {partyLabel(preferences)}
            {preferences.dog ? " (with your dog companion)" : ""} and your escape focus on{" "}
            <strong className="text-cowboy-umber">{choiceLabels(preferences)}</strong>.
          </p>
        </header>

        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-2 font-label text-xs uppercase tracking-wider text-smoke-fade transition hover:text-cowboy-umber"
        >
          ← Back to Focus
        </button>

        <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(18rem,0.9fr)]">
          <RoomsListCard
            room={top}
            imageBaseUrl={imageBaseUrl}
            isTopMatch
            onSelectRoom={onSelectRoom}
            onOpenRoomDetails={onOpenRoomDetails}
          />

          <MatchBenefitsCard
            room={{
              name: top.name,
              headline: copy.interest_summary,
              blurb: copy.top_match_reason,
              features: roomDetailTags(top.merchandising).map((tag) => ({ label: tag.label })),
            }}
            intro={"This room is our top match for " + copy.party_summary + ". " + copy.top_match_reason + "."}
            reasons={[copy.benefit_1, copy.benefit_2]}
            reasonHeadings={["Your Choices, Reflected", "Your Stay, Considered"]}
            compact
            showActions={false}
          />
        </div>

        {alternates.length > 0 && (
          <div className="mt-12">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-number text-[11px] font-bold uppercase tracking-[3px] text-copper">
                  Worth Another Look
                </p>
                <h2 className="mt-1 font-heading text-3xl font-bold uppercase text-cowboy-umber">
                  Two More Strong Matches
                </h2>
              </div>
              <p className="max-w-md font-body text-sm text-ash-900">
                Different strengths, same live availability. These were the next highest-ranked room types for your answers.
              </p>
            </div>

            <div className="space-y-5">
              {alternates.map((room, index) => (
                <RoomsListCard
                  key={room.roomTypeId}
                  room={room}
                  imageBaseUrl={imageBaseUrl}
                  theme={index % 2 === 0 ? "lake-forest" : "paper"}
                  layout={index % 2 === 0 ? "left" : "right"}
                  onSelectRoom={onSelectRoom}
                  onOpenRoomDetails={onOpenRoomDetails}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 overflow-hidden rounded-3xl border-2 border-cowboy-umber bg-paper shadow-md">
          <div className="border-b border-cowboy-umber/20 bg-cowboy-umber px-6 py-5 text-paper sm:px-8">
            <p className="font-number text-[11px] font-bold uppercase tracking-[3px] text-lodge-yellow">
              Keep Exploring or Take These With You
            </p>
            <h2 className="mt-1 font-heading text-3xl font-bold uppercase leading-none sm:text-4xl">
              Not Seeing What You&apos;re After?
            </h2>
          </div>

          <div className="grid gap-3 p-5 sm:p-6 lg:grid-cols-3">
            <button
              type="button"
              onClick={onBrowseAll}
              className="min-h-24 rounded-2xl bg-lodge-yellow px-6 py-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="block font-number text-[10px] font-bold uppercase tracking-[2px] text-cowboy-umber/65">
                Keep Looking
              </span>
              <span className="mt-2 block font-label text-lg font-bold uppercase tracking-[1px] text-cowboy-umber">
                Browse All {totalAvailable} Rooms →
              </span>
            </button>

            <button
              type="button"
              onClick={shareMatches}
              className="flex min-h-24 items-center gap-4 rounded-2xl border border-cowboy-umber/30 bg-alpine-linen px-6 py-5 text-left transition hover:-translate-y-0.5 hover:border-cowboy-umber hover:shadow-md"
            >
              <Share2 className="h-6 w-6 shrink-0 text-copper" aria-hidden="true" />
              <span>
                <span className="block font-number text-[10px] font-bold uppercase tracking-[2px] text-cowboy-umber/60">
                  {shared ? "Link Ready" : "Send It Around"}
                </span>
                <span className="mt-1 block font-label text-lg font-bold uppercase tracking-[1px] text-cowboy-umber">
                  Share Matches
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail(guest.email);
                setShowEmailSave(true);
              }}
              className="flex min-h-24 items-center gap-4 rounded-2xl border border-cowboy-umber/30 bg-white px-6 py-5 text-left transition hover:-translate-y-0.5 hover:border-cowboy-umber hover:shadow-md"
            >
              <Mail className="h-6 w-6 shrink-0 text-copper" aria-hidden="true" />
              <span>
                <span className="block font-number text-[10px] font-bold uppercase tracking-[2px] text-cowboy-umber/60">
                  {saved ? "Saved to Your Session" : "Keep a Copy"}
                </span>
                <span className="mt-1 block font-label text-lg font-bold uppercase tracking-[1px] text-cowboy-umber">
                  Save &amp; Email
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {showEmailSave && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-matches-title"
            className="relative w-full max-w-lg rounded-3xl border-2 border-cowboy-umber bg-paper p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={() => setShowEmailSave(false)}
              aria-label="Close save matches dialog"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-cowboy-umber hover:bg-alpine-linen"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <p className="font-number text-[11px] font-bold uppercase tracking-[3px] text-copper">
              Save Your Matches
            </p>
            <h2 id="save-matches-title" className="mt-2 pr-10 font-heading text-4xl font-bold uppercase leading-none text-cowboy-umber">
              Send Them to Your Inbox
            </h2>
            <p className="mt-4 font-body text-sm leading-6 text-ash-900">
              Save your top match and alternates with your booking session so they&apos;re easy to pick back up later.
            </p>

            <form className="mt-6" onSubmit={saveMatches}>
              <label htmlFor="match-save-email" className="font-number text-[11px] font-bold uppercase tracking-[2px] text-cowboy-umber">
                Email Address
              </label>
              <input
                id="match-save-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailError("");
                }}
                className="mt-2 w-full rounded-xl border border-cowboy-umber/35 bg-white px-4 py-3 font-body text-sm text-cowboy-umber outline-none focus:border-copper focus:ring-2 focus:ring-copper/20"
                placeholder="you@example.com"
              />
              {emailError && (
                <p role="alert" className="mt-2 font-body text-xs font-semibold text-oxblood-300">
                  {emailError}
                </p>
              )}

              {/* TODO(room-match-saved-v1): connect the dedicated saved-match email
                  template in n8n before launch. Data capture is already live. */}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailSave(false)}
                  className="rounded-full border border-cowboy-umber px-5 pb-2.5 pt-3 font-number text-xs font-bold uppercase tracking-[1.5px] text-cowboy-umber"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-cowboy-umber px-6 pb-2.5 pt-3 font-number text-xs font-bold uppercase tracking-[1.5px] text-paper hover:bg-copper"
                >
                  Save Matches
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
