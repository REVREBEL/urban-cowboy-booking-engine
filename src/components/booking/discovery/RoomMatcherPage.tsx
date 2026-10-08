import { useState } from "react";
import type { SearchCriteria } from "@/types";
import type {
  MatchInterest,
  PartyType,
  RecommendationPreferences,
} from "@/types/find-your-stay";
import { FIND_YOUR_STAY_PREFERENCES } from "@/data/findYourStayPreferences";
import { cn } from "@/lib/utils";
import {
  TravelPartyGroup,
  type TravelPartyItem,
} from "./FindYourStayTravelPartyButton";
import { PreferenceIconButton } from "./PreferenceIconButton";
import { DogToggleButton } from "./DogToggleButton";

export const ROOM_MATCHER_PARTY_OPTIONS: TravelPartyItem[] = [
  { id: "solo", title: "SOLO", subtitle: "Time to myself" },
  { id: "partner", title: "PARTNER", subtitle: "Just the two of us" },
  { id: "friends", title: "FRIENDS", subtitle: "A crew weekend" },
  { id: "family", title: "FAMILY", subtitle: "Grown-ups and kids" },
];

export type RoomMatcherPageProps = {
  criteria?: SearchCriteria;
  initialPreferences?: RecommendationPreferences;
  onBack: () => void;
  onSubmit: (preferences: RecommendationPreferences) => void;
  onViewAllRooms?: () => void;
};

