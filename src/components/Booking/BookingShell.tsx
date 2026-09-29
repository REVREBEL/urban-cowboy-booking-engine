import { Link } from "@tanstack/react-router";
import { Check, Phone } from "lucide-react";
import type { ReactNode } from "react";

import { BRAND } from "@/lib/booking/cowboy";
import { cn } from "@/lib/utils";

export type BookingStep = "stay" | "room" | "details" | "extras" | "pay" | "confirmation";

const STEPS = [
  { id: "stay", label: "Stay", to: "/" as const },
  { id: "room", label: "Room", to: "/room" as const },
  { id: "details", label: "Details", to: "/details" as const },
  { id: "extras", label: "Extras", to: "/extras" as const },
  { id: "pay", label: "Pay", to: "/pay" as const },
];

export function BookingShell({
  current,
  children,
}: {
  current: BookingStep;
  children: ReactNode;
}) {
  const currentIndex =
    current === "confirmation" ? STEPS.length : STEPS.findIndex((step) => step.id === current);

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-ink/5 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link to="/" aria-label="Urban Cowboy home" className="block">
            <img
              src={BRAND.wordmarkForest}
              alt="Urban Cowboy"
              className="h-7 w-auto object-contain"
            />
          </Link>
          <p className="flex items-center gap-2 text-sm text-accent">
            <img src={BRAND.star} alt="" aria-hidden="true" className="size-4" />
            <span className="eyebrow text-[11px]">Best price guaranteed, direct</span>
          </p>
        </div>

        <div className="border-t border-ink/5">
          <ol className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-1 gap-y-2 px-5 py-2.5 text-[11px]">
            {STEPS.map((step, index) => {
              const done = index < currentIndex;
              const active = index === currentIndex;
              const content = (
                <span
                  className={cn(
                    "eyebrow flex items-center gap-2 rounded-full px-3 py-1 transition-colors",
                    active && "bg-accent text-accent-foreground",
                    done && "text-foreground",
                    !active && !done && "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full border text-[9px]",
                      active ? "border-accent-foreground/60" : "border-border",
                    )}
                  >
                    {done ? <Check className="size-2.5" /> : index + 1}
                  </span>
                  {step.label}
                </span>
              );
              return (
                <li key={step.id} className="flex items-center gap-1">
                  {done || active ? <Link to={step.to}>{content}</Link> : content}
                  {index < STEPS.length - 1 && (
                    <span aria-hidden="true" className="text-border">
                      /
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-ink">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-end md:justify-between">
          <img
            src={BRAND.logoLinen}
            alt="Urban Cowboy"
            className="h-28 w-auto object-contain"
          />
          <div className="max-w-sm space-y-2 text-sm text-background/70">
            <p>Catskills, Nashville and beyond.</p>
            <p>Book direct for the best rate we offer.</p>
            <p className="flex flex-wrap gap-x-5 gap-y-1 pt-2 text-background/50">
              <a href="/privacy" className="hover:text-background">
                Privacy
              </a>
              <a href="/terms" className="hover:text-background">
                Terms
              </a>
              <a href="tel:+18455551871" className="hover:text-background">
                +1 (845) 555-1871
              </a>
            </p>
          </div>
        </div>
      </footer>

      <a
        href="tel:+18455551871"
        aria-label="Help and contact"
        className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-copper text-background shadow-[0_24px_60px_-20px_rgb(6_26_45_/_0.38),0_0_0_1px_rgb(0_0_0_/_0.05)] transition-transform hover:scale-105 active:scale-95"
      >
        <Phone className="size-5" />
      </a>
    </div>
  );
}
