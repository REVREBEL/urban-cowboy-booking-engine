import { useState } from "react";

import { DogToggleButton } from "../match/DogToggleButton";
import { PreferenceIconButton } from "../match/PreferenceIconButton";
import type {
  MatchInterest,
  PartyType,
  RecommendationPreferences,
} from "../types";

const PARTY_OPTIONS: { value: PartyType; label: string; sub: string }[] = [
  { value: "partner", label: "Partner", sub: "Just the two of us" },
  { value: "friends", label: "Friends", sub: "A crew weekend" },
  { value: "family", label: "Family", sub: "Grown-ups and kids" },
  { value: "solo", label: "Solo", sub: "Time to myself" },
];

const INTEREST_OPTIONS: { value: MatchInterest; label: string; description: string }[] = [
  { value: "iconTub", label: "Iconic Copper Tub", description: "The signature indoor soak." },
  { value: "outdoorSoak", label: "Soak Outside", description: "Bathing outside among the trees." },
  { value: "ownPlace", label: "My Own Place", description: "A more private, independent stay." },
  { value: "social", label: "Spaces to Gather", description: "Shared spaces and room for the crew." },
  { value: "simpleCozy", label: "Simple + Cozy", description: "Easygoing, comfortable Catskills lodging." },
  { value: "scenic", label: "Scenic Views", description: "Keep the Catskills landscape in the room." },
];

const STEP_LABELS = ["Who's Coming", "Bringing a Dog?", "What Matters"];

