import { useState } from "react";
import type { MatchInterest, PartyType, RecommendationPreferences } from "@/types/merchandising";
import { FindYourStayTravelPartyButton } from "../controls/FindYourStayTravelPartyButton";
import { PREFERENCE_OPTIONS, PreferenceIconButton } from "../controls/PreferenceIconButton";

export type HelpMeChooseProps = {
  initialPreferences?: RecommendationPreferences | null;
  onBack: () => void;
  onSubmit: (preferences: RecommendationPreferences) => void;
};

const PARTY_OPTIONS: Array<{ id: PartyType; title: string; subtitle: string }> = [
  { id: "friends", title: "FRIENDS", subtitle: "A crew weekend" },
  { id: "solo", title: "SOLO", subtitle: "Time to myself" },
  { id: "family", title: "FAMILY", subtitle: "Grown-ups and kids" },
  { id: "partner", title: "PARTNER", subtitle: "Just the two of us" },
];

export default function HelpMeChoose({ initialPreferences, onBack, onSubmit }: HelpMeChooseProps) {
  const [screen, setScreen] = useState<"party" | "preferences">("party");
  const [party, setParty] = useState<PartyType | null>(initialPreferences?.party ?? null);
  const [dog, setDog] = useState<boolean | null>(initialPreferences?.dog ?? null);
  const [interests, setInterests] = useState<MatchInterest[]>(
    initialPreferences?.interests
      ? ([initialPreferences.interests[0], initialPreferences.interests[1]].filter(Boolean) as MatchInterest[])
      : [],
  );

  function toggleInterest(interest: MatchInterest) {
    setInterests((current) => {
      if (current.includes(interest)) return current.filter((item) => item !== interest);
      if (current.length >= 2) return current;
      return [...current, interest];
    });
  }

  function submit() {
    if (!party || dog === null || interests.length === 0) return;
    onSubmit({ party, dog, interests: [interests[0], interests[1]] });
  }

  if (screen === "party") {
    return (
      <section className="min-h-[calc(100vh-80px)] bg-[#103922] px-5 pb-24 pt-10 text-[#EBE8E0] md:px-10 md:pt-12">
        <div className="mx-auto max-w-3xl">
          <button type="button" onClick={onBack} className="mb-10 font-bianco text-xs font-bold uppercase tracking-[2px] text-[#EBE8E0]/60 hover:text-[#EBE8E0]">
            ← Back
          </button>

          <div className="mb-10 flex items-center gap-3" aria-label="Step 1 of 2">
            <span className="h-3 w-3 rounded-full bg-[#BE5B35]" />
            <span className="h-px w-10 bg-[#EBE8E0]/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#EBE8E0]/25" />
          </div>

          <p className="mb-4 font-bianco text-xs font-bold uppercase tracking-[5px] text-[#BE5B35]">Step 1 of 2</p>
          <h1 className="font-desert text-5xl font-bold uppercase leading-none tracking-[1px] md:text-6xl">Who&apos;s Coming Along?</h1>
          <p className="mb-10 mt-5 font-editorial text-sm text-[#EBE8E0]/60">This helps us match the right size and vibe.</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Travel party type">
            {PARTY_OPTIONS.map((option) => (
              <FindYourStayTravelPartyButton
                key={option.id}
                id={option.id}
                title={option.title}
                subtitle={option.subtitle}
                isSelected={party === option.id}
                onSelect={(value) => setParty(value as PartyType)}
                style={{ width: "100%" }}
              />
            ))}
          </div>

          <div className="mt-10 grid items-center gap-8 border-t border-[#EBE8E0]/15 pt-8 md:grid-cols-[1fr_220px]">
            <div>
              <h2 className="font-bianco text-sm font-bold">Traveling with your pup?</h2>
              <p className="mt-2 max-w-sm font-editorial text-xs leading-5 text-[#EBE8E0]/65">
                We&apos;ll keep your matches to rooms where they&apos;re welcome to join the adventure.
              </p>
              <div className="mt-5 flex gap-3" role="radiogroup" aria-label="Traveling with a dog">
                {[true, false].map((value) => (
                  <button
                    key={String(value)}
                    type="button"
                    role="radio"
                    aria-checked={dog === value}
                    onClick={() => setDog(value)}
                    className={"rounded-full border-2 px-6 pb-2 pt-[10px] font-bianco text-xs font-bold uppercase tracking-[1.5px] transition-colors " + (dog === value ? "border-[#EBE8E0] bg-[#EBE8E0] text-[#4E332D]" : "border-[#EBE8E0] bg-transparent text-[#EBE8E0] hover:bg-white/10")}
                  >
                    {value ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              aria-label="Select yes, traveling with a dog"
              aria-pressed={dog === true}
              onClick={() => setDog(true)}
              className={"mx-auto flex h-48 w-48 items-center justify-center transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EBE8E0] " + (dog === true ? "text-[#EBE8E0] opacity-100" : "text-[#EBE8E0] opacity-50 hover:opacity-75")}
            >
              <span
                aria-hidden="true"
                className="block h-full w-full bg-current"
                style={{
                  maskImage: "url('/assets/icons/amenities/detailed/dog_friendly.svg')",
                  WebkitMaskImage: "url('/assets/icons/amenities/detailed/dog_friendly.svg')",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                }}
              />
            </button>
          </div>

          <div className="mt-10 flex justify-end">
            <button
              type="button"
              disabled={!party || dog === null}
              onClick={() => setScreen("preferences")}
              className="rounded-full bg-[#EBE8E0] px-8 pb-3 pt-[14px] font-bianco text-xs font-bold uppercase tracking-[2px] text-[#4E332D] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Continue →
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[#59352F] px-5 pb-24 pt-10 text-[#EBE8E0] md:px-10 md:pt-12">
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={() => setScreen("party")} className="mb-10 font-bianco text-xs font-bold uppercase tracking-[2px] text-[#EBE8E0]/60 hover:text-[#EBE8E0]">
          ← Back
        </button>

        <div className="mb-10 flex items-center gap-3" aria-label="Step 2 of 2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#EBE8E0]/70" />
          <span className="h-px w-10 bg-[#EBE8E0]/20" />
          <span className="h-3 w-3 rounded-full bg-[#BE5B35]" />
        </div>

        <p className="mb-4 font-bianco text-xs font-bold uppercase tracking-[5px] text-[#BE5B35]">Step 2 of 2</p>
        <h1 className="font-desert text-5xl font-bold uppercase leading-none tracking-[1px] md:text-6xl">What Helps You Escape?</h1>
        <p className="mb-10 mt-5 font-editorial text-sm text-[#EBE8E0]/55">
          Choose up to two, and we&apos;ll point you toward the rooms that fit your kind of escape.
        </p>

        <div className="grid grid-cols-2 justify-items-center gap-5 sm:grid-cols-3" role="group" aria-label="Choose up to two preferences">
          {PREFERENCE_OPTIONS.map((option) => {
            const selected = interests.includes(option.id);
            return (
              <PreferenceIconButton
                key={option.id}
                option={option}
                selected={selected}
                disabled={!selected && interests.length >= 2}
                onToggle={() => toggleInterest(option.id)}
              />
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between gap-5">
          <p className="font-editorial text-xs text-[#EBE8E0]/55">{interests.length} of 2 selected</p>
          <button
            type="button"
            disabled={interests.length === 0}
            onClick={submit}
            className="rounded-full bg-[#EBE8E0] px-8 pb-3 pt-[14px] font-bianco text-xs font-bold uppercase tracking-[2px] text-[#4E332D] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Find My Matches →
          </button>
        </div>
      </div>
    </section>
  );
}
