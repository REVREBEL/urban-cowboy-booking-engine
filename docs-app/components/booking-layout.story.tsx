"use client";

import { StepLayout } from "../../src/components/booking/layout/step-layout";
import { StepProgress } from "../../src/components/booking/layout/step-progress";
import { BookingProvider } from "../../src/state/booking";
import { ProgressBar } from "../../src/components/booking/progress/ProgressBar";
import { ProgressStep, ProgressStepper } from "../../src/components/booking/progress/ProgressStep";
import { defineStory } from "../lib/story";

function LayoutDemo() {
  return (
    <div className="w-full">
      <BookingProvider>
        <StepLayout
          title="Select Accommodations"
          subtitle="Choose your room at Urban Cowboy Catskills"
          backLabel="Back to dates"
          onBack={() => {}}
        >
          <div className="rounded-lg border border-border p-8">Docs-only step content</div>
        </StepLayout>
      </BookingProvider>
    </div>
  );
}

export const stepLayoutStory = defineStory({
  Component: LayoutDemo,
  args: { initial: {} },
});

export const stepProgressStory = defineStory({
  Component: StepProgress,
  args: {
    initial: {
      steps: [
        { key: "dates", label: "Dates" },
        { key: "results", label: "Rooms" },
        { key: "guest", label: "Details" },
      ],
      currentKey: "results",
    },
  },
});

export const progressBarStory = defineStory({
  Component: ProgressBar,
  args: {
    initial: {
      currentStep: 2,
      steps: [
        { step: 1, label: "Stay" },
        { step: 2, label: "Room" },
        { step: 3, label: "Details" },
      ],
    },
  },
});

function ProgressStepStates() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <div className="space-y-2 rounded-xl border border-border p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Individual states</p>
        <div className="flex flex-wrap gap-3">
          <ProgressStep step={1} label="Stay" state="complete" />
          <ProgressStep step={2} label="Room" state="current" />
          <ProgressStep step={3} label="Details" state="default" />
          <ProgressStep step={4} label="Paid" state="complete" showCheckOnComplete />
          <ProgressStep step={5} label="Loading" state="current" isLoading />
          <ProgressStep step={6} label="Disabled" state="default" disabled />
        </div>
      </div>
      <div className="space-y-2 rounded-xl border border-border p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Stepper</p>
        <ProgressStepper
          currentStep={2}
          showCheckOnComplete
          steps={[
            { step: 1, label: "Stay" },
            { step: 2, label: "Room" },
            { step: 3, label: "Extras" },
            { step: 4, label: "Checkout" },
          ]}
        />
      </div>
    </div>
  );
}

export const progressStepStatesStory = defineStory({
  Component: ProgressStepStates,
  args: { initial: {} },
});
