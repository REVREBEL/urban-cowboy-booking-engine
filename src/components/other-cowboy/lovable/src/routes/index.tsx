import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { BookingShell } from "@/components/booking/BookingShell";
import { SearchBar } from "@/components/booking/SearchBar";
import { INTERESTS } from "@/lib/booking/cowboy";
import { useBooking } from "@/lib/booking/store";

const title = "Book your stay — Urban Cowboy Catskills";
const description =
  "Arrive as strangers, leave as friends. Pick your dates, then tell us what matters and we'll point you to the right room at Urban Cowboy.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StayStep,
});

function StayStep() {
  const { setPreferences, setHelpOpen } = useBooking();
  const navigate = useNavigate();
  const [promo, setPromo] = useState("");

  return (
    <BookingShell current="stay">
      <div className="mx-auto flex w-full max-w-5xl flex-col justify-center px-5 pb-20 pt-16 md:min-h-[calc(100vh-19rem)] md:pt-20">
        <h1 className="font-display text-5xl leading-none text-foreground md:text-6xl">
          Book your stay
        </h1>
        <p className="mt-4 text-xl text-ink/70">Arrive as Strangers. Leave as Friends.</p>

        <div className="mt-10">
          <SearchBar
            promo={promo}
            onPromoChange={setPromo}
            onSearch={() => {
              setHelpOpen(false);
              navigate({ to: "/room" });
            }}
          />
        </div>

        <div className="mt-20">
          <p className="eyebrow text-xs text-muted-foreground">
            Or start with what you're here for
          </p>
          <div className="mt-8 grid gap-12 md:grid-cols-3">
            {INTERESTS.map((interest) => (
              <button
                key={interest.id}
                type="button"
                onClick={() => {
                  setPreferences(interest.preferences);
                  setHelpOpen(true);
                  navigate({ to: "/room" });
                }}
                className="group flex flex-col items-start px-1 text-left transition-transform hover:-translate-y-1"
              >
                <span className="flex size-[88px] items-center justify-center">
                  <img
                    src={interest.icon}
                    alt=""
                    aria-hidden="true"
                    className="max-h-[70px] w-auto object-contain"
                  />
                </span>
                <span className="font-brand mt-4 text-base text-accent group-hover:text-copper">
                  {interest.title}
                </span>
                <span className="mt-3 max-w-[18rem] text-xs leading-[1.9] text-accent/90">
                  {interest.copy}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </BookingShell>
  );
}
