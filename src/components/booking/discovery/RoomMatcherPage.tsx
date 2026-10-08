import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  User,
  Users,
  Users2,
} from "lucide-react";
import type { SearchCriteria } from "@/types";
import type {
  MatchInterest,
  PartyType,
  RecommendationPreferences,
} from "@/types/find-your-stay";
import { FIND_YOUR_STAY_PREFERENCES } from "@/data/findYourStayPreferences";
import type { TravelPartyItem } from "./FindYourStayTravelPartyButton";
import { MatcherProgress } from "./RoomMatcherProgress";

export const ROOM_MATCHER_PARTY_OPTIONS: TravelPartyItem[] = [
  { id: "solo", title: "SOLO", subtitle: "Quiet solitude & creative space" },
  { id: "partner", title: "COUPLE", subtitle: "Romance, soaking & fireside den" },
  { id: "friends", title: "FRIENDS", subtitle: "Shared porches & communal hearth" },
  { id: "family", title: "FAMILY", subtitle: "Generous suites & gathering lofts" },
];

export type RoomMatcherPageProps = {
  criteria?: SearchCriteria;
  initialPreferences?: RecommendationPreferences;
  onBack: () => void;
  onSubmit: (preferences: RecommendationPreferences) => void;
  onViewAllRooms?: () => void;
};

const PARTY_CARDS: Array<{
  id: PartyType;
  label: string;
  subtitle: string;
  icon: typeof User;
}> = [
  {
    id: "solo",
    label: "Solo",
    subtitle: "Quiet solitude & creative space",
    icon: User,
  },
  {
    id: "partner",
    label: "Couple",
    subtitle: "Romance, soaking & fireside den",
    icon: Heart,
  },
  {
    id: "friends",
    label: "Friends",
    subtitle: "Shared porches & communal hearth",
    icon: Users,
  },
  {
    id: "family",
    label: "Family",
    subtitle: "Generous suites & gathering lofts",
    icon: Users2,
  },
];

const DETAILED_DOG_ICON = "/assets/icons/amenities/detailed/dog_friendly.svg";
const SIMPLE_DOG_ICON = "/assets/badges/features/dog_friendly.svg";

