"use client";

import { useState } from "react";
import type { Step } from "../../src/state/booking";
import { BookingHeader } from "../../src/components/booking/chrome/header";
import { ContactBar } from "../../src/components/booking/chrome/contact-bar";
import { defineStory } from "../lib/story";

const STEPS: Step[] = ["dates", "results", "guest", "extras", "payment"];

function BookingChromeDemo({ start = "dates" }: { start?: Step }) {
  const [step, setStep] = useState<Step>(start);
  const [last, setLast] = useState("none");
  const advance = () => {
    const next = STEPS[(STEPS.indexOf(step) + 1) % STEPS.length];
    setStep(next);
    setLast(next);
  };
  return (
    <div className="w-full">
      <BookingHeader
        step={step}
        onNavigate={(next) => { setStep(next); setLast(next); }}
        onHome={() => setLast("home")}
        canNavigate={(next) => STEPS.indexOf(next) <= STEPS.indexOf(step)}
      />
      <div className="flex flex-wrap items-center gap-3 px-4 py-4">
        <button
          type="button"
          onClick={advance}
          className="rounded-md border border-border px-3 py-2 text-sm"
        >
          Advance step
        </button>
        <span className="text-sm text-muted-foreground">{step}</span>
      </div>
      <ContactBar preview />
      <p className="sr-only" role="status">{`Last action: ${last}`}</p>
    </div>
  );
}

export const bookingChromeDatesStory = defineStory({
  Component: BookingChromeDemo,
  args: { initial: {} },
});

export const bookingChromeResultsStory = defineStory({
  Component: BookingChromeDemo,
  args: { initial: { start: "results" } },
});

export const bookingChromeExtrasStory = defineStory({
  Component: BookingChromeDemo,
  args: { initial: { start: "extras" } },
});
