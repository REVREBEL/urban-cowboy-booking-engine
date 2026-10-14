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
import { PolicyDisplay, type MilestoneDate } from "@/components/rates/policy_display";
import {
  RateOfferSidePanel,
  type OfferCardTheme,
} from "@/components/rates/RateOfferSidePanel";

const label = "font-label text-[11px] uppercase tracking-[0.22em]";

const offerThemeForRate = (rate: ShapedRate): OfferCardTheme => {
  if (rate.isPrivate) return "outfit";
  switch (rate.knownRateGroup) {
    case "PACKAGE":
      return "sunup";
    case "NON_REFUNDABLE":
      return "plan-ahead";
    case "DISCOUNTED_RATES":
    case "PROMOTIONS":
      return "stay-while";
    case "FLEXIBLE":
    default:
      return "ride-easy";
  }
};

const milestoneDate = (
  checkIn: string,
  amount: number | null | undefined,
  unit: "days" | "hours" | null | undefined,
): MilestoneDate | undefined => {
  if (amount == null || !unit || amount < 0) return undefined;
  const days = unit === "days" ? amount : amount / 24;
  if (!Number.isInteger(days)) return undefined;

  const parts = checkIn.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) return undefined;
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return undefined;

  date.setUTCDate(date.getUTCDate() - days);
  return {
    daysPrior: days,
    day: date.getUTCDate(),
    month: date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
  };
};

const pricingForRate = (rate: ShapedRate) => {
  const total = rate.totalGross ?? 0;
  const taxes = rate.totalTax ?? 0;
  const subtotal = Math.max(0, total - taxes);
  const dueToday = rate.settlement.trigger === "Confirmation"
    ? total * (rate.settlement.value ?? 1)
    : 0;

  return {
    nightly: rate.perNightGross ?? total,
    subtotal,
    taxes,
    total,
    dueToday,
    remaining: Math.max(0, total - dueToday),
  };
};

