import { useEffect, useState } from "react";
import { useBooking } from "@/state/booking";
import { ApiError, api, errorMessage } from "@/lib/api";
import { money, fmtDate, toUtc } from "@/lib/format";
import { StayBreakdown } from "@/components/booking/summary/stay-breakdown";
import { TrustRow } from "@/components/booking/conversion";
import { SecureBadge } from "@/components/dev/data-badge";
import { t } from "@/i18n";

export function StudioPayment() {
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
    guest,
    currency,
    amountDueNow,
    quote,
    quoteLoading,
    quoteError,
    refreshQuote,
    nightsCount,
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
      return !product || !product.property || product.property === selectedRoom.property;
    });

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
            roomCategoryId: selectedRoom.categoryId,
            startUtc: toUtc(checkIn),
            endUtc: toUtc(checkOut),
            rateId: selectedRate.rateId,
            adults,
            children,
            infants,
            productIds: safeProductIds.length ? safeProductIds : undefined,
            voucherCode: voucherCode || undefined,
            notes: guest.notes.trim() || undefined,
          },
        ],
        returnUrl: window.location.origin + "/confirmation",
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
    } catch (reason) {
      if (reason instanceof ApiError && reason.code === "exceeding_availability") {
        setUnavailable(true);
      } else {
        setError(errorMessage(reason));
      }
      setSubmitting(false);
    }
  }

  return (
    <section className="texture-linen min-h-screen pb-24 pt-10">
      <div className="booking-shell max-w-5xl">
        <button type="button" onClick={() => goTo("extras")} className="mb-7 font-woodblock text-xs uppercase tracking-widest text-[#73716D] hover:text-[#4E332D]">
          ← Back to Extras
        </button>

        <header className="mb-8">
          <p className="font-bianco text-xs font-bold uppercase tracking-[5px] text-[#9A5636]">Almost There</p>
          <h1 className="mt-3 font-desert text-5xl font-bold uppercase leading-none text-[#4E332D] md:text-6xl">Review &amp; Book</h1>
          <p className="mt-4 max-w-2xl font-editorial text-sm text-[#6B6259]">
            One final look at the stay before Mews creates the reservation and, when required, opens secure payment.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-[28px] border-2 border-[#4E332D] bg-[#FAF9F9] p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#4E332D]/15 pb-5">
                <div>
                  <p className="font-bianco text-[10px] font-bold uppercase tracking-[3px] text-[#9A5636]">Your Stay</p>
                  <h2 className="mt-2 font-brothers text-2xl font-bold uppercase leading-none text-[#4E332D]">{selectedRoom.name}</h2>
                  <p className="mt-2 font-editorial text-xs text-[#6B6259]">{selectedRate.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bianco text-[10px] uppercase tracking-wider text-[#73716D]">{nightsCount} night{nightsCount === 1 ? "" : "s"}</p>
                  <p className="font-brothers text-lg text-[#4E332D]">{fmtDate(checkIn)} → {fmtDate(checkOut)}</p>
                </div>
              </div>

              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <Recap label="Traveler" value={(guest.firstName + " " + guest.lastName).trim() || "—"} />
                <Recap label="Email" value={guest.email || "—"} />
                <Recap label="Guests" value={String(adults + children) + (infants ? " + " + infants + " baby" + (infants === 1 ? "" : "ies") : "")} />
                <Recap label="Rate" value={selectedRate.name} />
              </dl>
            </section>

            <section className="rounded-[28px] border-2 border-[#0E301A] bg-[#0E301A] p-6 text-[#FAF9F9] shadow-sm">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#F2AAA9] font-brothers text-lg text-[#F2AAA9]">✓</div>
                <div>
                  <h2 className="font-brothers text-xl font-bold uppercase">Secure Mews Checkout</h2>
                  <p className="mt-2 font-editorial text-xs leading-5 text-[#FAF9F9]/70">
                    {onSession
                      ? "Your selected rate requires an online payment. After the reservation is created, Mews will handle card entry and any required 3DS verification."
                      : "This rate does not require an immediate online charge. The reservation can be confirmed directly when the final quote is usable."}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border-2 border-[#4E332D] bg-[#FAF9F9] p-6">
              <label className="flex cursor-pointer items-start gap-3 font-editorial text-sm leading-6 text-[#4E332D]/80">
                <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 h-4 w-4 accent-[#9A5636]" />
                <span>
                  {t("payment.acceptPrefix")}{" "}
                  {hotel?.TermsAndConditionsUrl ? (
                    <a href={hotel.TermsAndConditionsUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#9A5636] underline underline-offset-2">
                      {t("payment.termsLink")}
                    </a>
                  ) : (
                    <strong>{t("payment.termsLink")}</strong>
                  )}{" "}
                  {t("payment.acceptSuffix")}
                </span>
              </label>

              {unavailable && (
                <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 font-editorial text-sm text-amber-800">
                  {t("payment.unavailable")}
                  <button type="button" onClick={() => goTo("results")} className="ml-3 font-bianco text-xs font-bold uppercase underline">Edit Search</button>
                </div>
              )}

              {error && <p className="mt-5 font-editorial text-sm font-semibold text-[#8C2340]">{error}</p>}

              {quoteProblem && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#8C2340]/30 bg-[#8C2340]/5 p-4">
                  <p className="font-editorial text-sm font-semibold text-[#8C2340]">{t("payment.quoteUnavailable")}</p>
                  <button type="button" onClick={refreshQuote} className="font-bianco text-xs font-bold uppercase text-[#8C2340] underline">Try Again</button>
                </div>
              )}
            </section>

            <div className="rounded-[24px] border border-[#4E332D]/15 bg-[#EBE8E0]/70 p-4">
              <TrustRow compact />
            </div>
          </div>

          <aside className="h-fit rounded-[28px] border-2 border-[#4E332D] bg-[#FAF9F9] p-6 shadow-sm lg:sticky lg:top-28">
            <p className="font-bianco text-[10px] font-bold uppercase tracking-[3px] text-[#9A5636]">Price Detail</p>
            <div className="mt-4">
              <StayBreakdown />
            </div>

            <div className="mt-6 border-t-2 border-[#4E332D] pt-5">
              <div className="flex items-end justify-between gap-3">
                <span className="font-bianco text-[10px] font-bold uppercase tracking-wider text-[#73716D]">
                  {onSession ? "Due Now" : "Booking Total"}
                </span>
                <strong className="font-brothers text-2xl text-[#4E332D]">
                  {onSession && amountDueNow != null ? money(amountDueNow, currency) : quote?.total?.gross != null ? money(quote.total.gross, quote.total.currency) : "Verifying…"}
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={pay}
              disabled={!accepted || submitting || quoteLoading || quoteProblem || !quoteUsable}
              className="mt-6 w-full rounded-full bg-[#9A5636] px-6 py-3.5 font-bianco text-xs font-bold uppercase tracking-[2px] text-[#EBE8E0] transition hover:bg-[#783224] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting
                ? t("payment.processing")
                : quoteLoading || (!quote && !quoteProblem)
                  ? t("payment.verifyingPrice")
                  : onSession && amountDueNow != null
                    ? t("payment.pay") + " " + money(amountDueNow, currency) + " →"
                    : t("payment.confirmBooking") + " →"}
            </button>

            <div className="mt-4 flex justify-center">
              <SecureBadge />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Recap({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#4E332D]/10 pb-3">
      <dt className="font-bianco text-[9px] font-bold uppercase tracking-wider text-[#73716D]">{label}</dt>
      <dd className="mt-1 font-editorial text-sm text-[#4E332D]">{value}</dd>
    </div>
  );
}
