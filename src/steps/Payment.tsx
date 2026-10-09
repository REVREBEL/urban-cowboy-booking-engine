import { useEffect, useState } from "react";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useBooking } from "../state/booking";
import { ApiError, api, errorMessage } from "../lib/api";
import { money, toPropertyUtc } from "../lib/format";
import { CheckoutStep } from "@/components/booking/summary/CheckoutStep";
import { SecureBadge } from "@/components/dev/data-badge";
import { t } from "../i18n";
import { formatAddOnPreferenceNote } from "@/components/booking/extras/addon-smart-logic";

export function Payment() {
  const {
    hotel,
    selectedRoom,
    selectedRate,
    checkIn,
    checkOut,
    adults,
    children,
    infants,
    voucherCode,
    productIds,
    products,
    selectedProducts,
    addonPreferences,
    selectedAddOnDisplayByProduct,
    guest,
    currency,
    amountDueNow,
    quote,
    quoteLoading,
    quoteError,
    refreshQuote,
    setCreated,
    goTo,
    track,
  } = useBooking();

  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!selectedRoom || !selectedRate) goTo("results");
  }, [selectedRoom, selectedRate, goTo]);

  if (!selectedRoom || !selectedRate) return null;

  const settlementOffset = selectedRate.settlement.offset;
  const zeroSettlementOffset =
    settlementOffset == null ||
    settlementOffset === "" ||
    settlementOffset === "P0M0DT0H0M0S" ||
    settlementOffset === "P0D" ||
    settlementOffset === "PT0S";

  const confirmationChargeRequired =
    selectedRate.settlement.isAutomatic &&
    selectedRate.settlement.trigger === "Confirmation" &&
    zeroSettlementOffset &&
    (quote?.total?.gross ?? 0) > 0;

  const quoteUsable =
    quote?.total?.gross != null &&
    (!confirmationChargeRequired || amountDueNow != null);
  const quoteInvalid = !quoteLoading && quote != null && !quoteUsable;
  const quoteProblem = quoteError || quoteInvalid;
  const onSession = (amountDueNow ?? 0) > 0;

  async function pay() {
    if (!accepted || !selectedRoom || !selectedRate || !quoteUsable) return;

    setSubmitting(true);
    setError(null);
    setUnavailable(false);

    const safeProductIds = productIds.filter((id) => {
      const product = products.find((candidate) => candidate.id === id);
      return (
        !product ||
        !product.property ||
        product.property === selectedRoom.property
      );
    });

    const addOnInstructionLines = selectedProducts.flatMap((product) => {
      const displayId = selectedAddOnDisplayByProduct[product.id];
      const line = displayId
        ? formatAddOnPreferenceNote(product.name, addonPreferences[displayId])
        : null;
      return line ? [line] : [];
    });

    const noteParts = [
      guest.notes.trim(),
      addOnInstructionLines.length
        ? `Add-on requests:\n${addOnInstructionLines
            .map((line) => `- ${line}`)
            .join("\n")}`
        : "",
    ].filter(Boolean);

    try {
      const result = await api.createReservation({
        property: selectedRoom.property ?? undefined,
        customer: {
          email: guest.email.trim(),
          firstName: guest.firstName.trim(),
          lastName: guest.lastName.trim(),
          telephone: guest.telephone.trim() || undefined,
          nationalityCode: guest.nationalityCode || undefined,
          sendMarketingEmails: guest.sendMarketingEmails,
        },
        reservations: [
          {
            roomCategoryId: selectedRoom.roomTypeId,
            startUtc: toPropertyUtc(checkIn),
            endUtc: toPropertyUtc(checkOut),
            rateId: selectedRate.rateId,
            adults,
            children,
            infants,
            productIds: safeProductIds.length ? safeProductIds : undefined,
            voucherCode: voucherCode || undefined,
            notes: noteParts.length ? noteParts.join("\n\n") : undefined,
          },
        ],
        returnUrl: `${window.location.origin}/confirmation`,
      });

      setCreated(result);

      await track("paiement_initie", {
        reservationGroupId: result.id,
        paymentRequestId: result.paymentRequestId ?? null,
      });

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      goTo("confirmation");
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === "exceeding_availability") {
        setUnavailable(true);
      } else {
        setError(errorMessage(caught));
      }
      setSubmitting(false);
    }
  }

  const ctaLabel = submitting
    ? t("payment.processing")
    : quoteLoading || (!quote && !quoteProblem)
      ? t("payment.verifyingPrice")
      : onSession && amountDueNow != null
        ? `Pay ${money(amountDueNow, currency)} & Guarantee Stay`
        : "Confirm & Guarantee Stay";

  return (
    <div className="min-h-screen bg-paper">
      <CheckoutStep
        eyebrow="STEP 5 OF 5 · RESERVATION GUARANTEE"
        title="Review & Guarantee"
        subtitle={
          onSession
            ? t("payment.subtitleOnline")
            : t("payment.subtitleFinalize")
        }
        onBack={() => goTo("extras")}
        backLabel="Back to Curated Add-ons"
      >
        <div className="space-y-5 sm:space-y-6 2xl:space-y-7">
          <div className="rounded-2xl border-2 border-alpine-linen bg-white p-5 shadow-2xs 2xl:rounded-3xl 2xl:p-6">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lake-forest/10 text-lake-forest">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-label text-base font-bold uppercase tracking-wide text-cowboy-umber sm:text-lg">
                  {onSession
                    ? t("payment.methodOnlineTitle")
                    : t("payment.methodArrivalTitle")}
                </h2>
                <p className="mt-1 font-body text-sm leading-6 text-ash-900 sm:text-base">
                  {onSession
                    ? t("payment.methodOnlineDesc")
                    : t("payment.methodArrivalDesc")}
                </p>
              </div>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-alpine-linen bg-white p-5 text-sm leading-6 text-ash-900 shadow-2xs">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 shrink-0 accent-[#9A5636]"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
            />
            <span>
              {t("payment.acceptPrefix")}{" "}
              {hotel?.TermsAndConditionsUrl ? (
                <a
                  href={hotel.TermsAndConditionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-cowboy-umber underline underline-offset-4"
                >
                  {t("payment.termsLink")}
                </a>
              ) : (
                <strong className="text-cowboy-umber">
                  {t("payment.termsLink")}
                </strong>
              )}{" "}
              {t("payment.acceptSuffix")}
            </span>
          </label>

          {unavailable ? (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 text-sm">
              <p className="font-bold text-amber-800">{t("payment.unavailable")}</p>
              <button
                type="button"
                onClick={() => goTo("results")}
                className="mt-3 rounded-full bg-cowboy-umber px-5 py-2.5 font-label text-xs uppercase tracking-wider text-white"
              >
                {t("payment.editSearch")}
              </button>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}

          {quoteProblem ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-sm">
              <p className="font-medium text-red-700">
                {t("payment.quoteUnavailable")}
              </p>
              <button
                type="button"
                onClick={refreshQuote}
                className="font-label text-xs uppercase tracking-wider text-cowboy-umber underline underline-offset-4"
              >
                {t("common.retry")}
              </button>
            </div>
          ) : null}

          <div className="border-t-2 border-alpine-linen pt-4 2xl:pt-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 2xl:mb-6">
              <div className="flex items-center gap-3 text-xs text-ash-900 sm:text-sm">
                <Check className="h-5 w-5 text-lake-forest" aria-hidden="true" />
                <span>{t("payment.reassurance")}</span>
              </div>
              <SecureBadge />
            </div>

            <button
              type="button"
              onClick={pay}
              disabled={
                !accepted ||
                submitting ||
                quoteLoading ||
                quoteProblem ||
                !quoteUsable
              }
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-cowboy-umber py-4 font-label text-sm uppercase tracking-widest text-white shadow-lg transition-all hover:bg-smoke hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-alpine-linen disabled:text-smoke-fade disabled:shadow-none sm:py-5 sm:text-base 2xl:py-6 2xl:text-lg"
            >
              <span>{ctaLabel}</span>
              {!submitting && !quoteLoading ? (
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 2xl:h-6 2xl:w-6" aria-hidden="true" />
              ) : null}
            </button>
          </div>
        </div>
      </CheckoutStep>
    </div>
  );
}
