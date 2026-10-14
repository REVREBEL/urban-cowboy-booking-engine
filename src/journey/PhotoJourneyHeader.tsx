/**
 * Original visual-booking-flow Photo Journey header/progress architecture.
 * This chrome belongs to the whole Photo experience, never to the Card engine.
 */
import { ChevronLeft } from "lucide-react";
import { useBooking, type Step } from "../state/booking";
import { resetPhotoJourney } from "./photoSession";
import "../styles/room-photo-tour.css";

const stages: { label: string; target: Step }[] = [
  { label: "Dates", target: "dates" },
  { label: "Room", target: "results" },
  { label: "Rate", target: "rates" },
  { label: "Extras", target: "extras" },
  { label: "Review", target: "guest" },
];

const stageIndex = (step: Step): number =>
  step === "dates" ? 0 :
  step === "results" ? 1 :
  step === "rates" ? 2 :
  step === "extras" || step === "upgrade" ? 3 : 4;

const label = "font-j-label text-[11px] uppercase tracking-[0.22em]";

export function PhotoJourneyHeader() {
  const booking = useBooking();
  if (booking.step === "confirmation") return null;
  const index = stageIndex(booking.step);
  const previous: Record<Step, Step> = {
    dates: "dates",
    results: "dates",
    rates: "results",
    extras: "rates",
    guest: "extras",
    upgrade: "rates",
    payment: "guest",
    confirmation: "dates",
  };
  const goHome = () => {
    const url = new URL(window.location.href);
    resetPhotoJourney();
    url.searchParams.delete("photoPath");
    window.history.replaceState(null, "", url);
    booking.resetAll();
  };
  return (
    <header className="j-journey-header fixed inset-x-0 top-0 z-40 text-j-paper" data-photo-journey-header>
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex shrink-0 items-center gap-3">
          {index > 0 && (
            <button type="button" onClick={() => booking.goTo(previous[booking.step])}
              className={`${label} flex items-center gap-1 text-j-paper/80 transition hover:text-j-paper`}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
          )}
          <button type="button" className={`${label} text-j-paper/80 hover:text-j-paper`} onClick={goHome}>
            Urban Cowboy · Catskills
          </button>
        </div>
        <nav aria-label="Booking progress" className="hidden md:block">
          <ol className="flex items-center gap-5">
            {stages.map((stage, i) => (
              <li key={stage.target}>
                <button type="button"
                  disabled={i > index}
                  onClick={() => i < index && booking.goTo(stage.target)}
                  aria-current={i === index ? "step" : undefined}
                  className={`${label} ${i === index ? "text-j-paper" : i < index ? "text-j-paper/70 hover:text-j-paper" : "text-j-paper/35"}`}>
                  <span className="tabular-nums">0{i + 1}</span> {stage.label}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <p className={`${label} shrink-0 text-j-paper/80 tabular-nums`}>
          {booking.nightsCount > 0
            ? `${booking.nightsCount} night${booking.nightsCount !== 1 ? "s" : ""} · ${booking.adults + booking.children} guest${booking.adults + booking.children !== 1 ? "s" : ""}`
            : "Photo journey"}
        </p>
      </div>
    </header>
  );
}
