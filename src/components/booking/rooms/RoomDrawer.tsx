import { useEffect, useRef, useState } from "react";

import { money } from "@/lib/format";
import type { RateOffer, RoomProduct } from "../types";

const AMENITY_LABELS: Partial<Record<keyof RoomProduct["features"], string>> = {
  outdoorSoak: "Outdoor Cedar Soaking Tub",
  indoorTub: "Copper Clawfoot Tub",
  castIronStove: "Cast Iron Wood Stove",
  heatedFloors: "Radiant Heated Floors",
  fireplace: "Fireplace",
  fullKitchen: "Full Kitchen",
  wetBar: "Minibar",
  privateDeck: "Private Deck",
  wrapAroundPorch: "Wrap-Around Porch",
  dogFriendly: "Dog Friendly",
  separateLivingRoom: "Separate Living Room",
  den: "Den",
  walkInShower: "Walk-In Shower",
  scenicView: "Scenic Views",
};

function formatDateRange(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return "Select Dates";
  const format = (day: string) =>
    new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  return `${format(checkIn)} – ${format(checkOut)}`;
}

function RateCard({
  rate,
  expanded,
  onExpand,
  onBook,
}: {
  rate: RateOffer;
  expanded: boolean;
  onExpand: () => void;
  onBook: () => void;
}) {
  const currency = rate.currency ?? "USD";
  const theme =
    rate.variant === "outfit"
      ? "bg-[#0e301a] text-[#ebe8e0] border-[#0e301a]"
      : rate.variant === "stay-a-while"
        ? "bg-[#343833] text-[#ebe8e0] border-[#343833]"
        : rate.variant === "sunup"
          ? "bg-[#ebe8e0] text-[#69253a] border-[#9a5636]"
          : "bg-white text-[#343833] border-[#343833]";

  return (
    <article className={`overflow-hidden rounded-[28px] border-[3px] ${theme}`}>
      <div className="flex flex-col gap-4 p-6">
        {rate.eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-[2.5px] opacity-70">
            {rate.eyebrow}
          </p>
        )}
        <div>
          <h4 className="font-display text-3xl leading-none">{rate.headline || rate.name}</h4>
          {rate.description && <p className="mt-2 text-sm leading-relaxed opacity-75">{rate.description}</p>}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            {rate.nightlyRate != null && (
              <p className="text-2xl font-semibold">{money(rate.nightlyRate, currency)} nightly</p>
            )}
            {rate.totalStay != null && (
              <p className="mt-1 text-xs uppercase tracking-wider opacity-60">
                {money(rate.totalStay, currency)} stay total
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onBook}
            className="rounded-full border border-current px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-70"
          >
            Select Rate
          </button>
        </div>

        <button
          type="button"
          onClick={onExpand}
          className="self-start text-xs uppercase tracking-widest underline underline-offset-4"
        >
          {expanded ? "Hide details" : "Rate details"}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-current/15 px-6 py-5 text-sm">
          <dl className="space-y-2">
            {rate.taxTotal != null && (
              <div className="flex justify-between gap-4">
                <dt className="opacity-60">Taxes & fees</dt>
                <dd>{money(rate.taxTotal, currency)}</dd>
              </div>
            )}
            {rate.totalStay != null && (
              <div className="flex justify-between gap-4 font-semibold">
                <dt>Total stay</dt>
                <dd>{money(rate.totalStay, currency)}</dd>
              </div>
            )}
            {rate.amountDueNow != null && (
              <div className="flex justify-between gap-4">
                <dt className="opacity-60">Due now</dt>
                <dd>{money(rate.amountDueNow, currency)}</dd>
              </div>
            )}
            {rate.remainingBalance != null && rate.remainingBalance > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="opacity-60">Remaining balance</dt>
                <dd>{money(rate.remainingBalance, currency)}</dd>
              </div>
            )}
          </dl>
          {rate.cancellationPolicy && <p className="mt-4 text-xs leading-relaxed opacity-65">{rate.cancellationPolicy}</p>}
          {rate.paymentPolicy && <p className="mt-2 text-xs leading-relaxed opacity-65">{rate.paymentPolicy}</p>}
        </div>
      )}
    </article>
  );
}

