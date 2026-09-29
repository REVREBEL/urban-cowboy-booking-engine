import { useEffect, useId, useRef, useState } from "react";
import { focusFirst, trapTab } from "@/lib/focus";
import { money } from "@/lib/format";
import type { RateOffer, RoomProduct } from "../model";
import { RoomFeatures } from "./room-features";

function dateRange(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return "Select dates";
  const format = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return format.format(new Date(checkIn + "T00:00:00Z")) + " – " + format.format(new Date(checkOut + "T00:00:00Z"));
}

export function RoomDrawer({
  room,
  rates,
  checkIn,
  checkOut,
  adults,
  children = 0,
  onClose,
  onSelectRate,
}: {
  room: RoomProduct | null;
  rates: RateOffer[];
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  onClose: () => void;
  onSelectRate: (rate: RateOffer) => void;
}) {
  const [expandedRateId, setExpandedRateId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!room) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const raf = requestAnimationFrame(() => focusFirst(dialogRef.current));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      trapTab(dialogRef.current, event);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      requestAnimationFrame(() => returnFocusRef.current?.focus());
    };
  }, [room]);

  if (!room) return null;

  const photos = room.images.length ? room.images : [room.thumbImage];
  const guests =
    adults +
    " Adult" +
    (adults === 1 ? "" : "s") +
    (children > 0 ? " · " + children + " Child" + (children === 1 ? "" : "ren") : "");

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        aria-label="Close room details"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/40 backdrop-blur-sm"
      />

      <div ref={dialogRef} className="absolute inset-0 z-10 flex overflow-hidden bg-linen">
        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col md:flex-row">
            <div className="flex shrink-0 gap-1 overflow-x-auto p-1 md:w-[220px] md:flex-col md:overflow-y-auto">
              {photos.slice(0, 5).map((src, index) => (
                <div key={src + index} className="h-[100px] w-[140px] shrink-0 overflow-hidden md:h-[200px] md:w-full">
                  <img src={src} alt={index === 0 ? room.name : ""} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-6 px-8 py-10 md:py-12">
              <div>
                <p className="text-sm uppercase tracking-[3px] text-umber" style={{ fontFamily: "var(--font-bianco)", fontWeight: 700 }}>
                  {room.experience}
                </p>
                <h2 id={titleId} className="mt-4 text-4xl uppercase leading-none text-umber md:text-5xl" style={{ fontFamily: "var(--font-desert)", fontWeight: 700 }}>
                  {room.name}
                </h2>
                <p className="mt-3 text-lg font-semibold leading-snug text-umber">{room.tagline}</p>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#767470]">{room.description}</p>
              </div>

              <RoomFeatures features={room.features} />
            </div>
          </div>
        </div>

        <aside className="flex w-[min(560px,42vw)] min-w-[330px] shrink-0 flex-col overflow-hidden border-l border-[#d5cfc5] bg-[#f5f2ed]">
          <header className="shrink-0 border-b border-[#d5cfc5] px-7 pb-4 pt-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xs uppercase tracking-[4px] text-umber" style={{ fontFamily: "var(--font-brothers)" }}>
                  Select a Rate
                </h3>
                <p className="mt-1 text-[15px] font-bold text-umber">
                  {dateRange(checkIn, checkOut)}
                  <span className="ml-2 text-[13px] font-normal text-[#767470]">· {guests}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#343833]/10 text-[#343833] transition-colors hover:bg-[#343833]/20"
              >
                ×
              </button>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5">
            {rates.length === 0 ? (
              <div className="grid flex-1 place-items-center text-center text-sm text-[#767470]">
                No rates available for your selected dates.
              </div>
            ) : (
              rates.map((rate) => {
                const currency = rate.currency ?? "USD";
                const expanded = expandedRateId === rate.id;
                return (
                  <article key={rate.id} className="overflow-hidden rounded-xl border border-umber/15 bg-white">
                    <button
                      type="button"
                      onClick={() => setExpandedRateId(expanded ? null : rate.id)}
                      className="w-full p-5 text-left"
                      aria-expanded={expanded}
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          {rate.eyebrow && <p className="text-[10px] uppercase tracking-widest text-[#9a5636]">{rate.eyebrow}</p>}
                          <h4 className="mt-1 text-xl text-umber" style={{ fontFamily: "var(--font-desert)", fontWeight: 700 }}>{rate.name}</h4>
                          {rate.headline && <p className="mt-1 text-sm text-umber/70">{rate.headline}</p>}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-2xl text-umber">{money(rate.nightlyRate, currency)}</p>
                          <p className="text-[10px] uppercase text-umber/45">per night</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-umber/10 pt-3">
                        <span className="text-xs text-umber/55">
                          Stay total {money(rate.totalStay, currency)}
                          {rate.pricingVerified === false ? " · estimated" : ""}
                        </span>
                        <span className="text-xs text-[#9a5636]">{expanded ? "Hide details" : "Rate details"}</span>
                      </div>
                    </button>

                    {expanded && (
                      <div className="border-t border-umber/10 px-5 pb-5 pt-4 text-sm text-umber/70">
                        {rate.description && <p className="leading-relaxed">{rate.description}</p>}
                        {rate.cancellationPolicy && <p className="mt-3 text-xs">{rate.cancellationPolicy}</p>}
                        {rate.amountDueNow != null && (
                          <dl className="mt-4 space-y-1 border-t border-umber/10 pt-3">
                            <div className="flex justify-between gap-4">
                              <dt>Due now</dt>
                              <dd>{money(rate.amountDueNow, currency)}</dd>
                            </div>
                            {rate.remainingBalance != null && rate.remainingBalance > 0 && (
                              <div className="flex justify-between gap-4">
                                <dt>Remaining balance</dt>
                                <dd>{money(rate.remainingBalance, currency)}</dd>
                              </div>
                            )}
                          </dl>
                        )}
                      </div>
                    )}

                    <div className="px-5 pb-5">
                      <button
                        type="button"
                        onClick={() => onSelectRate(rate)}
                        className="w-full rounded-full bg-umber px-5 py-3 text-xs font-semibold uppercase tracking-wider text-linen"
                      >
                        Select Rate
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