export function RoomMatcherPage({
  initialPreferences,
  onBack,
  onSubmit,
}: RoomMatcherPageProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [party, setParty] = useState<PartyType | null>(
    initialPreferences?.party ?? null,
  );
  const [dog, setDog] = useState<boolean | null>(
    initialPreferences ? initialPreferences.dog : null,
  );
  const [interests, setInterests] = useState<MatchInterest[]>(() =>
    initialPreferences?.interests
      ? ([initialPreferences.interests[0], initialPreferences.interests[1]].filter(
          Boolean,
        ) as MatchInterest[])
      : [],
  );

  const canContinue = party !== null && dog !== null;
  const canFinish = interests.length > 0;

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
    if (!party || dog === null || interests.length === 0) return;

    onSubmit({
      party,
      dog,
      interests: [interests[0], interests[1]],
    });
  }

  return (
    <section className="min-h-screen bg-[#FAF9F9] pb-24 text-[#1C1917]">
      <MatcherProgress step={step} />

      <div className="mx-auto max-w-[1360px] px-4 py-10 sm:px-8 sm:py-14">
        {step === 1 ? (
          <div className="space-y-10">
            <header className="mx-auto max-w-3xl space-y-3 text-center">
              <p className="font-woodblock text-xs font-bold uppercase tracking-[0.25em] text-[#9A5636]">
                Step 1 of 2 · Traveler Profile
              </p>
              <h1 className="font-display text-3xl font-light uppercase leading-[1.05] tracking-wide text-[#1C1917] sm:text-5xl">
                Tell Us About the
                <br className="hidden sm:block" /> Traveler(s) for This Trip
              </h1>
              <p className="mx-auto max-w-2xl font-sans text-sm leading-6 text-[#60605E] sm:text-base">
                Whether you&apos;re sneaking away for quiet solitude, celebrating romance, or gathering friends,
                we&apos;ll guide you to the suites built for your company.
              </p>
            </header>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {PARTY_CARDS.map((item) => {
                const selected = party === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setParty(item.id)}
                    className={[
                      "flex min-h-[150px] flex-col justify-between rounded-2xl border-2 p-5 text-left transition-all sm:min-h-[165px] sm:p-7",
                      selected
                        ? "border-[#4E332D] bg-[#EBE8E0]/70 ring-1 ring-[#4E332D] shadow-sm"
                        : "border-[#EBE8E0] bg-white hover:border-[#4E332D]/40 hover:bg-[#FAF9F9]",
                    ].join(" ")}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Icon
                          className={[
                            "h-5 w-5 sm:h-6 sm:w-6",
                            selected ? "text-[#4E332D]" : "text-[#73716D]",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                        {selected ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0E301A] text-white">
                            <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" />
                          </span>
                        ) : null}
                      </div>

                      <span className="block font-brothers text-lg font-bold uppercase tracking-wide text-[#1C1917] sm:text-xl">
                        {item.label}
                      </span>
                    </div>

                    <span className="mt-3 block font-sans text-xs leading-relaxed text-[#60605E]">
                      {item.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="min-h-[150px] rounded-2xl border-2 border-[#EBE8E0] bg-white p-5 sm:min-h-[175px] sm:p-7">
              <div className="flex h-full flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center sm:h-28 sm:w-28">
                    <img
                      src={SIMPLE_DOG_ICON}
                      alt=""
                      aria-hidden="true"
                      className="h-16 w-16 object-contain sm:hidden"
                    />
                    <img
                      src={DETAILED_DOG_ICON}
                      alt=""
                      aria-hidden="true"
                      className="hidden h-28 w-28 object-contain sm:block"
                    />
                  </div>

                  <div>
                    <h2 className="font-brothers text-base font-bold uppercase tracking-wide text-[#1C1917] sm:text-lg">
                      Traveling With Your Pup?
                    </h2>
                    <p className="mt-1 max-w-2xl font-sans text-xs leading-5 text-[#60605E] sm:text-sm">
                      We&apos;ll keep your matches strictly to suites where four-legged adventurers are welcome to join.
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
                  {[
                    { value: true, label: "Yes" },
                    { value: false, label: "No" },
                  ].map((option) => {
                    const selected = dog === option.value;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setDog(option.value)}
                        className={[
                          "min-w-[66px] rounded-full border px-5 py-2.5 font-woodblock text-xs uppercase tracking-wider transition-all",
                          selected
                            ? "border-[#4E332D] bg-[#4E332D] font-bold text-white shadow-sm"
                            : "border-[#D1C9BE] bg-white text-[#1C1917] hover:bg-[#FAF9F9]",
                        ].join(" ")}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[#EBE8E0] pt-6">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-2 font-woodblock text-xs uppercase tracking-wider text-[#73716D] transition hover:text-[#4E332D]"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </button>
                <span className="hidden font-mono text-xs text-[#73716D] sm:inline">
                  {party
                    ? "Traveler: " +
                      (party === "partner" ? "COUPLE" : party.toUpperCase()) +
                      (dog !== null ? " · Pup: " + (dog ? "YES" : "NO") : "")
                    : "Select your traveler profile"}
                </span>
              </div>

              <button
                type="button"
                disabled={!canContinue}
                onClick={() => {
                  if (canContinue) {
                    setStep(2);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className={[
                  "flex items-center gap-2 rounded-full px-8 py-3.5 font-woodblock text-xs uppercase tracking-widest transition-all",
                  canContinue
                    ? "bg-[#4E332D] text-white shadow-md hover:bg-[#221C18] hover:shadow-lg active:scale-95"
                    : "cursor-not-allowed bg-[#D1C9BE] text-[#73716D] opacity-60",
                ].join(" ")}
              >
                Continue to Escape Focus
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <header className="mx-auto max-w-4xl space-y-3 text-center">
              <p className="font-woodblock text-xs font-bold uppercase tracking-[0.25em] text-[#9A5636]">
                Step 2 of 2 · Escape Intention
              </p>
              <h1 className="font-display text-3xl font-light uppercase leading-tight tracking-wide text-[#1C1917] sm:text-5xl">
                The Focus for This Escape Is:
              </h1>
              <p className="font-sans text-sm text-[#60605E] sm:text-base">
                Choose up to two, and we&apos;ll point you toward the rooms that fit your kind of escape.
              </p>
              <div className="inline-flex items-center rounded-full bg-[#EBE8E0]/70 px-3.5 py-1 font-mono text-xs text-[#4E332D]">
                {interests.length} of 2 selected
              </div>
            </header>

            <div
              className="mx-auto grid max-w-[1360px] grid-cols-2 gap-5 sm:gap-6 md:grid-cols-4 lg:gap-8"
              role="group"
              aria-label="Choose up to two room preferences"
            >
              {FIND_YOUR_STAY_PREFERENCES.map((option) => {
                const selected = interests.includes(option.id);

                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-label={option.label}
                    aria-pressed={selected}
                    title={option.label}
                    onClick={() => toggleInterest(option.id)}
                    className={[
                      "group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 p-4 transition-all duration-200 sm:rounded-3xl sm:p-6 lg:p-7",
                      selected
                        ? "scale-[1.02] border-[#4E332D] bg-[#EBE8E0]/90 shadow-xl ring-2 ring-[#4E332D] ring-offset-2"
                        : "border-[#EBE8E0] bg-white hover:scale-[1.015] hover:border-[#4E332D]/40 hover:bg-[#FAF9F9] hover:shadow-lg",
                    ].join(" ")}
                  >
                    <img
                      src={"/assets/illustrations/interaction/find-your-stay/" + option.artwork}
                      alt={option.label}
                      className="h-full w-full select-none object-contain contrast-125 transition-transform duration-200 group-hover:scale-105"
                    />

                    {selected ? (
                      <span className="absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#0E301A] text-white shadow-md sm:right-4 sm:top-4 sm:h-8 sm:w-8">
                        <Check className="h-4 w-4 stroke-[3]" aria-hidden="true" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-[#EBE8E0] pt-6">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2 rounded-full px-4 py-3 font-woodblock text-xs uppercase tracking-wider text-[#73716D] transition hover:text-[#4E332D]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Travelers
              </button>

              <button
                type="button"
                disabled={!canFinish}
                onClick={finish}
                className={[
                  "flex items-center gap-2 rounded-full px-8 py-3.5 font-woodblock text-xs uppercase tracking-widest transition-all",
                  canFinish
                    ? "bg-[#4E332D] text-white shadow-md hover:bg-[#221C18] hover:shadow-lg active:scale-95"
                    : "cursor-not-allowed bg-[#D1C9BE] text-[#73716D] opacity-60",
                ].join(" ")}
              >
                Reveal Top Room Matches
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