function shortDate(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function RoomMatcherPage({
  criteria,
  initialPreferences,
  onBack,
  onSubmit,
  onViewAllRooms,
}: RoomMatcherPageProps) {
  const [step, setStep] = useState<0 | 1>(0);
  const [party, setParty] = useState<PartyType | null>(
    initialPreferences?.party ?? null,
  );
  const [dog, setDog] = useState(initialPreferences?.dog ?? false);
  const [interests, setInterests] = useState<MatchInterest[]>(() =>
    initialPreferences?.interests
      ? ([initialPreferences.interests[0], initialPreferences.interests[1]].filter(
          Boolean,
        ) as MatchInterest[])
      : [],
  );

  function toggleInterest(interest: MatchInterest) {
    setInterests((current) => {
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }
      if (current.length >= 2) {
        return [current[1], interest];
      }
      return [...current, interest];
    });
  }

  function finish() {
    if (!party || interests.length === 0) return;
    onSubmit({
      party,
      dog,
      interests: [interests[0], interests[1]],
    });
  }

  return (
    <section className="min-h-screen bg-[#EBE8E0] pb-24 pt-8 text-[#4E332D] md:pt-12">
      <div className="booking-shell">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-y border-[#4E332D]/20 py-4">
          <button
            type="button"
            onClick={onBack}
            className="font-bianco text-[11px] font-bold uppercase tracking-[2px] text-[#4E332D]/70 transition hover:text-[#4E332D]"
          >
            ← Back
          </button>

          {criteria && (
            <p className="font-editorial text-sm text-[#4E332D]/70">
              {shortDate(criteria.checkIn)} → {shortDate(criteria.checkOut)}
              <span className="mx-2 text-[#4E332D]/30">·</span>
              {criteria.nights} night{criteria.nights === 1 ? "" : "s"}
              <span className="mx-2 text-[#4E332D]/30">·</span>
              {criteria.guests} guest{criteria.guests === 1 ? "" : "s"}
            </p>
          )}

          {onViewAllRooms ? (
            <button
              type="button"
              onClick={onViewAllRooms}
              className="font-bianco text-[11px] font-bold uppercase tracking-[2px] text-[#9A5636] underline underline-offset-4"
            >
              Skip to All Rooms
            </button>
          ) : (
            <span />
          )}
        </div>

        <div
          className="mb-9 flex items-center gap-3"
          aria-label={"Step " + (step + 1) + " of 2"}
        >
          <span
            className={cn(
              "h-3 w-3 rounded-full",
              step === 0 ? "bg-[#9A5636]" : "bg-[#4E332D]/25",
            )}
          />
          <span className="h-px w-12 bg-[#4E332D]/20" />
          <span
            className={cn(
              "h-3 w-3 rounded-full",
              step === 1 ? "bg-[#9A5636]" : "bg-[#4E332D]/25",
            )}
          />
        </div>

        {step === 0 ? (
          <>
            <header className="mb-8 max-w-4xl">
              <p className="mb-3 font-bianco text-xs font-bold uppercase tracking-[5px] text-[#9A5636]">
                Step 1 of 2
              </p>
              <h1 className="font-desert text-[clamp(42px,5.2vw,72px)] font-bold uppercase leading-[0.94] tracking-[1px]">
                Who&apos;s Coming Along?
              </h1>
              <p className="mt-4 max-w-3xl font-editorial text-base leading-7 text-[#6B6259]">
                Tell us who is making the trip. Your actual guest counts already handle capacity and age eligibility, while these answers help us rank the rooms that fit the stay best.
              </p>
            </header>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
              <div className="rounded-3xl border border-[#4E332D]/20 bg-[#FAF9F9] p-5 sm:p-7">
                <p className="mb-4 font-bianco text-[11px] font-bold uppercase tracking-[2px] text-[#4E332D]/65">
                  Your crew
                </p>
                <TravelPartyGroup
                  options={ROOM_MATCHER_PARTY_OPTIONS}
                  value={party}
                  onChange={(value) => setParty(value as PartyType)}
                  className="max-w-none justify-items-stretch [&>button]:!h-[112px] [&>button]:!w-full"
                />
              </div>

              <div className="flex min-h-[260px] flex-col rounded-3xl border border-[#4E332D]/20 bg-[#FAF9F9] p-5 sm:min-h-[330px] sm:p-7">
                <div>
                  <p className="font-bianco text-[11px] font-bold uppercase tracking-[2px] text-[#4E332D]/65">
                    Bringing the dog?
                  </p>
                  <p className="mt-2 max-w-md font-editorial text-sm leading-6 text-[#6B6259]">
                    Tap the pup and we&apos;ll keep every recommendation dog-friendly.
                  </p>
                </div>

                <div className="mt-5 flex-1">
                  <DogToggleButton
                    selected={dog}
                    onToggle={() => setDog((current) => !current)}
                    className="h-full rounded-2xl"
                  />
                </div>

                <p className="mt-4 text-center font-bianco text-[10px] font-bold uppercase tracking-[2px] text-[#9A5636]">
                  {dog ? "Dog coming" : "No dog selected"}
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-[#4E332D]/15 pt-6">
              <button
                type="button"
                disabled={!party}
                onClick={() => setStep(1)}
                className="rounded-full bg-[#4E332D] px-8 pb-3 pt-[14px] font-bianco text-xs font-bold uppercase tracking-[2px] text-[#FAF9F9] transition hover:bg-[#9A5636] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Continue →
              </button>
            </div>
          </>
        ) : (
          <>
            <header className="mb-8 max-w-4xl">
              <p className="mb-3 font-bianco text-xs font-bold uppercase tracking-[5px] text-[#9A5636]">
                Step 2 of 2
              </p>
              <h1 className="font-desert text-[clamp(42px,5.2vw,72px)] font-bold uppercase leading-[0.94] tracking-[1px]">
                What Helps You Escape?
              </h1>
              <p className="mt-4 max-w-3xl font-editorial text-base leading-7 text-[#6B6259]">
                Choose up to two. We&apos;ll rank the live room types using these preferences after hard eligibility rules like children and dog policy are applied.
              </p>
            </header>

            <div
              className="grid grid-cols-2 gap-5 rounded-3xl border border-[#4E332D]/20 bg-[#FAF9F9] p-5 sm:p-7 md:grid-cols-3 xl:grid-cols-4"
              role="group"
              aria-label="Choose up to two room preferences"
            >
              {FIND_YOUR_STAY_PREFERENCES.map((option) => {
                const selected = interests.includes(option.id);
                return (
                  <div key={option.id} className="flex flex-col items-center text-center">
                    <PreferenceIconButton
                      id={option.id}
                      label={option.label}
                      description={option.description}
                      selected={selected}
                      onToggle={() => toggleInterest(option.id)}
                    />
                    <p className="mt-3 font-bianco text-[11px] font-bold uppercase tracking-[1.4px] text-[#4E332D]">
                      {option.label}
                    </p>
                    <p className="mt-1 max-w-48 font-editorial text-[11px] leading-4 text-[#6B6259]">
                      {option.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-[#4E332D]/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="font-bianco text-xs font-bold uppercase tracking-[2px] text-[#4E332D]/65 hover:text-[#4E332D]"
                >
                  ← Back
                </button>
                <span className="font-editorial text-xs text-[#6B6259]">
                  {interests.length} of 2 selected
                </span>
              </div>

              <button
                type="button"
                disabled={!party || interests.length === 0}
                onClick={finish}
                className="rounded-full bg-[#4E332D] px-8 pb-3 pt-[14px] font-bianco text-xs font-bold uppercase tracking-[2px] text-[#FAF9F9] transition hover:bg-[#9A5636] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Find My Matches →
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
