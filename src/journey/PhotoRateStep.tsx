/**
 * Photo Engine rate screen based on original visual-booking-flow RateStep.
 * Unlike the prototype, each offer uses the selected room's Mews ShapedRate;
 * no demo multiplier or assumed tax/cancellation policy is applied.
 */
import { useBooking } from "../state/booking";
import { toPhotoTourRoom } from "../data/photoTourRooms";
import { money } from "../lib/format";
import type { ShapedRate } from "../types/mews";

const label = "font-j-label text-[11px] uppercase tracking-[0.22em]";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-j-ember px-6 py-3 font-j-label text-xs uppercase tracking-[0.2em] text-j-paper transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-paper disabled:opacity-40";

export function PhotoRateStep() {
  const booking = useBooking();
  const room = booking.selectedRoom;
  if (!room) return null;
  const photo = toPhotoTourRoom(room, booking.imageBaseUrl);
  const image = photo.images[photo.images.length > 1 ? 1 : 0];
  const choose = (rate: ShapedRate) => {
    booking.selectRoomRate(room, rate);
    // In the original photo journey, Extras comes before the final review.
    booking.goTo("extras");
  };
  return (
    <section className="min-h-dvh bg-j-night pb-16 text-j-paper" data-photo-rate-step>
      {image && (
        <figure className="relative w-full">
          <img src={image} alt={room.name} className="block h-auto w-full" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-t from-j-night via-j-night/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-5 pb-6 sm:px-8">
            <button type="button" onClick={() => booking.goTo("results")} className="text-sm text-j-paper/80 underline underline-offset-4">← Change room</button>
            <p className={`${label} mt-4 text-j-ember`}>03 — How would you like to stay?</p>
            <h1 className="mt-2 font-j-display text-4xl sm:text-6xl">{room.name}</h1>
          </div>
        </figure>
      )}
      <div className="mx-auto grid max-w-[1600px] gap-4 px-5 py-10 sm:px-8 lg:grid-cols-3">
        {room.rates.map((rate, index) => (
          <article key={rate.rateId} className={`flex flex-col rounded-2xl bg-j-paper p-6 text-j-ink ring-4 ${booking.selectedRate?.rateId === rate.rateId ? "ring-j-ember" : "ring-transparent"}`}>
            <p className={`${label} text-j-ember`}>{rate.isPrivate ? "Exclusive rate" : index === 0 ? "Available rate" : "Stay your way"}</p>
            <h2 className="mt-2 font-j-display text-3xl">{rate.name}</h2>
            {rate.description && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-j-ink/80">{rate.description}</p>}
            <div className="mt-auto border-t border-j-line pt-4 tabular-nums">
              {rate.perNightGross != null && (
                <div className="flex justify-between gap-2 text-sm">
                  <span>{money(rate.perNightGross, rate.currency)} × {booking.nightsCount} nights</span>
                  <span>{rate.totalGross == null ? "—" : money(rate.totalGross, rate.currency)}</span>
                </div>
              )}
              {rate.totalTax != null && (
                <div className="mt-1 flex justify-between gap-2 text-sm text-j-ink/70">
                  <span>Tax included in the displayed total</span>
                  <span>{money(rate.totalTax, rate.currency)}</span>
                </div>
              )}
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <span className="font-bold">Total</span>
                <span className="font-j-display text-3xl">{money(rate.totalGross, rate.currency)}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-j-ink/65">
              Review the rate's deposit and cancellation conditions before completing your reservation.
            </p>
            <button type="button" onClick={() => choose(rate)} disabled={rate.totalGross == null}
              className={`${btnPrimary} mt-4 w-full`}>
              {booking.selectedRate?.rateId === rate.rateId ? "Selected — continue" : "Choose this rate"}
            </button>
          </article>
        ))}
      </div>
      {room.rates.length === 0 && (
        <div className="mx-auto max-w-xl px-5 py-14 text-center">
          <p className="font-j-display text-2xl">No rates available for this room on these dates.</p>
          <button type="button" className="mt-4 underline underline-offset-4" onClick={() => booking.goTo("results")}>Browse other rooms</button>
        </div>
      )}
    </section>
  );
}
