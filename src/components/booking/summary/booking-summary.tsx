import type { ReactNode } from "react";
import { Calendar, Sparkles, Users } from "lucide-react";
import { productLineTotal, useBooking } from "@/state/booking";
import { fmtDate, imgUrl, money } from "@/lib/format";
import { chargingLabel, spaceLabel } from "@/lib/shaping";
import { SavingsLine } from "@/components/booking/conversion";
import { t } from "@/i18n";

export function BookingSummary() {
  const {
    selectedRoom,
    selectedRate,
    imageBaseUrl,
    checkIn,
    checkOut,
    nightsCount,
    adults,
    children,
    infants,
    guestsCount,
    selectedProducts,
    roomTotal,
    productsTotal,
    grandTotal,
    currency,
    amountDueNow,
    remainingBalance,
    quote,
    quoteLoading,
    quoteError,
  } = useBooking();

  const savings =
    selectedRate?.maxGross != null && selectedRate.totalGross != null
      ? Math.max(0, selectedRate.maxGross - selectedRate.totalGross)
      : 0;

  const quotedProducts = new Map(
    (quote?.productOrderPrices ?? [])
      .filter((product) => product.productId)
      .map((product) => [product.productId as string, product.total] as const),
  );

  const quotedSelectedProductsGross = selectedProducts.reduce(
    (sum, product) => sum + (quotedProducts.get(product.id)?.gross ?? 0),
    0,
  );

  const accommodationGross =
    quote?.total?.gross != null
      ? Math.max(0, +(quote.total.gross - quotedSelectedProductsGross).toFixed(2))
      : roomTotal;

  const displayedProductsTotal = quote
    ? quotedSelectedProductsGross
    : productsTotal;

  const roomImage = selectedRoom
    ? imgUrl(imageBaseUrl, selectedRoom.imageIds[0], 900)
    : null;

  const nightly =
    selectedRate?.perNightGross ??
    (nightsCount > 0 && accommodationGross > 0
      ? accommodationGross / nightsCount
      : null);

  const party = [
    adults > 0 ? `${adults} adult${adults === 1 ? "" : "s"}` : "",
    children > 0 ? `${children} child${children === 1 ? "" : "ren"}` : "",
    infants > 0 ? `${infants} infant${infants === 1 ? "" : "s"}` : "",
  ].filter(Boolean).join(" · ");

  return (
    <aside className="space-y-5 rounded-panel-lg border-2 border-cowboy-umber bg-white p-6 shadow-lg sm:p-8 2xl:space-y-6 2xl:rounded-modal-lg 2xl:p-10">
      <div className="space-y-3 border-b border-alpine-linen pb-5 2xl:pb-6">
        <div className="flex items-center justify-between gap-4">
          <span className="font-label text-xs font-bold uppercase tracking-widest text-copper 2xl:text-sm">
            {selectedRoom ? spaceLabel(selectedRoom.roomClass) : t("summary.yourStay")}
          </span>
          {nightsCount > 0 ? (
            <span className="font-mono text-xs text-smoke-fade 2xl:text-sm">
              {nightsCount} {nightsCount === 1 ? "Night" : "Nights"}
            </span>
          ) : null}
        </div>

        {roomImage ? (
          <div className="h-36 overflow-hidden rounded-xl border border-alpine-linen sm:h-44 2xl:h-52 2xl:rounded-2xl">
            <img
              src={roomImage}
              alt={selectedRoom?.name ?? ""}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div>
          <h2 className="font-heading text-2xl font-bold leading-tight text-smoke sm:text-3xl 2xl:text-4xl">
            {selectedRoom?.name ?? t("summary.toCompose")}
          </h2>
          {selectedRate ? (
            <span className="mt-0.5 block font-sans text-xs text-smoke-fade sm:text-sm 2xl:text-base">
              {selectedRate.name}
              {nightly != null ? ` · ${money(nightly, currency)} / night` : ""}
            </span>
          ) : null}
        </div>

        {(checkIn || party) ? (
          <div className="grid gap-2 pt-1 text-xs text-ash-900 sm:grid-cols-2 sm:text-sm">
            {checkIn && checkOut ? (
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-copper" aria-hidden="true" />
                <span>{fmtDate(checkIn)} → {fmtDate(checkOut)}</span>
              </div>
            ) : null}
            {party ? (
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-copper" aria-hidden="true" />
                <span>{party}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-3.5 border-b border-alpine-linen pb-5 font-sans text-xs sm:text-sm 2xl:space-y-4 2xl:pb-6 2xl:text-base">
        {selectedRate ? (
          <Line
            label={
              <>
                {t("summary.accommodation", { count: nightsCount })}
                {nightly != null && nightsCount > 0 ? (
                  <span className="block text-[11px] text-cowboy-umber-100">
                    {money(nightly, currency)} × {nightsCount}
                  </span>
                ) : null}
              </>
            }
            value={money(accommodationGross, currency)}
          />
        ) : null}

        {selectedProducts.length > 0 ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between gap-4 font-bold text-copper">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 2xl:h-4 2xl:w-4" aria-hidden="true" />
                Curated Add-ons
              </span>
              <span>{money(displayedProductsTotal, currency)}</span>
            </div>

            <div className="space-y-2 border-l-2 border-copper/35 pl-3">
              {selectedProducts.map((product) => (
                <Line
                  key={product.id}
                  compact
                  label={
                    <>
                      {product.name}
                      {chargingLabel(product.chargingMode) ? (
                        <span className="block text-[11px] text-cowboy-umber-100">
                          {chargingLabel(product.chargingMode)}
                        </span>
                      ) : null}
                    </>
                  }
                  value={money(
                    quote
                      ? quotedProducts.get(product.id)?.gross ?? null
                      : productLineTotal(product, nightsCount, guestsCount),
                    quotedProducts.get(product.id)?.currency ?? product.currency,
                  )}
                />
              ))}
            </div>
          </div>
        ) : null}

        {!selectedRate && selectedProducts.length === 0 ? (
          <p className="text-smoke-fade">{t("summary.selectPrompt")}</p>
        ) : null}
      </div>

      <div className="flex items-baseline justify-between gap-4 pt-1">
        <div>
          <span className="block font-label text-xs uppercase tracking-wider text-smoke-fade sm:text-sm 2xl:text-base">
            Total Balance
          </span>
          <span className="text-xs text-cowboy-umber-100 2xl:text-sm">
            {quoteLoading
              ? t("summary.verifyingTotal")
              : quoteError
                ? t("summary.estimatedTotal")
                : t("summary.taxesIncluded")}
          </span>
        </div>
        <span className="font-heading text-3xl font-bold text-cowboy-umber sm:text-4xl 2xl:text-5xl">
          {grandTotal > 0 ? money(grandTotal, currency) : "—"}
        </span>
      </div>

      {amountDueNow != null && grandTotal > 0 ? (
        <div className="space-y-2 border-t border-alpine-linen pt-4 text-sm">
          <Line label={t("summary.dueNow")} value={money(amountDueNow, currency)} />
          {remainingBalance != null && remainingBalance > 0 ? (
            <Line
              label={t("summary.remainingBalance")}
              value={money(remainingBalance, currency)}
            />
          ) : null}
        </div>
      ) : null}

      {savings > 0 ? (
        <div className="border-t border-alpine-linen pt-4">
          <SavingsLine amount={savings} currency={currency} />
        </div>
      ) : null}
    </aside>
  );
}

function Line({
  label,
  value,
  compact = false,
}: {
  label: ReactNode;
  value: string;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-start justify-between gap-4",
        compact ? "text-xs sm:text-sm" : "",
      ].join(" ")}
    >
      <span className="min-w-0 text-ash-900">{label}</span>
      <span className="shrink-0 font-number font-bold text-smoke">{value}</span>
    </div>
  );
}
