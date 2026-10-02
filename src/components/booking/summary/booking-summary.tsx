import { productLineTotal, useBooking } from "@/state/booking";
import { money, fmtDate } from "@/lib/format";
import { chargingLabel, spaceLabel } from "@/lib/shaping";
import { SavingsLine } from "@/components/booking/conversion";
import { IconBed, IconCalendar, IconCheck, IconLock, IconUsers } from "@/components/icons/cowboy-icons";
import { t } from "@/i18n";

// Récapitulatif sticky : hébergement, tarif, dates, occupants, extras, total.
export function BookingSummary() {
  const {
    selectedRoom,
    selectedRate,
    checkIn,
    checkOut,
    nightsCount,
    adults,
    children,
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
      .filter((p) => p.productId)
      .map((p) => [p.productId as string, p.total] as const),
  );
  const quotedSelectedProductsGross = selectedProducts.reduce(
    (sum, product) => sum + (quotedProducts.get(product.id)?.gross ?? 0),
    0,
  );
  const accommodationGross =
    quote?.total?.gross != null
      ? Math.max(0, +(quote.total.gross - quotedSelectedProductsGross).toFixed(2))
      : roomTotal;
  const displayedProductsTotal =
    quote
      ? quotedSelectedProductsGross
      : productsTotal;

  return (
    <aside className="card overflow-hidden">
      <div className="bg-teal-deep px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-creole-soft">{t("summary.yourStay")}</p>
        <p className="mt-0.5 font-display text-lg text-cream">
          {selectedRoom ? selectedRoom.name : t("summary.toCompose")}
        </p>
      </div>

      <div className="space-y-3 px-5 py-4 text-sm">
        {selectedRoom && (
          <Row icon={<IconBed className="h-4 w-4" />} label={spaceLabel(selectedRoom.roomClass)}>
            {selectedRate?.name ?? "—"}
          </Row>
        )}
        <Row icon={<IconCalendar className="h-4 w-4" />} label={t("summary.stay")}>
          {checkIn && checkOut ? (
            <span className="font-number">
              {fmtDate(checkIn)} → {fmtDate(checkOut)}
              <span className="text-ink/50">
                {" "}
                · {t("summary.nights", { count: nightsCount })}
              </span>
            </span>
          ) : (
            "—"
          )}
        </Row>
        <Row icon={<IconUsers className="h-4 w-4" />} label={t("summary.travelers")}>
          <span className="font-number">{t("summary.guests", { adults, children })}</span>
        </Row>
      </div>

      <div className="border-t border-ink/10 px-5 py-4 text-sm">
        {selectedRate && (
          <Line label={t("summary.accommodation", { count: nightsCount })} value={money(accommodationGross, currency)} />
        )}
        {selectedProducts.map((p) => (
          <Line
            key={p.id}
            label={
              <>
                {p.name}
                {chargingLabel(p.chargingMode) ? (
                  <span className="text-ink/45"> · {chargingLabel(p.chargingMode)}</span>
                ) : null}
              </>
            }
            value={money(
              quote
                ? quotedProducts.get(p.id)?.gross ?? null
                : productLineTotal(p, nightsCount, guestsCount),
              quotedProducts.get(p.id)?.currency ?? p.currency,
            )}
          />
        ))}
        {!selectedRate && !selectedProducts.length && (
          <p className="text-ink/50">{t("summary.selectPrompt")}</p>
        )}
      </div>

      <div className="flex items-end justify-between border-t border-ink/10 bg-cream/60 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-deep/70">{t("summary.total")}</p>
          <p className="text-[11px] text-ink/50">
            {quoteLoading
              ? t("summary.verifyingTotal")
              : quoteError
                ? t("summary.estimatedTotal")
                : t("summary.taxesIncluded")}
            {displayedProductsTotal > 0
              ? t("summary.extrasNote", { amount: money(displayedProductsTotal, currency) })
              : ""}
          </p>
        </div>
        <p className="font-number text-2xl text-teal-deep">{grandTotal > 0 ? money(grandTotal, currency) : "—"}</p>
      </div>

      {amountDueNow != null && grandTotal > 0 && (
        <div className="space-y-1.5 border-t border-ink/10 px-5 py-3 text-sm">
          <Line label={t("summary.dueNow")} value={money(amountDueNow, currency)} />
          {remainingBalance != null && remainingBalance > 0 && (
            <Line label={t("summary.remainingBalance")} value={money(remainingBalance, currency)} />
          )}
        </div>
      )}

      {savings > 0 && (
        <div className="border-t border-ink/10 px-5 py-2.5">
          <SavingsLine amount={savings} currency={currency} />
        </div>
      )}

      <ul className="space-y-1.5 border-t border-ink/10 px-5 py-4 text-xs text-ink/60">
        <li className="inline-flex items-center gap-2">
          <IconCheck className="h-3.5 w-3.5 text-emerald-600" /> {t("summary.noFees")}
        </li>
        <li className="inline-flex items-center gap-2">
          <IconLock className="h-3.5 w-3.5 text-turquoise" /> {t("summary.securePayment")}
        </li>
      </ul>
    </aside>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-turquoise">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-deep/60">{label}</p>
        <p className="text-ink">{children}</p>
      </div>
    </div>
  );
}

function Line({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-ink/75">{label}</span>
      <span className="shrink-0 font-number font-semibold text-ink">{value}</span>
    </div>
  );
}
