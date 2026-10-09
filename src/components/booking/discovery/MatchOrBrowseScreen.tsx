import type { ReactNode } from "react";
import { Calendar, ArrowLeft } from "lucide-react";
import type { SearchCriteria } from "@/types";
import { LodgeSignboard } from "./RusticLodgeSignboard";

interface MatchOrBrowseScreenProps {
  criteria: SearchCriteria;
  availableCount?: number;
  onFindYourStay: () => void;
  onShowAllRooms: () => void;
  onChangeDates: () => void;
}

function formatDateDisplay(date: string) {
  if (!date) return "";
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

function SignAction({
  children,
  onClick,
  tone,
}: {
  children: ReactNode;
  onClick: () => void;
  tone: "yellow" | "pink";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-full w-full items-center justify-center border border-smoke px-2 text-center font-label text-[8px] font-bold uppercase leading-tight tracking-[0.08em] shadow-[0_3px_0_rgba(28,18,13,0.65)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:px-3 sm:text-xs md:text-sm ${
        tone === "yellow"
          ? "bg-lodge-yellow text-smoke hover:bg-lodge-yellow"
          : "bg-nude-ember text-smoke hover:bg-nude-ember"
      }`}
    >
      {children}
    </button>
  );
}

export function MatchOrBrowseScreen({
  criteria,
  availableCount,
  onFindYourStay,
  onShowAllRooms,
  onChangeDates,
}: MatchOrBrowseScreenProps) {
  return (
    <section className="min-h-[calc(100vh-120px)] bg-alpine-linen pb-20 pt-8 md:pt-12">
      <div className="booking-shell">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-y border-cowboy-umber/20 py-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-body text-sm text-cowboy-umber">
            <Calendar className="h-4 w-4 text-copper" aria-hidden="true" />
            <span>
              {formatDateDisplay(criteria.checkIn)} → {formatDateDisplay(criteria.checkOut)}
            </span>
            <span className="text-cowboy-umber/35">·</span>
            <span className="text-cowboy-umber/65">
              {criteria.nights} night{criteria.nights === 1 ? "" : "s"}
            </span>
            <span className="text-cowboy-umber/35">·</span>
            <span className="text-cowboy-umber/65">
              {criteria.guests} guest{criteria.guests === 1 ? "" : "s"}
            </span>
          </div>

          <button
            type="button"
            onClick={onChangeDates}
            className="font-number text-xs font-bold uppercase tracking-[2px] underline underline-offset-4"
          >
            Change
          </button>
        </div>

        <div className="mx-auto max-w-6xl">
          <LodgeSignboard
            textSlot={
              <div className="max-w-[16rem] text-center text-lodge-yellow drop-shadow-[0_3px_1px_rgba(0,0,0,0.45)]">
                <p className="font-number text-[7px] font-bold uppercase tracking-[0.22em] text-lodge-yellow-fade sm:text-[10px]">
                  {availableCount === undefined
                    ? "Find Your Stay"
                    : `${availableCount} Room Experience${availableCount === 1 ? "" : "s"} Available`}
                </p>
                <h1 className="mt-2 font-heading text-[clamp(22px,4vw,52px)] font-bold uppercase leading-[0.9] tracking-[1px]">
                  Want Help Finding the Right One?
                </h1>
                <p className="mx-auto mt-3 hidden max-w-[14rem] font-body text-[10px] leading-snug text-lodge-yellow-fade sm:block md:text-xs">
                  Tell us what kind of stay you want and we&apos;ll point you toward the strongest matches.
                </p>
              </div>
            }
            buttonSlotTop={
              <SignAction tone="yellow" onClick={onFindYourStay}>
                Help Me Choose
              </SignAction>
            }
            buttonSlotBottom={
              <SignAction tone="pink" onClick={onShowAllRooms}>
                Show All Rooms
              </SignAction>
            }
          />
        </div>

        <div className="mx-auto mt-7 flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="max-w-2xl text-center font-body text-sm leading-6 text-ash-900 sm:text-left">
            A place with this much character comes with more ways to stay. Get a quick recommendation or browse every live room type available for your dates.
          </p>

          <button
            type="button"
            onClick={onChangeDates}
            className="inline-flex shrink-0 items-center gap-2 font-number text-[11px] font-bold uppercase tracking-[2px] text-cowboy-umber/70 transition hover:text-cowboy-umber"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to Dates
          </button>
        </div>
      </div>
    </section>
  );
}
