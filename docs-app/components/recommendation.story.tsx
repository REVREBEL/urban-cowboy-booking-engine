"use client";

import { HelpMeChooseModal } from "../../src/components/booking/discovery/HelpMeChooseModal";
import { MatchOrBrowseScreen } from "../../src/components/booking/discovery/MatchOrBrowseScreen";
import { RoomMatcherPage } from "../../src/components/booking/discovery/RoomMatcherPage";
import { MatcherProgress } from "../../src/components/booking/discovery/RoomMatcherProgress";
import { MatchBenefitsCard } from "../../src/components/booking/results/MatchBenefitsCard";
import type { RecommendationPreferences } from "../../src/types/find-your-stay";
import { defineStory } from "../lib/story";

const imageBaseUrl = process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? "";

export const helpMeChooseModalStory = defineStory({
  Component: HelpMeChooseModal,
  args: {
    initial: {
      isOpen: true,
      onClose: () => {},
      onSubmit: (_preferences: RecommendationPreferences) => {},
    },
  },
});

export const matchOrBrowseStory = defineStory({
  Component: MatchOrBrowseScreen,
  args: {
    initial: {
      criteria: {
        checkIn: "2026-11-12",
        checkOut: "2026-11-15",
        guests: 2,
        nights: 3,
        property: "catskills",
        rooms: 1,
      },
      availableCount: 12,
      onFindYourStay: () => {},
      onShowAllRooms: () => {},
      onChangeDates: () => {},
    },
  },
});

export const roomMatcherPageStory = defineStory({
  Component: RoomMatcherPage,
  args: {
    initial: { onBack: () => {}, onSubmit: (_preferences: RecommendationPreferences) => {}, imageBaseUrl },
  },
});

function ProgressSteps() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {([1, 2, 3] as const).map((step) => (
        <div key={step} className="space-y-2 rounded-xl border border-border p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Step {step}</p>
          <MatcherProgress step={step} />
        </div>
      ))}
    </div>
  );
}

export const matcherProgressStory = defineStory({
  Component: MatcherProgress,
  args: { initial: { step: 2 } },
});

export const matcherProgressStepsStory = defineStory({
  Component: ProgressSteps,
  args: { initial: {} },
});

export const matchBenefitsCardStory = defineStory({
  Component: MatchBenefitsCard,
  args: {
    initial: {
      room: {
        name: "Alpine Bathing Suite",
        headline: "Private soaking tub with forest views",
        blurb: "A quiet hideaway built for long soaks and slow mornings.",
        features: [{ label: "Clawfoot soaking tub" }, { label: "Forest views" }],
      },
      reasons: ["Private soaking tub", "A tucked-away forest setting"],
      imageBaseUrl,
    },
  },
});

function BenefitsVariants() {
  const room = {
    name: "Alpine Bathing Suite",
    headline: "Private soaking tub with forest views",
    blurb: "A quiet hideaway built for long soaks and slow mornings.",
    features: [{ label: "Clawfoot soaking tub" }, { label: "Forest views" }],
  };
  return (
    <div className="grid w-full gap-4 lg:grid-cols-2">
      <MatchBenefitsCard room={room} reasons={["Private soaking tub", "Forest setting"]} imageBaseUrl={imageBaseUrl} />
      <MatchBenefitsCard
        room={room}
        reasons={["Private soaking tub", "Forest setting"]}
        compact
        showActions={false}
        intro="A calm match for your stay."
        reasonHeadings={["Why it fits", "What you get"]}
        imageBaseUrl={imageBaseUrl}
      />
    </div>
  );
}

export const matchBenefitsVariantsStory = defineStory({
  Component: BenefitsVariants,
  args: { initial: {} },
});
