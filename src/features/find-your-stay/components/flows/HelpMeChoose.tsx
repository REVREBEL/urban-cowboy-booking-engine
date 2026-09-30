import { useState } from 'react';
import { cn } from "@/lib/utils";
import type { PartyType, MatchInterest, RecommendationPreferences } from "../../types";

const PARTY_OPTIONS: { value: PartyType; label: string; sub: string }[] = [
  { value: 'partner', label: 'Partner',  sub: 'Just the two of us'  },
  { value: 'friends', label: 'Friends',  sub: 'A crew weekend'       },
  { value: 'family',  label: 'Family',   sub: 'Grown-ups and kids'   },
  { value: 'solo',    label: 'Solo',     sub: 'Time to myself'       },
];

type InterestMeta = {
  value: MatchInterest;
  label: string;
  illustration: string;
  labelArt: string;
};

type MaskedArtworkProps = {
  src: string;
  selected: boolean;
  className?: string;
};

function MaskedArtwork({ src, selected, className }: MaskedArtworkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block shrink-0 bg-current transition-all duration-200",
        selected ? "text-oxblood opacity-100" : "text-umber opacity-50",
        className,
      )}
      style={{
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

const INTEREST_OPTIONS: InterestMeta[] = [
  {
    value: 'iconTub',
    label: 'Iconic Copper Tub',
    illustration: "/assets/icons/amenities/buttons/copper_clawfoot_soaking_tub.svg",
    labelArt: "/assets/labels/copper_clawfoot_soaking_tub.svg",
  },
  {
    value: 'ownPlace',
    label: 'My Own Place',
    illustration: "/assets/icons/amenities/buttons/cabin.svg",
    labelArt: "/assets/labels/my-own-place-label-unselected.svg",
  },
  {
    value: 'scenic',
    label: 'Scenic Views',
    illustration: "/assets/icons/amenities/buttons/peak_balcony_mountian_view.svg",
    labelArt: "/assets/labels/scenic-views-label-unselected.svg",
  },
  {
    value: 'outdoorSoak',
    label: 'Soak Outside',
    illustration: "/assets/icons/amenities/buttons/outdoor_cedar_soaking_tub.svg",
    labelArt: "/assets/labels/soak-outside-label.svg",
  },
  {
    value: 'simpleCozy',
    label: 'Simple + Cozy',
    illustration: "/assets/icons/amenities/buttons/letter_writing_desk.svg",
    labelArt: "/assets/labels/simple-cozy-label-unselected.svg",
  },
  {
    value: 'social',
    label: 'Spaces to Gather',
    illustration: "/assets/icons/amenities/buttons/separate_living_room.svg",
    labelArt: "/assets/labels/spaces-to-gather-label-unselected.svg",
  },
];

const STEP_LABELS = ["Who's Coming", 'Bringing a Dog?', 'What Matters'];

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
      if (prev.length >= 2) return [prev[1], i];
      return [...prev, i];
    });
  }

  function handleSubmit() {
    if (!party || dog === null || interests.length === 0) return;
    onSubmit({ party, dog, interests: [interests[0], interests[1]] });
  }

  const canAdvance = [party !== null, dog !== null, interests.length >= 1];

  // Background shifts per step so translucent white cards always read
  const stepBg = ['bg-[#4e332d]', 'bg-[#343833]', 'bg-[#4e332d]'][step];

  return (
    <main className={`min-h-screen ${stepBg} transition-colors duration-500`}>
      <div className="booking-shell max-w-5xl pt-10 pb-20">

        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs tracking-widest uppercase text-[rgba(235,232,224,0.6)] hover:text-[#ebe8e0] mb-10 transition-colors"
          style={{ fontFamily: 'var(--font-brothers)' }}
        >
          ← Back
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-3 mb-10" role="list" aria-label="Question steps">
          {STEP_LABELS.map((label, idx) => (
            <div key={label} role="listitem" className="flex items-center gap-3">
              <button
                onClick={() => idx < step && setStep(idx)}
                className={[
                  'rounded-full transition-all duration-300',
                  idx === step
                    ? 'w-3 h-3 bg-[#9a5636]'
                    : idx < step
                    ? 'w-2.5 h-2.5 bg-[rgba(235,232,224,0.7)] cursor-pointer'
                    : 'w-2.5 h-2.5 bg-[rgba(235,232,224,0.25)]',
                ].join(' ')}
                aria-current={idx === step ? 'step' : undefined}
                aria-label={`Step ${idx + 1}: ${label}`}
              />
              {idx < 2 && <div className="w-8 h-px bg-[rgba(235,232,224,0.2)]" />}
            </div>
          ))}
        </div>

        {/* ── Step 0: Who's Coming ─────────────────────────────────── */}
        {step === 0 && (
          <section>
            <p
              className="text-xs tracking-[0.25em] uppercase text-[#9a5636] mb-3"
              style={{ fontFamily: 'var(--font-brothers)' }}
            >
              Step 1 of 3
            </p>
            <h1
              className="text-4xl md:text-5xl text-[#ebe8e0] leading-tight mb-2"
              style={{ fontFamily: 'var(--font-desert)', fontWeight: 700 }}
            >
              Who's Coming Along?
            </h1>
            <p className="text-sm text-[rgba(235,232,224,0.6)] mb-10" style={{ fontFamily: 'var(--font-uchen)' }}>
              This helps us match the right size and vibe.
            </p>

            <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="Travel party type">
              {PARTY_OPTIONS.map((opt) => {
                const selected = party === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setParty(opt.value)}
                    className="relative flex flex-col justify-center gap-1.5 px-6 py-7 rounded-[20px] border-2 cursor-pointer transition-all text-left"
                    style={{
                      background: selected ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.25)',
                      borderColor: selected ? '#4e332d' : '#a79996',
                      minHeight: 100,
                    }}
                  >
                    <span
                      className="text-[22px] leading-none uppercase"
                      style={{
                        fontFamily: 'var(--font-brothers)',
                        fontWeight: 700,
                        color: selected ? '#4e332d' : '#ebe8e0',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {opt.label}
                    </span>
                    <span
                      className="text-[12px] leading-snug"
                      style={{
                        fontFamily: 'var(--font-uchen)',
                        color: selected ? '#6b4c42' : 'rgba(235,232,224,0.7)',
                      }}
                    >
                      {opt.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Step 1: Dog ──────────────────────────────────────────── */}
        {step === 1 && (
          <section>
            <p
              className="text-xs tracking-[0.25em] uppercase text-[#9a5636] mb-3"
              style={{ fontFamily: 'var(--font-brothers)' }}
            >
              Step 2 of 3
            </p>
            <h1
              className="text-4xl md:text-5xl text-[#ebe8e0] leading-tight mb-2"
              style={{ fontFamily: 'var(--font-desert)', fontWeight: 700 }}
            >
              Bringing a Dog?
            </h1>
            <p className="text-sm text-[rgba(235,232,224,0.6)] mb-10" style={{ fontFamily: 'var(--font-uchen)' }}>
              Some rooms are dog-friendly. This is a hard filter.
            </p>

            <div className="flex justify-center gap-8" role="radiogroup" aria-label="Dog-friendly filter">
              {/* Yes — dog on */}
              <button
                type="button"
                role="radio"
                aria-checked={dog === true}
                onClick={() => setDog(true)}
                className="flex flex-col items-center gap-4 transition-all"
              >
                <div
                  className="rounded-full overflow-hidden transition-all duration-300"
                  style={{
                    border: dog === true ? '3px solid #4e332d' : '2px solid #a79996',
                    opacity: dog === false ? 0.4 : 1,
                    width: 160,
                    height: 160,
                    background: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <span
                    role="img"
                    aria-label="Yes, bringing a dog"
                    className="block h-full w-full bg-current transition-opacity duration-300"
                    style={{
                      color: '#ebe8e0',
                      opacity: dog === true ? 1 : 0.5,
                      WebkitMaskImage: 'url("/assets/icons/amenities/detailed/dog_friendly.svg")',
                      maskImage: 'url("/assets/icons/amenities/detailed/dog_friendly.svg")',
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                    }}
                  />
                </div>
                <span
                  className="text-[18px] uppercase tracking-wider"
                  style={{
                    fontFamily: 'var(--font-brothers)',
                    fontWeight: 700,
                    color: dog === true ? '#ebe8e0' : 'rgba(235,232,224,0.5)',
                  }}
                >
                  Yes
                </span>
              </button>

              {/* No — dog off */}
              <button
                type="button"
                role="radio"
                aria-checked={dog === false}
                onClick={() => setDog(false)}
                className="flex flex-col items-center gap-4 transition-all"
              >
                <div
                  className="rounded-full overflow-hidden transition-all duration-300"
                  style={{
                    border: dog === false ? '3px solid #4e332d' : '2px solid #a79996',
                    opacity: dog === true ? 0.4 : 1,
                    width: 160,
                    height: 160,
                    background: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <img
                    src="/assets/dog-toggle-off.svg"
                    alt="No dog"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span
                  className="text-[18px] uppercase tracking-wider"
                  style={{
                    fontFamily: 'var(--font-brothers)',
                    fontWeight: 700,
                    color: dog === false ? '#ebe8e0' : 'rgba(235,232,224,0.5)',
                  }}
                >
                  No
                </span>
              </button>
            </div>
          </section>
        )}

        {/* ── Step 2: Interests ────────────────────────────────────── */}
        {step === 2 && (
          <section>
            <p
              className="text-xs tracking-[0.25em] uppercase text-[#9a5636] mb-3"
              style={{ fontFamily: 'var(--font-brothers)' }}
            >
              Step 3 of 3
            </p>
            <h1
              className="text-4xl md:text-5xl text-[#ebe8e0] leading-tight mb-2"
              style={{ fontFamily: 'var(--font-desert)', fontWeight: 700 }}
            >
              What Matters Most?
            </h1>
            <p className="text-sm text-[rgba(235,232,224,0.6)] mb-10" style={{ fontFamily: 'var(--font-uchen)' }}>
              Pick up to 2 — we'll find rooms that nail both.
            </p>

            <div
              className="flex flex-wrap gap-4 justify-center"
              role="group"
              aria-label="Room interests, select up to 2"
            >
              {INTEREST_OPTIONS.map((opt) => {
                const selected = interests.includes(opt.value);
                const dimmed = !selected && interests.length >= 2;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => !dimmed && toggleInterest(opt.value)}
                    className="flex flex-col items-center transition-all duration-200"
                    style={{
                      width: 200,
                      padding: '1.5px',
                      border: selected ? '2px solid #4e332d' : '1.5px solid #715c57',
                      borderRadius: '2px',
                      opacity: dimmed ? 0.35 : 1,
                      cursor: dimmed ? 'not-allowed' : 'pointer',
                    }}
                    aria-label={opt.label}
                    aria-disabled={dimmed}
                  >
                    {/* Inner card */}
                    <div
                      className="flex flex-col items-center justify-center gap-2.5 w-full h-full"
                      style={{
                        background: selected ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.25)',
                        minHeight: 196,
                        padding: '12px 8px 10px',
                      }}
                    >
                      {/* Sketch illustration */}
                      <div className="relative flex flex-1 items-end justify-center" style={{ minHeight: 97 }}>
                        <MaskedArtwork
                          src={opt.illustration}
                          selected={selected}
                          className="h-[97px] w-full pointer-events-none"
                        />
                      </div>

                      {/* Ribbon label */}
                      <MaskedArtwork
                        src={opt.labelArt}
                        selected={selected}
                        className="h-[45px] w-[120px]"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Navigation ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-12">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-sm tracking-widest uppercase text-[rgba(235,232,224,0.5)] hover:text-[#ebe8e0] transition-colors"
              style={{ fontFamily: 'var(--font-brothers)' }}
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 2 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance[step]}
              className="px-8 py-3 bg-[#9a5636] text-white text-sm tracking-wide rounded-full hover:bg-[#8b3a2e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: 'var(--font-brothers)', fontWeight: 700, letterSpacing: '0.1em' }}
            >
              CONTINUE
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={interests.length === 0}
              className="px-8 py-3 bg-[#9a5636] text-white text-sm tracking-wide rounded-full hover:bg-[#8b3a2e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: 'var(--font-brothers)', fontWeight: 700, letterSpacing: '0.1em' }}
            >
              FIND MY MATCHES
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
