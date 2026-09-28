import type { ReactNode } from "react";
import { useBooking, productLineTotal } from "../state/booking";
import { money } from "../lib/format";
import { IconCloche, IconCroissant } from "./icons";
import { t } from "../i18n";

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

  const quotedProducts = new Map(
    (quote?.productOrderPrices ?? [])
      .filter((p) => p.productId)
      .map((p) => [p.productId as string, p.total] as const),
  );
  const quotedProductNet = selectedProducts.reduce(
    (sum, product) => sum + (quotedProducts.get(product.id)?.net ?? 0),
    0,
  );

  const accommodation =
    quote && totalNet != null
      ? Math.max(0, +(totalNet - quotedProductNet).toFixed(2))
      : Math.max(0, roomTotal - taxe);

  return (
    <dl className="space-y-1.5 text-sm">
      <Row label={t("breakdown.accommodation", { nights: nightsCount })} value={money(accommodation, currency)} />
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
      {selectedProducts.map((p) => {
        const quoted = quotedProducts.get(p.id);
        const value =
          quoted?.net ??
          productLineTotal(p, nightsCount, guestsCount);
        return <Row key={p.id} label={p.name} value={money(value, currency)} />;
      })}
      {quote
        ? totalTax != null && totalTax > 0 && (
            <Row label={t("breakdown.taxes")} value={money(totalTax, currency)} />
          )
        : taxe > 0 && <Row label={t("breakdown.cityTax")} value={money(taxe, currency)} />}
      <div className="mt-1.5 border-t border-ink/10 pt-2.5">
        <Row label={t("breakdown.total")} value={money(grandTotal, currency)} strong />
      </div>
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
        className={`shrink-0 tabular-nums ${
          strong
            ? "font-display text-lg text-teal-deep"
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
