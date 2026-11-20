"use client";

import { useState } from "react";
import EmptyState from "../../src/components/feedback/empty-state";
import ErrorState from "../../src/components/feedback/error-state";
import LoadingState from "../../src/components/feedback/loading-state";
import { defineStory } from "../lib/story";

const imageBaseUrl = process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? "";

export const emptyStateStory = defineStory({
  Component: EmptyState,
  args: {
    initial: {
      heading: "Nothing available for these dates",
      body: "Try different dates or adjust your guest count.",
      imageBaseUrl,
    },
  },
});

function EmptyWithAction() {
  const [clicked, setClicked] = useState(false);
  return (
    <div className="w-full">
      <EmptyState
        heading="No matching rooms found"
        body="We couldn’t find any rooms matching all selected filters."
        action={{ label: "Reset Filters", onClick: () => setClicked(true) }}
        imageBaseUrl={imageBaseUrl}
      />
      <p className="sr-only" role="status">{clicked ? "Filters reset" : "No action"}</p>
    </div>
  );
}

export const emptyStateWithActionStory = defineStory({
  Component: EmptyWithAction,
  args: { initial: {} },
});

function ErrorWithRetry() {
  const [retries, setRetries] = useState(0);
  return (
    <div className="w-full">
      <ErrorState message="Unable to load live rates. Please try again." onRetry={() => setRetries((n) => n + 1)} />
      <p className="sr-only" role="status">Retries: {retries}</p>
    </div>
  );
}

export const errorStateStory = defineStory({
  Component: ErrorState,
  args: { initial: { message: "Something went wrong. Please try again." } },
});

export const errorStateWithRetryStory = defineStory({
  Component: ErrorWithRetry,
  args: { initial: {} },
});

export const loadingStateStory = defineStory({
  Component: LoadingState,
  args: { initial: { message: "Finding your stay…" } },
});

function LoadingMessages() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-border p-4">
        <LoadingState message="Finding your stay…" />
      </div>
      <div className="rounded-xl border border-border p-4">
        <LoadingState message="Checking live rate availability…" />
      </div>
    </div>
  );
}

export const loadingMessagesStory = defineStory({
  Component: LoadingMessages,
  args: { initial: {} },
});