export function PhotoRateStep() {
  const booking = useBooking();
  const [configs, setConfigs] = useState<RateCardConfig[]>([]);
  const [detailsRateId, setDetailsRateId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void api.rateCards().then(cards => { if (active) setConfigs(cards); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!detailsRateId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetailsRateId(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [detailsRateId]);

  const room = booking.selectedRoom;
  if (!room) return null;

  const photo = toPhotoTourRoom(room, booking.imageBaseUrl, photoGalleryForRoom(room.roomTypeId));
  const image = photo.images[photo.images.length > 1 ? 1 : 0];
  const detailsRate = room.rates.find((rate) => rate.rateId === detailsRateId) ?? null;
  const detailsConfig = detailsRate
    ? resolveRateCardConfig(configs, detailsRate.rateId)
    : null;

  const choose = (rate: ShapedRate) => {
    setDetailsRateId(null);
    booking.selectRoomRate(room, rate);
    booking.goTo("extras");
  };

  const detailsPricing = detailsRate ? pricingForRate(detailsRate) : null;

  const detailsPolicy = detailsRate
    ? detailsConfig
      ? cancellationConfirmation(detailsRate, detailsConfig, booking.checkIn)
      : detailsRate.knownRateGroup === "NON_REFUNDABLE"
        ? "Full Prepay Non Refundable"
        : "See rate details for cancellation terms"
    : "";

  const freeCancelDate = detailsConfig
    ? milestoneDate(
        booking.checkIn,
        detailsConfig.cancellationPenaltyWindow,
        detailsConfig.cancellationPenaltyWindowPeriod,
      )
    : undefined;
  const nonRefundableDate = detailsConfig
    ? milestoneDate(
        booking.checkIn,
        detailsConfig.cancellationFullForfeitWindow,
        detailsConfig.cancellationFullForfeitWindowPeriod,
      )
    : undefined;

  return (
    <section className="min-h-dvh bg-smoke pb-16 text-paper" data-photo-rate-step>
      {image && (
        <figure className="relative w-full">
          <img src={image} alt={room.name} className="block h-auto w-full" fetchPriority="high" />
          <div className="absolute inset-0 bg-linear-to-t from-smoke via-smoke/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-5 pb-6 sm:px-8">
            <Button
              type="button"
              onClick={() => booking.goTo("results")}
              variant="transparent"
              colorScheme="paper"
              size="xsmall"
              className="underline underline-offset-4"
              style={{ padding: 0 }}
            >
              ← Change room
            </Button>
            <p className={`${label} mt-4 text-alpine-linen`}>03 — How would you like to stay?</p>
            <h1 className="mt-2 font-heading text-4xl leading-none sm:text-6xl">{room.name}</h1>
          </div>
        </figure>
      )}

      <div className="mx-auto grid max-w-[1600px] gap-4 px-5 py-10 sm:px-8 lg:grid-cols-3">
        {room.rates.map((rate, index) => {
          const config = resolveRateCardConfig(configs, rate.rateId);
          const policy = config
            ? cancellationConfirmation(rate, config, booking.checkIn)
            : rate.knownRateGroup === "NON_REFUNDABLE"
              ? "Full Prepay Non Refundable"
              : "See rate details for cancellation terms";

          return (
            <article
              key={rate.rateId}
              className={`flex flex-col rounded-2xl bg-paper p-6 text-foreground ring-4 transition-shadow ${booking.selectedRate?.rateId === rate.rateId ? "ring-alpine-linen" : "ring-transparent"}`}
            >
              <p className={`${label} text-alpine-linen`}>
                {config?.eyebrow || (rate.isPrivate ? "Exclusive rate" : index === 0 ? "Available rate" : "Stay your way")}
              </p>
              <h2 className="mt-2 font-heading text-3xl leading-none">
                {config?.headline || rate.name}
              </h2>
              {(config?.description || rate.description) && (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                  {config?.description || rate.description}
                </p>
              )}

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
                  <span className="font-heading text-3xl">
                    {money(rate.totalGross, rate.currency)}
                  </span>
                </div>
              </div>

              <p className="mt-4 rounded-lg bg-ash/75 px-3 py-2 text-sm text-foreground/85">
                <strong>Cancellation:</strong> {policy}
              </p>

              <div className="mt-4 grid grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] gap-2">
                <Button
                  type="button"
                  onClick={() => setDetailsRateId(rate.rateId)}
                  variant="outline"
                  colorScheme="cowboy-umber"
                  size="small"
                  className="w-full uppercase tracking-[0.18em]"
                  aria-haspopup="dialog"
                  aria-expanded={detailsRateId === rate.rateId}
                >
                  Details
                </Button>
                <Button
                  type="button"
                  onClick={() => choose(rate)}
                  disabled={rate.totalGross == null}
                  variant="filled"
                  colorScheme="alpine-linen"
                  size="small"
                  className="w-full uppercase tracking-[0.18em]"
                >
                  {booking.selectedRate?.rateId === rate.rateId ? "Selected — continue" : "Choose this rate"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {room.rates.length === 0 && (
        <div className="mx-auto max-w-xl px-5 py-14 text-center">
          <p className="font-heading text-2xl leading-none">
            No rates available for this room on these dates.
          </p>
          <Button
            type="button"
            variant="transparent"
            colorScheme="paper"
            size="xsmall"
            className="mt-4 underline underline-offset-4"
            style={{ padding: 0 }}
            onClick={() => booking.goTo("results")}
          >
            Browse other rooms
          </Button>
        </div>
      )}

      {detailsRate && detailsPricing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-smoke/75 p-4 backdrop-blur-sm sm:p-8"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetailsRateId(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${detailsConfig?.headline || detailsRate.name} rate details`}
            className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[1050px] flex-col overflow-hidden rounded-[28px] shadow-2xl sm:max-h-[calc(100dvh-4rem)]"
          >
            <RateOfferSidePanel
              variant="default"
              theme={offerThemeForRate(detailsRate)}
              cancellationHeader={detailsPolicy}
              nightlyRate={detailsPricing.nightly}
              stayTotal={detailsPricing.subtotal}
              taxesAndFees={detailsPricing.taxes}
              totalStay={detailsPricing.total}
              dueAtBooking={detailsPricing.dueToday}
              remaining={detailsPricing.remaining}
              policyText={detailsRate.description || detailsPolicy}
              policyDisplay={
                freeCancelDate && nonRefundableDate ? (
                  <PolicyDisplay
                    orientation="horizontal"
                    size="compact"
                    initialAmount={money(detailsPricing.dueToday, detailsRate.currency)}
                    remainingAmount={money(detailsPricing.remaining, detailsRate.currency)}
                    freeCancelDate={freeCancelDate}
                    nonRefundableDate={nonRefundableDate}
                    textColor="var(--cowboy-umber--normal, #4e332d)"
                    accentColor="var(--copper--normal, #9a5636)"
                    className="mx-auto shadow-none"
                  />
                ) : (
                  <PolicyDisplay text={detailsRate.description || detailsPolicy} />
                )
              }
              onClose={() => setDetailsRateId(null)}
              onConfirm={() => choose(detailsRate)}
              standalone
            />
          </div>
        </div>
      )}
    </section>
  );
}
