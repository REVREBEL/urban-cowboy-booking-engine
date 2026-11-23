"use client";

import { useState } from "react";
import { StaySummary } from "../../src/components/booking/summary/stay-summary";
import { ReservationSummaryBar } from "../../src/components/ui/ReservationSummaryBar";
import { defineStory } from "../lib/story";

function StaySummaryDemo() {
  return (
    <div className="w-full rounded-xl bg-smoke p-4 sm:p-6">
      <StaySummary
        roomName="Fireplace Studio" rateName="Plan Ahead"
        checkIn="2027-06-20" checkOut="2027-06-23" adults={2}
        nightlyRate={360} currency="USD"
      />
    </div>
  );
}

function SummaryBarDemo() {
  const [last, setLast] = useState("none");
  return (
    <div className="w-full rounded-xl bg-smoke p-4 sm:p-6">
      <ReservationSummaryBar
        roomName="Fireplace Studio" rateTitle="Plan Ahead" nights={3}
        extrasTotal={48} selectedItemCount={1} actionLabel="Continue"
        onAction={() => setLast("continue")}
      />
      <p className="sr-only" role="status">{last}</p>
    </div>
  );
}

export const staySummaryStory = defineStory({
  Component: StaySummaryDemo,
  args: { initial: {} },
});

export const reservationSummaryBarStory = defineStory({
  Component: SummaryBarDemo,
  args: { initial: {} },
});
