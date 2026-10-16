/**
 * Original visual-booking-flow Photo Journey header/progress architecture.
 * This chrome belongs to the whole Photo experience, never to the Card engine.
 */
import { useBooking, type Step } from "../state/booking";
import { Button } from "../components/ui/Button";
import { PhotoTourArrow } from "./PhotoTourArrow";
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

const label = "font-label text-[11px] uppercase tracking-[0.22em]";

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

  return (
    <header className="j-journey-header fixed inset-x-0 top-0 z-40 text-paper" data-photo-journey-header>
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex w-20 shrink-0 items-center gap-3">
          {index > 0 && (
            <Button type="button" variant="transparent" colorScheme="paper" size="xsmall" style={{padding: 0, fontSize: "11px", fontWeight: 400}} onClick={() => booking.goTo(previous[booking.step])}
              className={`${label} j-journey-back flex items-center gap-2 text-paper/80 transition hover:text-paper`}>
              <span className="j-journey-back-icon" aria-hidden="true">
                <PhotoTourArrow direction="left" size={16} />
              </span>
              Back
            </Button>
          )}

        </div>
        <nav aria-label="Booking progress" className="hidden md:block">
          <ol className="flex items-center gap-5">
            {stages.map((stage, i) => (
              <li key={stage.target}>
                <Button type="button"
                  disabled={i > index}
                  variant="transparent" colorScheme="paper" size="xsmall"
                  style={{padding: 0, fontSize: "11px", fontWeight: i === index ? 700 : 400, opacity: i === index ? 1 : i < index ? 0.75 : 0.35}}
                  onClick={() => i < index && booking.goTo(stage.target)}
                  aria-current={i === index ? "step" : undefined}
                  className={`${label} ${i === index ? "text-paper" : i < index ? "text-paper/70 hover:text-paper" : "text-paper/35"}`}>
                  <span className="tabular-nums">0{i + 1}</span> {stage.label}
                </Button>
              </li>
            ))}
          </ol>
        </nav>
        <p className={`${label} shrink-0 text-paper/80 tabular-nums`}>
          {booking.nightsCount > 0
            ? `${booking.nightsCount} night${booking.nightsCount !== 1 ? "s" : ""} · ${booking.adults + booking.children} guest${booking.adults + booking.children !== 1 ? "s" : ""}`
            : "Photo journey"}
        </p>
      </div>
    </header>
  );
}
