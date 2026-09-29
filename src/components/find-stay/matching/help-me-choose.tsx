import { useState } from "react";
import type { PartyType } from "@/types/merchandising";
import { DogToggleButton } from "@/components/booking/controls/dog-toggle-button";
import { PreferenceIconButton } from "@/components/booking/controls/preference-icon-button";
import type { PreferenceId } from "@/components/booking/cowboy-art";
import type { FindStayInterest, RecommendationPreferences } from "../model";

const PARTY_OPTIONS: { value: PartyType; label: string; sub: string }[] = [
  { value: "partner", label: "Partner", sub: "Just the two of us" },
  { value: "friends", label: "Friends", sub: "A crew weekend" },
  { value: "family", label: "Family", sub: "Grown-ups and kids" },
  { value: "solo", label: "Solo", sub: "Time to myself" },
];

const INTERESTS: {
  value: FindStayInterest;
  artId: PreferenceId;
  label: string;
  description: string;
}[] = [
  { value: "iconTub", artId: "iconic-tub", label: "Iconic Tub", description: "The signature indoor soak." },
  { value: "outdoorSoak", artId: "bathe-outside", label: "Soak Outside", description: "Cedar bathing out among the trees." },
  { value: "ownPlace", artId: "my-own-place", label: "My Own Place", description: "Privacy and a more independent stay." },
  { value: "social", artId: "near-everything", label: "Spaces to Gather", description: "Close to the social heart of the Cowboy." },
  { value: "simpleCozy", artId: "simple-cozy", label: "Simple + Cozy", description: "An easier-going, unfussy stay." },
  { value: "scenic", artId: "mountain-views", label: "Scenic Views", description: "The Catskills landscape comes first." },
];

export function HelpMeChoose({
  initial,
  onSubmit,
  onBack,
}: {
  initial?: Partial<RecommendationPreferences>;
  onSubmit: (preferences: RecommendationPreferences) => void;
  onBack?: () => void;
}) {
  const [party, setParty] = useState<PartyType | null>(initial?.party ?? null);
  const [dog, setDog] = useState<boolean>(initial?.dog ?? false);
  const [interests, setInterests] = useState<FindStayInterest[]>(
    initial?.interests?.filter(Boolean) as FindStayInterest[] | undefined ?? [],
  );

  function toggleInterest(value: FindStayInterest) {
    setInterests((current) => {
      if (current.includes(value)) return current.filter((item) => item !== value);
      return [...current, value].slice(-2);
    });
  }

  const canSubmit = !!party && interests.length > 0;

  return (
    <section className="border border-umber/20 bg-linen p-5 md:p-8">
      {onBack && (
        <button type="button" onClick={onBack} className="mb-8 text-xs uppercase tracking-widest text-umber/55 hover:text-umber">
          ← Back
        </button>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_250px]">
        <div>
          <h2 className="mb-4 text-sm font-semibold text-umber">Who’s Coming Along</h2>
          <div className="grid grid-cols-2 gap-3">
            {PARTY_OPTIONS.map((option) => {
              const selected = party === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setParty(option.value)}
                  className="rounded-xl border px-4 py-4 text-left transition"
                  style={{
                    borderColor: selected ? "#69253a" : "#d0cbc0",
                    background: selected ? "rgba(255,255,255,.72)" : "rgba(255,255,255,.35)",
                  }}
                >
                  <span className="block text-xs font-semibold uppercase tracking-wide text-umber">{option.label}</span>
                  <span className="mt-1 block text-[11px] text-umber/55">{option.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-l border-umber/15 pl-8">
          <h2 className="text-sm font-semibold text-umber">Traveling with your pup?</h2>
          <p className="mt-2 text-xs leading-relaxed text-umber/60">
            We’ll keep your matches to rooms where dogs are confirmed welcome.
          </p>
          <div className="mt-5">
            <DogToggleButton selected={dog} onToggle={() => setDog((value) => !value)} />
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-umber/15 pt-8">
        <h2 className="text-sm font-semibold text-umber">What’s Your Style?</h2>
        <p className="mt-2 text-xs text-umber/60">Choose up to two.</p>
        <div className="mt-5 flex flex-wrap gap-5">
          {INTERESTS.map((interest) => (
            <PreferenceIconButton
              key={interest.value}
              id={interest.artId}
              label={interest.label}
              description={interest.description}
              selected={interests.includes(interest.value)}
              onToggle={() => toggleInterest(interest.value)}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => {
            if (!party || !interests[0]) return;
            onSubmit({
              party,
              dog,
              interests: [interests[0], interests[1]],
            });
          }}
          className="rounded-full bg-umber px-7 py-3 text-xs font-semibold uppercase tracking-wider text-linen disabled:cursor-not-allowed disabled:opacity-40"
        >
          Find My Matches
        </button>
      </div>
    </section>
  );
}
