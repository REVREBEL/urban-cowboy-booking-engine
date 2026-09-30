import { useState } from 'react';
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
  illustrationOn: string;
  illustrationOff: string;
  labelOn: string;
  labelOff: string;
};


const ICON: Record<InterestMeta, string> = {
  "iconic-tub": "/assets/icons/amenities/buttons/copper_clawfoot_soaking_tub.svg",
  "bathe-outside": "/assets/icons/amenities/buttons/outdoor_cedar_soaking_tub.svg",
  "my-own-place": "/assets/icons/amenities/buttons/cabin.svg",
  "near-everything": "/assets/icons/amenities/buttons/separate_living_room.svg",
  "simple-cozy": "/assets/icons/amenities/buttons/letter_writing_desk.svg",
  "mountain-views": "/assets/icons/amenities/buttons/peak_balcony_mountian_view.svg",
};

const LABEL: Partial<Record<InterestMeta, string>> = {
  "iconic-tub": "/assets/labels/copper_clawfoot_soaking_tub.svg",
  "bathe-outside": "/assets/labels/soak-outside-label.svg",
  "my-own-place": "/assets/labels/my-own-place-label-unselected.svg",
  "near-everything": "/assets/labels/spaces-to-gather-label-unselected.svg",
  "simple-cozy": "/assets/labels/simple-cozy-label-unselected.svg",
  "mountain-views": "/assets/labels/scenic-views-label-unselected.svg",
};

const INTEREST_OPTIONS: InterestMeta[] = [
  {
    value: 'iconTub',
    label: 'Iconic Copper Tub',
    illustrationOn:  "/assets/icons/amenities/buttons/copper_clawfoot_soaking_tub.svg",
    illustrationOff: "/assets/icons/amenities/buttons/copper_clawfoot_soaking_tub.svg",
    labelOn:  "/assets/labels/copper_clawfoot_soaking_tub.svg",
    labelOff: "/assets/labels/copper_clawfoot_soaking_tub.svg",
  },
  {
    value: 'ownPlace',
    label: 'My Own Place',
    illustrationOn:  "/assets/icons/amenities/buttons/cabin.svg",
    illustrationOff: "/assets/icons/amenities/buttons/cabin.svg",
    labelOn:  "/assets/labels/my-own-place-label-unselected.svg",
    labelOff: "/assets/labels/my-own-place-label-unselected.svg",
  },
  {
    value: 'scenic',
    label: 'Scenic Views',
    illustrationOn:  "/assets/icons/amenities/buttons/peak_balcony_mountian_view.svg",
    illustrationOff: "/assets/icons/amenities/buttons/peak_balcony_mountian_view.svg",
    labelOn:  "/assets/labels/scenic-views-label-unselected.svg",
    labelOff: "/assets/labels/scenic-views-label-unselected.svg",
  },
  {
    value: 'outdoorSoak',
    label: 'Soak Outside',
    illustrationOn:  "/assets/icons/amenities/buttons/outdoor_cedar_soaking_tub.svg",
    illustrationOff: "/assets/icons/amenities/buttons/outdoor_cedar_soaking_tub.svg",
    labelOn:  "/assets/labels/soak-outside-label.svg",
    labelOff: "/assets/labels/soak-outside-label.svg",
  },
  {
    value: 'simpleCozy',
    label: 'Simple + Cozy',
    illustrationOn:  "/assets/icons/amenities/buttons/peak_balcony_mountian_view.svg",
    illustrationOff: "/assets/icons/amenities/buttons/peak_balcony_mountian_view.svg",
    labelOn:  "/assets/labels/simple-cozy-label-unselected.svg",
    labelOff: "/assets/labels/simple-cozy-label-unselected.svg",
  },
  {
    value: 'social',
    label: 'Spaces to Gather',
    illustrationOn:  "/assets/icons/amenities/buttons/separate_living_room.svg",
    illustrationOff: "/assets/icons/amenities/buttons/separate_living_room.svg",
    labelOn:  "/assets/labels/spaces-to-gather-label-unselected.svg",
    labelOff: "/assets/labels/spaces-to-gather-label-unselected.svg",
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
      <div className="max-w-3xl mx-auto px-5 md:px-10 pt-10 pb-20">

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
                  <img
                    src="/assets/dog-toggle-on.svg"
                    alt="Yes, bringing a dog"
                    className="w-full h-full object-contain"
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
                      <div className="relative flex-1 flex items-end justify-center" style={{ minHeight: 97 }}>
                        <img
                          src={selected ? opt.illustrationOn : opt.illustrationOff}
                          alt=""
                          aria-hidden="true"
                          className="object-bottom pointer-events-none"
                          style={{
                            maxHeight: 97,
                            maxWidth: '100%',
                            opacity: selected ? 1 : 0.5,
                            objectFit: 'contain',
                          }}
                        />
                      </div>

                      {/* Ribbon label */}
                      <div className="relative flex-shrink-0" style={{ height: 45, width: 120 }}>
                        <img
                          src={selected ? opt.labelOn : opt.labelOff}
                          alt={opt.label}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </div>
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
