import { ChevronRight, X } from "lucide-react";
import { useEffect } from "react";

import { RateList } from "@/components/booking/RateList";
import { RoomGallery } from "@/components/booking/RoomGallery";
import { BADGE_ICON, BRAND, FEATURE_ICON } from "@/lib/booking/cowboy";
import { roomPhotos } from "@/lib/booking/photos";
import type { RateId, Room } from "@/lib/booking/rooms";

function badgesFor(room: Room) {
  const badges = [{ icon: BADGE_ICON.wifi, label: "Wifi access" }];
  if (room.petsWelcome) {
    badges.push({ icon: BADGE_ICON.dogFriendly, label: "Dog friendly" });
  }
  if (room.maxChildren === 0) {
    badges.push({ icon: BADGE_ICON.adultsOnly, label: "21+ only" });
  }
  return badges;
}

/**
 * The room, full page: gallery up top, then the story of the room, its
 * features and the availability panel with the rates.
 */
export function RoomDetailsFull({
  room,
  reasons,
  nights,
  selectedRateId,
  onClose,
  onChooseRate,
}: {
  room: Room;
  reasons?: string[] | undefined;
  nights: number;
  selectedRateId?: RateId | null | undefined;
  onClose: () => void;
  onChooseRate: (rateId: RateId) => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const photos = roomPhotos(room.id);
  const badges = badgesFor(room);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${room.name} details`}
      className="fixed inset-0 z-50 overflow-y-auto bg-background"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-ink px-5 py-4 md:px-10">
        <img
          src={BRAND.wordmarkLinen}
          alt="Urban Cowboy"
          className="h-6 w-auto object-contain"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChooseRate("ride-easy")}
            className="font-button rounded-full bg-copper px-5 py-2.5 text-xs text-background transition-opacity hover:opacity-90"
          >
            Book now
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close room details"
            className="flex size-10 items-center justify-center rounded-full border border-background/20 text-background transition-colors hover:bg-background/10"
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      <nav
        aria-label="Breadcrumb"
        className="mx-auto flex w-full max-w-6xl items-center gap-2 px-5 py-5 text-xs text-muted-foreground md:px-10"
      >
        <button type="button" onClick={onClose} className="eyebrow hover:text-foreground">
          All rooms
        </button>
        <ChevronRight className="size-3" aria-hidden="true" />
        <span className="eyebrow">{room.house} Haus</span>
        <ChevronRight className="size-3" aria-hidden="true" />
        <span className="eyebrow text-foreground">{room.name}</span>
      </nav>

      <RoomGallery
        photos={photos}
        className="mx-auto h-[46vh] w-full max-w-6xl md:h-[62vh]"
        contain
        priority
      />

      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-12 md:px-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-10">
          <div className="space-y-5">
            <img
              src={BRAND.building}
              alt=""
              aria-hidden="true"
              className="h-20 w-auto object-contain"
            />
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge.label}
                  className="flex items-center gap-2 rounded-full border border-ink/15 bg-snow px-3 py-1.5"
                >
                  <img src={badge.icon} alt="" aria-hidden="true" className="size-4" />
                  <span className="eyebrow text-[10px] text-umber">{badge.label}</span>
                </span>
              ))}
            </div>

            <h1 className="font-display text-4xl leading-tight text-umber md:text-5xl">
              {room.name}
            </h1>
            <p className="font-brand text-2xl text-accent">{room.headline}.</p>
            <p className="max-w-2xl leading-relaxed text-muted-foreground">{room.blurb}</p>

            {reasons && reasons.length > 0 && (
              <div className="max-w-xl border-l-2 border-copper/60 pl-4">
                <p className="eyebrow text-[10px] text-muted-foreground">Why we picked it</p>
                <ul className="mt-2 space-y-1 text-sm text-foreground">
                  {reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <section>
            <h2 className="font-brand text-sm text-umber">Room features</h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
              {room.features.map((feature) => (
                <li key={feature.label} className="flex flex-col items-start gap-3">
                  <img
                    src={FEATURE_ICON[feature.kind]}
                    alt=""
                    aria-hidden="true"
                    className="h-14 w-auto object-contain"
                  />
                  <span className="text-sm text-foreground">{feature.label}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="h-fit border border-ink/15 bg-linen p-6 lg:sticky lg:top-28">
          <h2 className="font-brand text-sm text-umber">Check availability</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-b border-border pb-4 text-sm">
            <div>
              <dt className="eyebrow text-[10px] text-muted-foreground">People</dt>
              <dd>{room.maxAdults + room.maxChildren} max</dd>
            </div>
            <div>
              <dt className="eyebrow text-[10px] text-muted-foreground">Bed(s)</dt>
              <dd>
                {room.features.find((feature) => feature.kind === "bed")?.label ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-[10px] text-muted-foreground">Nights</dt>
              <dd>{nights > 0 ? nights : "—"}</dd>
            </div>
            <div>
              <dt className="eyebrow text-[10px] text-muted-foreground">Haus</dt>
              <dd>{room.house}</dd>
            </div>
          </dl>

          <RateList
            room={room}
            nights={nights}
            selectedRateId={selectedRateId}
            onChooseRate={onChooseRate}
            className="mt-5"
          />

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Pick a rate to hold this room. Details, extras and payment come next.
          </p>
        </aside>
      </div>
    </div>
  );
}
