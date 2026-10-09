import type { ReactNode } from "react";
import { useBooking, productLineTotal } from "@/state/booking";
import { money } from "@/lib/format";
import { IconCloche, IconCroissant } from "@/components/icons/cowboy-icons";
import { t } from "@/i18n";

// Price breakdown. Included meals remain part of the accommodation rate.
// petit-déjeuner buffet + dîner buffet (inclus). La TAXE DE SÉJOUR est lue directement
// dans le tarif Mews (ligne TVA 0 %, portée par ShapedRate.citySejour) — jamais « en dur »,
// elle s'adapte à chaque hébergement (Hôtel 1,20 € / Créole 1,70 €/adulte/nuit…). Le total
// affiché reste STRICTEMENT celui de Mews (hébergement = tarif − taxe de séjour).
export function StayBreakdown() {
  const {
    selectedRoom,
    selectedRate,
    nightsCount,
    guestsCount,
    selectedProducts,
    roomTotal,
    grandTotal,
    quote,
    currency,
    totalNet,
    totalTax,
    amountDueNow,
    remainingBalance,
  } = useBooking();
  if (!selectedRoom || !selectedRate) return null;

  const isHotel = selectedRoom.property === "hotel";
  const taxe = selectedRate.citySejour ?? 0;

  // A final Mews quote is one pricing source. Never mix quote values with
  // availability/client-calculated values. ProductOrderPrices may contain multiple
  // rows for the same product (for example, age-category pricing), so aggregate them.
  const quotedNetByProduct = new Map<string, number>();
  let allQuotedProductNet = 0;
  let quoteProductsHaveCompleteNet = true;

  for (const row of quote?.productOrderPrices ?? []) {
    if (!row.productId || row.total?.net == null) {
      quoteProductsHaveCompleteNet = false;
      continue;
    }
    allQuotedProductNet += row.total.net;
    quotedNetByProduct.set(
      row.productId,
      (quotedNetByProduct.get(row.productId) ?? 0) + row.total.net,
    );
  }

  const selectedQuotedNet = selectedProducts.reduce(
    (sum, product) => sum + (quotedNetByProduct.get(product.id) ?? 0),
    0,
  );
  const selectedProductsQuoted =
    !!quote &&
    selectedProducts.every((product) => quotedNetByProduct.has(product.id));

  const canItemizeQuote =
    !!quote &&
    totalNet != null &&
    quoteProductsHaveCompleteNet &&
    selectedProductsQuoted;

  const quotedAccommodationNet =
    canItemizeQuote && totalNet != null
      ? Math.max(0, +(totalNet - allQuotedProductNet).toFixed(2))
      : null;

  const otherQuotedChargesNet =
    canItemizeQuote
      ? Math.max(0, +(allQuotedProductNet - selectedQuotedNet).toFixed(2))
      : 0;

  const taxesAndOtherCharges =
    canItemizeQuote
      ? +(otherQuotedChargesNet + (totalTax ?? 0)).toFixed(2)
      : null;

  return (
    <dl className="space-y-1.5 text-sm">
      {quote ? (
        <>
          {canItemizeQuote && quotedAccommodationNet != null ? (
            <>
              <Row
                label={t("breakdown.accommodation", { nights: nightsCount })}
                value={money(quotedAccommodationNet, currency)}
              />
              {selectedProducts.map((p) => (
                <Row
                  key={p.id}
                  label={p.name}
                  value={money(quotedNetByProduct.get(p.id) ?? 0, currency)}
                />
              ))}
              {taxesAndOtherCharges != null && taxesAndOtherCharges > 0 && (
                <Row
                  label={t("breakdown.taxesAndOtherCharges")}
                  value={money(taxesAndOtherCharges, currency)}
                />
              )}
            </>
          ) : (
            <>
              {totalNet != null && (
                <Row label={t("breakdown.subtotal")} value={money(totalNet, currency)} />
              )}
              {totalTax != null && totalTax > 0 && (
                <Row label={t("breakdown.taxes")} value={money(totalTax, currency)} />
              )}
            </>
          )}

          <div className="mt-1.5 border-t border-ink/10 pt-2.5">
            <Row label={t("breakdown.total")} value={money(grandTotal, currency)} strong />
          </div>
        </>
      ) : (
        <>
          <Row
            label={t("breakdown.accommodation", { nights: nightsCount })}
            value={money(Math.max(0, roomTotal - taxe), currency)}
          />
          {isHotel && (
            <>
              <Row
                icon={<IconCroissant className="h-4 w-4" />}
                label={t("breakdown.breakfast", { count: nightsCount })}
                note={t("breakdown.included")}
              />
              <Row
                icon={<IconCloche className="h-4 w-4" />}
                label={t("breakdown.dinner", { count: nightsCount })}
                note={t("breakdown.included")}
              />
            </>
          )}
          {selectedProducts.map((p) => (
            <Row
              key={p.id}
              label={p.name}
              value={money(productLineTotal(p, nightsCount, guestsCount), p.currency)}
            />
          ))}
          {taxe > 0 && <Row label={t("breakdown.cityTax")} value={money(taxe, currency)} />}
          <div className="mt-1.5 border-t border-ink/10 pt-2.5">
            <Row label={t("breakdown.total")} value={money(grandTotal, currency)} strong />
          </div>
        </>
      )}

      {amountDueNow != null && (
        <div className="mt-1.5 border-t border-ink/10 pt-2.5">
          <Row label={t("breakdown.dueNow")} value={money(amountDueNow, currency)} strong />
          {remainingBalance != null && remainingBalance > 0 && (
            <Row label={t("breakdown.remainingBalance")} value={money(remainingBalance, currency)} />
          )}
        </div>
      )}
    </dl>
  );
}
function Row({
  label,
  value,
  note,
  strong,
  icon,
}: {
  label: string;
  value?: string;
  note?: string;
  strong?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={`flex items-center gap-1.5 ${strong ? "font-semibold text-ink" : "text-ink/70"}`}>
        {icon && <span className="shrink-0 text-teal-deep">{icon}</span>}
        <span>{label}</span>
      </dt>
      <dd
        className={`shrink-0 ${value ? "font-number tabular-nums" : "font-label"} ${
          strong
            ? "text-lg text-teal-deep"
            : note
              ? "text-xs font-semibold uppercase tracking-wide text-turquoise"
              : "font-medium text-ink"
        }`}
      >
        {value ?? note}
      </dd>
    </div>
  );
}