export default function HelpMeChoose({
  initialPreferences,
  onSubmit,
  onBack,
}: {
  initialPreferences?: RecommendationPreferences | null;
  onSubmit: (preferences: RecommendationPreferences) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState(0);
  const [party, setParty] = useState<PartyType | null>(initialPreferences?.party ?? null);
  const [dog, setDog] = useState<boolean | null>(initialPreferences?.dog ?? null);
  const [interests, setInterests] = useState<MatchInterest[]>(
    initialPreferences?.interests
      ? initialPreferences.interests.filter(Boolean) as MatchInterest[]
      : [],
  );

  function toggleInterest(interest: MatchInterest) {
    setInterests((current) => {
      if (current.includes(interest)) return current.filter((item) => item !== interest);
      if (current.length >= 2) return [current[1], interest];
      return [...current, interest];
    });
  }

  function submit() {
    if (!party || dog === null || interests.length === 0) return;
    onSubmit({ party, dog, interests: [interests[0], interests[1]] });
  }

  const canAdvance = [party !== null, dog !== null, interests.length >= 1];
  const stepBg = ["bg-[#4e332d]", "bg-[#343833]", "bg-[#4e332d]"][step];

  return (
    <main className={`min-h-screen ${stepBg} transition-colors duration-500`}>
      <div className="mx-auto max-w-3xl px-5 pb-20 pt-10 md:px-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-10 flex items-center gap-2 text-xs uppercase tracking-widest text-[rgba(235,232,224,0.6)] transition-colors hover:text-[#ebe8e0]"
          style={{ fontFamily: "var(--font-brothers)" }}
        >
          ← Back
        </button>

        <div className="mb-10 flex items-center gap-3" role="list" aria-label="Question steps">
          {STEP_LABELS.map((label, index) => (
            <div key={label} role="listitem" className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => index < step && setStep(index)}
                className={
                  index === step
                    ? "h-3 w-3 rounded-full bg-[#9a5636]"
                    : index < step
                      ? "h-2.5 w-2.5 cursor-pointer rounded-full bg-[rgba(235,232,224,0.7)]"
                      : "h-2.5 w-2.5 rounded-full bg-[rgba(235,232,224,0.25)]"
                }
                aria-current={index === step ? "step" : undefined}
                aria-label={`Step ${index + 1}: ${label}`}
              />
              {index < 2 && <div className="h-px w-8 bg-[rgba(235,232,224,0.2)]" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <section>
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#9a5636]" style={{ fontFamily: "var(--font-brothers)" }}>Step 1 of 3</p>
            <h1 className="mb-2 text-4xl leading-tight text-[#ebe8e0] md:text-5xl" style={{ fontFamily: "var(--font-desert)", fontWeight: 700 }}>Who&apos;s Coming Along?</h1>
            <p className="mb-10 text-sm text-[rgba(235,232,224,0.6)]" style={{ fontFamily: "var(--font-uchen)" }}>This helps us match the right size and vibe.</p>
            <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="Travel party type">
              {PARTY_OPTIONS.map((option) => {
                const selected = party === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setParty(option.value)}
                    className="relative flex min-h-[100px] flex-col justify-center gap-1.5 rounded-[20px] border-2 px-6 py-7 text-left transition-all"
                    style={{
                      background: selected ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.25)",
                      borderColor: selected ? "#4e332d" : "#a79996",
                    }}
                  >
                    <span className="text-[22px] uppercase leading-none" style={{ fontFamily: "var(--font-brothers)", fontWeight: 700, color: selected ? "#4e332d" : "#ebe8e0", letterSpacing: "0.05em" }}>{option.label}</span>
                    <span className="text-[12px] leading-snug" style={{ fontFamily: "var(--font-uchen)", color: selected ? "#6b4c42" : "rgba(235,232,224,0.7)" }}>{option.sub}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 1 && (
          <section>
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#9a5636]" style={{ fontFamily: "var(--font-brothers)" }}>Step 2 of 3</p>
            <h1 className="mb-2 text-4xl leading-tight text-[#ebe8e0] md:text-5xl" style={{ fontFamily: "var(--font-desert)", fontWeight: 700 }}>Bringing a Dog?</h1>
            <p className="mb-10 text-sm text-[rgba(235,232,224,0.6)]" style={{ fontFamily: "var(--font-uchen)" }}>Dog-friendly inventory is treated as a booking requirement, not a preference.</p>
            <div className="flex items-center justify-center gap-8">
              <DogToggleButton selected={dog === true} onToggle={() => setDog(true)} />
              <button
                type="button"
                aria-pressed={dog === false}
                onClick={() => setDog(false)}
                className={`grid size-36 place-items-center border-[0.386px] border-oxblood p-0.5 text-[#ebe8e0] md:size-40 ${dog === false ? "bg-white/15" : "opacity-50"}`}
              >
                <span className="grid h-full w-full place-items-center border-[0.386px] border-white/30 font-label text-sm uppercase tracking-wider">No Dog</span>
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#9a5636]" style={{ fontFamily: "var(--font-brothers)" }}>Step 3 of 3</p>
            <h1 className="mb-2 text-4xl leading-tight text-[#ebe8e0] md:text-5xl" style={{ fontFamily: "var(--font-desert)", fontWeight: 700 }}>What Matters Most?</h1>
            <p className="mb-10 text-sm text-[rgba(235,232,224,0.6)]" style={{ fontFamily: "var(--font-uchen)" }}>Pick up to two. The matching layer decides which available rooms fit them best.</p>
            <div className="flex flex-wrap justify-center gap-4" role="group" aria-label="Room interests, select up to 2">
              {INTEREST_OPTIONS.map((option) => {
                const selected = interests.includes(option.value);
                const blocked = !selected && interests.length >= 2;
                return (
                  <PreferenceIconButton
                    key={option.value}
                    id={option.value}
                    label={option.label}
                    description={option.description}
                    selected={selected}
                    onToggle={() => !blocked && toggleInterest(option.value)}
                    className={blocked ? "cursor-not-allowed opacity-35" : undefined}
                  />
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-12 flex items-center justify-between">
          {step > 0 ? (
            <button type="button" onClick={() => setStep((current) => current - 1)} className="text-sm uppercase tracking-widest text-[rgba(235,232,224,0.5)] transition-colors hover:text-[#ebe8e0]" style={{ fontFamily: "var(--font-brothers)" }}>← Back</button>
          ) : <div />}
          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep((current) => current + 1)}
              disabled={!canAdvance[step]}
              className="rounded-full bg-[#9a5636] px-8 py-3 text-sm font-bold tracking-[0.1em] text-white transition-colors hover:bg-[#8b3a2e] disabled:cursor-not-allowed disabled:opacity-40"
              style={{ fontFamily: "var(--font-brothers)" }}
            >
              CONTINUE
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={interests.length === 0}
              className="rounded-full bg-[#9a5636] px-8 py-3 text-sm font-bold tracking-[0.1em] text-white transition-colors hover:bg-[#8b3a2e] disabled:cursor-not-allowed disabled:opacity-40"
              style={{ fontFamily: "var(--font-brothers)" }}
            >
              FIND MY MATCHES
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
