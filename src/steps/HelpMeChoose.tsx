import { useState } from 'react';
import type { PartyType, MatchInterest, RecommendationPreferences } from "@/types/find-your-stay";
import type { PreferenceId } from "@/types/booking-ui";
import { TravelPartyGroup } from "@/components/booking/discovery/FindYourStayTravelPartyButton";
import { PreferenceIconButton } from "@/components/booking/discovery/PreferenceIconButton";

type InterestMeta = {
  value: MatchInterest;
  label: string;
  description: string;
};

const INTEREST_OPTIONS: InterestMeta[] = [
  {
    value: 'iconTub',
    label: 'Iconic Copper Tub',
    description: 'The signature Cowboy bathing ritual.',
  },
  {
    value: 'ownPlace',
    label: 'My Own Place',
    description: 'A private place to settle in.',
  },
  {
    value: 'scenic',
    label: 'Scenic Views',
    description: 'Mountain and forest views.',
  },
  {
    value: 'outdoorSoak',
    label: 'Soak Outside',
    description: 'A soak in the open air.',
  },
  {
    value: 'simpleCozy',
    label: 'Simple + Cozy',
    description: 'Something easy, warm, and unfussy.',
  },
  {
    value: 'social',
    label: 'Spaces to Gather',
    description: 'Room for everyone to gather.',
  },
];

const PREFERENCE_IDS: Record<MatchInterest, PreferenceId> = {
  iconTub: 'iconic-tub',
  outdoorSoak: 'bathe-outside',
  ownPlace: 'my-own-place',
  scenic: 'mountain-views',
  simpleCozy: 'simple-cozy',
  social: 'bringing-my-people',
};

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

            <TravelPartyGroup value={party} onChange={(value) => setParty(value as PartyType)} className="max-w-none" />
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

            <div className="flex flex-wrap justify-center gap-4" role="group" aria-label="Room interests, select up to 2">
              {INTEREST_OPTIONS.map((opt) => {
                const selected = interests.includes(opt.value);
                const dimmed = !selected && interests.length >= 2;

                return (
                  <div
                    key={opt.value}
                  >
                    <div className={dimmed ? 'pointer-events-none opacity-35' : ''}>
                      <PreferenceIconButton
                        id={PREFERENCE_IDS[opt.value]}
                        label={opt.label}
                        description={opt.description}
                        selected={selected}
                        onToggle={() => toggleInterest(opt.value)}
                      />
                    </div>
                  </div>
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
