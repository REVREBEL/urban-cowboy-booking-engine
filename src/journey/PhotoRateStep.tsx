/**
 * Photo Engine rate screen based on original visual-booking-flow RateStep.
 * Unlike the prototype, each offer uses the selected room's Mews ShapedRate;
 * no demo multiplier or assumed tax/cancellation policy is applied.
 */
import { useEffect, useState } from "react";
import { useBooking } from "../state/booking";
import { api } from "../lib/api";
import { resolveRateCardConfig } from "../lib/rateCardConfig";
import { cancellationConfirmation } from "../lib/rateCardLiveContent";
import type { RateCardConfig } from "@/types/rate-card";
import { toPhotoTourRoom } from "@/data/photoTourRooms";
import { photoGalleryForRoom } from "@/data/photoGalleries";
import { money } from "../lib/format";
import type { ShapedRate } from "../types/mews";
import { Button } from "@/components/ui/button";

const label = "font-label text-[11px] uppercase tracking-[0.22em]";

export function PhotoRateStep() {
  const booking = useBooking();
  const [configs, setConfigs] = useState<RateCardConfig[]>([]);
  useEffect(() => {
    let active = true;
    void api.rateCards().then(cards => { if (active) setConfigs(cards); });
    return () => { active = false; };
  }, []);
  const room = booking.selectedRoom;
  if (!room) return null;
  const photo = toPhotoTourRoom(room, booking.imageBaseUrl, photoGalleryForRoom(room.roomTypeId));
  const image = photo.images[photo.images.length > 1 ? 1 : 0];
  const choose = (rate: ShapedRate) => {
    booking.selectRoomRate(room, rate);
    // In the original photo journey, Extras comes before the final review.
    booking.goTo("extras");
  };
  return (
    <section className="min-h-dvh bg-smoke pb-16 text-paper" data-photo-rate-step>
      {image && (
        <figure className="relative w-full">
          <img src={image} alt={room.name} className="block h-auto w-full" fetchPriority="high" />
          <div className="absolute inset-0 bg-linear-to-t from-smoke via-smoke/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-5 pb-6 sm:px-8">
            <Button type="button" onClick={() => booking.goTo("results")} variant="transparent" colorScheme="paper" size="xsmall" className="underline underline-offset-4" style={{padding:0}}>← Change room</Button>
            <p className={`${label} mt-4 text-alpine-linen`}>03 — How would you like to stay?</p>
            <h1 className="mt-2 font-heading text-4xl leading-none sm:text-6xl">{room.name}</h1>
          </div>
        </figure>
      )}
      <div className="mx-auto grid max-w-[1600px] gap-4 px-5 py-10 sm:px-8 lg:grid-cols-3">
        {room.rates.map((rate, index) => {
          const config = resolveRateCardConfig(configs, rate.rateId);
          const policy = config ? cancellationConfirmation(rate, config, booking.checkIn) :
            rate.knownRateGroup === "NON_REFUNDABLE" ? "Full Prepay Non Refundable" :
            "See rate details for cancellation terms";
          return <article key={rate.rateId} className={`flex flex-col rounded-2xl bg-paper p-6 text-foreground ring-4 ${booking.selectedRate?.rateId === rate.rateId ? "ring-alpine-linen" : "ring-transparent"}`}>
            <p className={`${label} text-alpine-linen`}>{config?.eyebrow || (rate.isPrivate ? "Exclusive rate" : index === 0 ? "Available rate" : "Stay your way")}</p>
            <h2 className="mt-2 font-heading text-3xl leading-none">{config?.headline || rate.name}</h2>
            {(config?.description || rate.description) && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/80">{config?.description || rate.description}</p>}
            <div className="mt-auto border-t border-ash pt-4 tabular-nums">
              {rate.perNightGross != null && (
                <div className="flex justify-between gap-2 text-sm">
                  <span>{money(rate.perNightGross, rate.currency)} × {booking.nightsCount} nights</span>
                  <span>{rate.totalGross == null ? "—" : money(rate.totalGross, rate.currency)}</span>
                </div>
              )}
              {rate.totalTax != null && (
                <div className="mt-1 flex justify-between gap-2 text-sm text-foreground/70">
                  <span>Tax included in the displayed total</span>
                  <span>{money(rate.totalTax, rate.currency)}</span>
                </div>
              )}
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <span className="font-bold">Total</span>
                <span className="font-heading text-3xl">{money(rate.totalGross, rate.currency)}</span>
              </div>
            </div>
            <p className="mt-4 rounded-lg bg-ash/75 px-3 py-2 text-sm text-foreground/85"><strong>Cancellation:</strong> {policy}</p>
            <Button type="button" onClick={() => choose(rate)} disabled={rate.totalGross == null}
              variant="filled" colorScheme="alpine-linen" size="small" className="mt-4 w-full rounded-full uppercase tracking-[0.2em]">
              {booking.selectedRate?.rateId === rate.rateId ? "Selected — continue" : "Choose this rate"}
            </Button>
          </article>;
        })}
      </div>
      {room.rates.length === 0 && (
        <div className="mx-auto max-w-xl px-5 py-14 text-center">
          <p className="font-heading text-2xl leading-none">No rates available for this room on these dates.</p>
          <Button type="button" variant="transparent" colorScheme="paper" size="xsmall" className="mt-4 underline underline-offset-4" style={{padding:0}} onClick={() => booking.goTo("results")}>Browse other rooms</Button>
        </div>
      )}
    </section>
  );
}
