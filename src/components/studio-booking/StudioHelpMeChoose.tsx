import { useState } from "react";
import type { MatchInterest, PartyType, RecommendationPreferences } from "@/types/merchandising";
import {
  DOG_ICON,
  DOG_ICON_SELECTED,
  PREFERENCE_ICON,
  PREFERENCE_ICON_SELECTED,
  PREFERENCE_LABEL,
  PREFERENCE_LABEL_SELECTED,
  type PreferenceArtworkId,
} from "@/lib/booking/cowboy";

type StudioHelpMeChooseProps = {
  initialPreferences?: RecommendationPreferences | null;
  onBack: () => void;
  onSubmit: (preferences: RecommendationPreferences) => void;
};

const PARTY_OPTIONS: Array<{ id: PartyType; label: string; sub: string }> = [
  { id: "partner", label: "Partner", sub: "Just the two of us" },
  { id: "friends", label: "Friends", sub: "A crew weekend" },
  { id: "family", label: "Family", sub: "Grown-ups and kids" },
  { id: "solo", label: "Solo", sub: "Time to myself" },
];

const PREFERENCES: Array<{ id: MatchInterest; label: string; artwork: PreferenceArtworkId }> = [
  { id: "iconTub", label: "Iconic Copper Tub", artwork: "iconic-tub" },
  { id: "outdoorSoak", label: "Bathe Outside", artwork: "bathe-outside" },
  { id: "ownPlace", label: "My Own Place", artwork: "my-own-place" },
  { id: "scenic", label: "Mountain Views", artwork: "mountain-views" },
  { id: "simpleCozy", label: "Simple + Cozy", artwork: "simple-cozy" },
  { id: "social", label: "Spaces to Gather", artwork: "near-everything" },
];

export function StudioHelpMeChoose({ initialPreferences, onBack, onSubmit }: StudioHelpMeChooseProps) {
  const [screen, setScreen] = useState<"party" | "preferences">("party");
  const [party, setParty] = useState<PartyType | null>(initialPreferences?.party ?? null);
  const [dog, setDog] = useState<boolean | null>(initialPreferences?.dog ?? null);
  const [interests, setInterests] = useState<MatchInterest[]>(
    initialPreferences?.interests.filter(Boolean) as MatchInterest[] | undefined ?? [],
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
            {PARTY_OPTIONS.map((option) => {
              const selected = party === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setParty(option.id)}
                  className={"rounded-[20px] border-2 px-6 py-7 text-left transition " + (selected ? "border-[#EBE8E0] bg-[#EBE8E0] text-[#4E332D]" : "border-[#EBE8E0]/45 bg-white/10 text-[#EBE8E0] hover:bg-white/15")}
                >
                  <span className="block font-brothers text-[22px] font-bold uppercase leading-none tracking-[0.05em]">{option.label}</span>
                  <span className={"mt-2 block font-editorial text-[12px] leading-snug " + (selected ? "text-[#6B4C42]" : "text-[#EBE8E0]/70")}>{option.sub}</span>
                </button>
              );
            })}
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
              aria-label="Traveling with a dog"
              aria-pressed={dog === true}
              onClick={() => setDog(true)}
              className="mx-auto h-48 w-48 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EBE8E0]"
            >
              <img
                src={dog === true ? DOG_ICON_SELECTED : DOG_ICON}
                alt=""
                aria-hidden="true"
                className={"h-full w-full object-contain " + (dog === true ? "opacity-100" : "opacity-55")}
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
          {PREFERENCES.map((option) => {
            const selected = interests.includes(option.id);
            const disabled = !selected && interests.length >= 2;
            const icon = selected ? PREFERENCE_ICON_SELECTED[option.artwork] ?? PREFERENCE_ICON[option.artwork] : PREFERENCE_ICON[option.artwork];
            const label = selected ? PREFERENCE_LABEL_SELECTED[option.artwork] ?? PREFERENCE_LABEL[option.artwork] : PREFERENCE_LABEL[option.artwork];
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                aria-disabled={disabled}
                disabled={disabled}
                onClick={() => toggleInterest(option.id)}
                className={"flex w-full max-w-[220px] flex-col items-center border-2 p-3 transition " + (selected ? "border-[#EBE8E0] bg-[#EBE8E0]/75 text-[#4E332D]" : "border-[#EBE8E0]/35 bg-white/10 text-[#EBE8E0] hover:bg-white/15") + (disabled ? " opacity-35" : "")}
              >
                <img src={icon} alt="" aria-hidden="true" className="h-28 w-full object-contain" />
                {label ? <img src={label} alt={option.label} className="mt-2 h-10 w-36 object-contain" /> : <span className="mt-3 font-bianco text-xs font-bold uppercase tracking-wider">{option.label}</span>}
              </button>
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