export default function RoomDrawer({
  room,
  rates,
  checkIn,
  checkOut,
  adults,
  children,
  onClose,
  onSelectRate,
}: {
  room: RoomProduct | null;
  rates: RateOffer[];
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  onClose: () => void;
  onSelectRate: (rate: RateOffer) => void;
}) {
  const [expandedRateId, setExpandedRateId] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!room) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => closeButtonRef.current?.focus());

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      requestAnimationFrame(() => returnFocusRef.current?.focus());
    };
  }, [room, onClose]);

  if (!room) return null;

  const photos = room.images.length ? room.images.slice(0, 4) : [room.thumbImage].filter(Boolean);
  const amenities = Object.entries(AMENITY_LABELS)
    .filter(([key]) => room.features[key as keyof RoomProduct["features"]] === true)
    .map(([, label]) => label)
    .filter((label): label is string => !!label);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="room-drawer-title" className="fixed inset-0 z-50 flex overflow-hidden bg-[#ebe8e0]">
        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col md:flex-row">
            <div className="flex shrink-0 gap-1 overflow-x-auto p-1 md:w-[220px] md:flex-col md:overflow-y-auto">
              {photos.map((src, index) => (
                <div key={`${src}-${index}`} className="h-[100px] w-[140px] shrink-0 overflow-hidden md:h-[200px] md:w-full">
                  <img src={src} alt={index === 0 ? room.name : ""} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-6 px-8 py-10 md:py-12">
              <p className="text-sm uppercase tracking-[3px] text-[#4e332d]">{room.experience}</p>
              <h2 id="room-drawer-title" className="text-[clamp(32px,4vw,56px)] uppercase leading-none text-[#4e332d]" style={{ fontFamily: "var(--font-desert)", fontWeight: 700 }}>{room.name}</h2>
              <p className="max-w-[480px] text-lg font-semibold leading-snug text-[#4e332d]">{room.tagline}</p>
              <p className="max-w-[520px] text-[15px] leading-relaxed text-[#767470]">{room.description}</p>

              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs uppercase tracking-widest text-[#9a5636]">
                {room.features.sqft && <span>{room.features.sqft} sq ft</span>}
                {room.features.beds && <span>{room.features.beds}</span>}
                {room.features.sleeps && <span>Sleeps {room.features.sleeps}</span>}
                {room.features.adults21Plus && <span>21+ only</span>}
              </div>

              {amenities.length > 0 && (
                <div>
                  <p className="mb-4 text-xs uppercase tracking-[4px] text-[#4e332d]">Top Room Amenities</p>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {amenities.map((label) => (
                      <li key={label} className="rounded-lg border border-[#4e332d]/15 bg-white/30 px-3 py-2 text-xs text-[#4e332d]">{label}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="flex w-[clamp(320px,38vw,560px)] shrink-0 flex-col overflow-hidden border-l border-[#d5cfc5] bg-[#f5f2ed]">
          <div className="shrink-0 border-b border-[#d5cfc5] px-7 pb-4 pt-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="mb-1 text-xs uppercase tracking-[4px] text-[#4e332d]">Select a Rate</h3>
                <p className="text-[15px] font-bold text-[#4e332d]">
                  {formatDateRange(checkIn, checkOut)}
                  <span className="ml-2 text-[13px] font-normal text-[#767470]">
                    · {adults} adult{adults === 1 ? "" : "s"}
                    {children > 0 ? ` · ${children} child${children === 1 ? "" : "ren"}` : ""}
                  </span>
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="ml-4 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#343833]/10 text-[#343833] transition-colors hover:bg-[#343833]/20"
                aria-label="Close room details"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5">
            {rates.length === 0 ? (
              <div className="grid flex-1 place-items-center p-8 text-center text-sm text-[#767470]">
                No rates are currently available for the selected stay.
              </div>
            ) : (
              rates.map((rate) => (
                <RateCard
                  key={rate.id}
                  rate={rate}
                  expanded={expandedRateId === rate.id}
                  onExpand={() => setExpandedRateId((current) => current === rate.id ? null : rate.id)}
                  onBook={() => onSelectRate(rate)}
                />
              ))
            )}
            <p className="px-4 pb-2 text-center text-[11px] text-[#9a9590]">
              Final totals, taxes, fees, and amount due are supplied by the Mews reservation quote.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
