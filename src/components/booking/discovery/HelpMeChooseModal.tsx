import React, { useState } from "react";
import { Compass, X } from "lucide-react";
import type {
  MatchInterest,
  PartyType,
  RecommendationPreferences,
} from "@/types/find-your-stay";
import { FIND_YOUR_STAY_PREFERENCES } from "@/data/findYourStayPreferences";
import { TravelPartyGroup } from "./FindYourStayTravelPartyButton";
import { ROOM_MATCHER_PARTY_OPTIONS } from "./RoomMatcherPage";
import { DogToggleButton } from "./DogToggleButton";
import { PreferenceIconButton } from "./PreferenceIconButton";

interface HelpMeChooseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (preferences: RecommendationPreferences) => void;
  initialPreferences?: RecommendationPreferences;
}

export const HelpMeChooseModal: React.FC<HelpMeChooseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialPreferences,
}) => {
  const [step, setStep] = useState<0 | 1>(0);
  const [party, setParty] = useState<PartyType | null>(
    initialPreferences?.party ?? null,
  );
  const [hasDog, setHasDog] = useState(initialPreferences?.dog ?? false);
  const [interests, setInterests] = useState<MatchInterest[]>(() =>
    initialPreferences?.interests
      ? ([initialPreferences.interests[0], initialPreferences.interests[1]].filter(
          Boolean,
        ) as MatchInterest[])
      : [],
  );

  if (!isOpen) return null;

  function toggleInterest(interest: MatchInterest) {
    setInterests((current) => {
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }
      if (current.length >= 2) return current;
      return [...current, interest];
    });
  }

  function submit() {
    if (!party || interests.length === 0) return;

    onSubmit({
      party,
      dog: hasDog,
      interests: [interests[0], interests[1]],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm sm:p-6">
      <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border-2 border-cowboy-umber bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-alpine-linen bg-alpine-linen px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Compass className="h-5 w-5 text-copper" />
            <h2 className="font-number text-sm font-bold uppercase tracking-[2px] text-cowboy-umber">
              Cowboy Stay Matcher
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close stay matcher"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-cowboy-umber transition-colors hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-7 sm:px-8 sm:py-8">
          <div
            className="mb-8 flex items-center gap-3"
            aria-label={`Step ${step + 1} of 2`}
          >
            <span
              className={`h-3 w-3 rounded-full ${
                step === 0 ? "bg-bandana-red" : "bg-cowboy-umber/35"
              }`}
            />
            <span className="h-px w-10 bg-cowboy-umber/20" />
            <span
              className={`h-3 w-3 rounded-full ${
                step === 1 ? "bg-bandana-red" : "bg-cowboy-umber/20"
              }`}
            />
          </div>

          {step === 0 ? (
            <>
              <div className="mb-8 max-w-3xl">
                <p className="mb-3 font-number text-xs font-bold uppercase tracking-[5px] text-copper">
                  Step 1 of 2
                </p>
                <h1 className="font-heading text-4xl font-bold uppercase leading-none tracking-[1px] text-cowboy-umber sm:text-5xl">
                  Who&apos;s Coming Along?
                </h1>
                <p className="mt-4 font-body text-sm leading-6 text-ash-900">
                  Tell us who&apos;s making the trip. If your dog is coming too,
                  tap the pup and we&apos;ll keep every match dog-friendly.
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
                <TravelPartyGroup
                  options={ROOM_MATCHER_PARTY_OPTIONS}
                  value={party}
                  onChange={(value) => setParty(value as PartyType)}
                  className="max-w-none justify-items-stretch [&>button]:!h-26 [&>button]:!w-full"
                />

                <div className="rounded-2xl border border-alpine-linen bg-alpine-linen/60 p-5 text-center">
                  <p className="font-number text-xs font-bold uppercase tracking-[2px] text-cowboy-umber">
                    Bringing the dog?
                  </p>
                  <p className="mx-auto mt-2 max-w-47.5 font-body text-xs leading-5 text-ash-900">
                    Tap to include your pup in the room match.
                  </p>

                  <div className="mt-5 flex justify-center">
                    <DogToggleButton
                      selected={hasDog}
                      onToggle={() => setHasDog((current) => !current)}
                    />
                  </div>

                  <p className="mt-4 font-number text-[10px] font-bold uppercase tracking-[1.5px] text-copper">
                    {hasDog ? "Dog coming" : "No dog selected"}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end border-t border-alpine-linen pt-6">
                <button
                  type="button"
                  disabled={!party}
                  onClick={() => setStep(1)}
                  className="rounded-full bg-cowboy-umber px-8 pb-3 pt-3.5 font-number text-xs font-bold uppercase tracking-[2px] text-white transition-all hover:-translate-y-0.5 hover:bg-smoke disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Continue →
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="mb-6 font-number text-xs font-bold uppercase tracking-[2px] text-cowboy-umber/55 transition-colors hover:text-cowboy-umber"
              >
                ← Back
              </button>

              <div className="mb-8 max-w-3xl">
                <p className="mb-3 font-number text-xs font-bold uppercase tracking-[5px] text-copper">
                  Step 2 of 2
                </p>
                <h1 className="font-heading text-4xl font-bold uppercase leading-none tracking-[1px] text-cowboy-umber sm:text-5xl">
                  What Helps You Escape?
                </h1>
                <p className="mt-4 font-body text-sm leading-6 text-ash-900">
                  Choose up to two. We&apos;ll use them to rank the rooms that
                  fit your kind of stay.
                </p>
              </div>

              <div
                className="grid grid-cols-2 justify-items-center gap-5 md:grid-cols-3 xl:grid-cols-4"
                role="group"
                aria-label="Choose up to two preferences"
              >
                {FIND_YOUR_STAY_PREFERENCES.map((option) => {
                  const selected = interests.includes(option.id);
                  const disabled = !selected && interests.length >= 2;

                  return (
                    <div
                      key={option.id}
                      className={disabled ? "pointer-events-none opacity-35" : ""}
                    >
                      <PreferenceIconButton
                        id={option.id}
                        label={option.label}
                        description={option.description}
                        selected={selected}
                        onToggle={() => toggleInterest(option.id)}
                      />

                      <div className="mx-auto mt-3 max-w-52 text-center">
                        <p className="font-number text-xs font-bold uppercase tracking-[1.5px] text-cowboy-umber">
                          {option.label}
                        </p>
                        <p className="mt-1 font-body text-[11px] leading-4 text-ash-900">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-col gap-4 border-t border-alpine-linen pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-body text-xs text-ash-900">
                  {interests.length} of 2 selected
                </p>

                <button
                  type="button"
                  disabled={interests.length === 0}
                  onClick={submit}
                  className="rounded-full bg-cowboy-umber px-8 pb-3 pt-3.5 font-number text-xs font-bold uppercase tracking-[2px] text-white transition-all hover:-translate-y-0.5 hover:bg-smoke disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Find My Matches →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
