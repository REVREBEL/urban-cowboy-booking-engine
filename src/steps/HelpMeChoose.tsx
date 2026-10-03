import { useState } from 'react';
import type { PartyType, MatchInterest, RecommendationPreferences } from "@/types/find-your-stay";
import { FIND_YOUR_STAY_PREFERENCES } from "@/data/findYourStayPreferences";
import { TravelPartyGroup } from "@/components/booking/discovery/FindYourStayTravelPartyButton";
import { PreferenceIconButton } from "@/components/booking/discovery/PreferenceIconButton";

const TRAVEL_PARTY_OPTIONS = [
  { id: 'solo', title: 'SOLO', subtitle: 'Time to myself' },
  { id: 'partner', title: 'PARTNER', subtitle: 'Just the two of us' },
  { id: 'friends', title: 'FRIENDS', subtitle: 'A crew weekend' },
  { id: 'family', title: 'FAMILY', subtitle: 'Grown-ups and kids' },
];

export type HelpMeChooseProps = {
  initialPreferences?: RecommendationPreferences;
  onBack: () => void;
  onSubmit: (preferences: RecommendationPreferences) => void;
};

export default function HelpMeChoose({
  initialPreferences,
  onBack,
  onSubmit,
}: HelpMeChooseProps) {
  const existing = initialPreferences;

  const [step, setStep] = useState(0);
  const [party, setParty] = useState<PartyType | null>(existing?.party ?? null);
  const [dog, setDog] = useState<boolean | null>(existing?.dog ?? null);
  const [interests, setInterests] = useState<MatchInterest[]>(
    existing?.interests ? ([existing.interests[0], existing.interests[1]].filter(Boolean) as MatchInterest[]) : [],
  );

  function toggleInterest(i: MatchInterest) {
    setInterests((prev) => {
      if (prev.includes(i)) return prev.filter((x) => x !== i);
      if (prev.length >= 2) return prev;
      return [...prev, i];
    });
  }

  function handleSubmit() {
    if (!party || dog === null || interests.length === 0) return;
    onSubmit({ party, dog, interests: [interests[0], interests[1]] });
  }

  if (step === 0) {
    return (
      <section className="min-h-[calc(100vh-80px)] bg-[#103922] px-5 pb-24 pt-10 text-[#EBE8E0] md:px-10 md:pt-12">
        <div className="mx-auto w-full max-w-5xl">
          <button type="button" onClick={onBack} className="mb-10 font-bianco text-xs font-bold uppercase tracking-[2px] text-[#EBE8E0]/60 transition-colors hover:text-[#EBE8E0]">
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

          <TravelPartyGroup
            options={TRAVEL_PARTY_OPTIONS}
            value={party}
            onChange={(value) => setParty(value as PartyType)}
            className="max-w-none justify-items-stretch [&>button]:!h-[104px] [&>button]:!w-full"
          />

          <div className="mt-10 grid items-center gap-8 border-t border-[#EBE8E0]/15 pt-8 md:grid-cols-[minmax(0,1fr)_220px]">
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
                    className={`rounded-full border-2 px-6 pb-2 pt-[10px] font-bianco text-xs font-bold uppercase tracking-[1.5px] transition-colors ${
                      dog === value
                        ? "border-[#EBE8E0] bg-[#EBE8E0] text-[#4E332D]"
                        : "border-[#EBE8E0] bg-transparent text-[#EBE8E0] hover:bg-white/10"
                    }`}
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
              className={`mx-auto flex h-48 w-48 items-center justify-center text-[#EBE8E0] transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EBE8E0] ${
                dog === true ? "opacity-100" : "opacity-50 hover:opacity-75"
              }`}
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
              onClick={() => setStep(1)}
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
      <div className="mx-auto w-full max-w-6xl">
        <button type="button" onClick={() => setStep(0)} className="mb-10 font-bianco text-xs font-bold uppercase tracking-[2px] text-[#EBE8E0]/60 transition-colors hover:text-[#EBE8E0]">
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
          {FIND_YOUR_STAY_PREFERENCES.map((option) => {
            const selected = interests.includes(option.id);
            const disabled = !selected && interests.length >= 2;
            return (
              <div key={option.id} className={disabled ? "pointer-events-none opacity-35" : ""}>
                <PreferenceIconButton
                  id={option.id}
                  label={option.label}
                  description={option.description}
                  selected={selected}
                  onToggle={() => toggleInterest(option.id)}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between gap-5">
          <p className="font-editorial text-xs text-[#EBE8E0]/55">{interests.length} of 2 selected</p>
          <button
            type="button"
            disabled={interests.length === 0}
            onClick={handleSubmit}
            className="rounded-full bg-[#EBE8E0] px-8 pb-3 pt-[14px] font-bianco text-xs font-bold uppercase tracking-[2px] text-[#4E332D] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Find My Matches →
          </button>
        </div>
      </div>
    </section>
  );
}
