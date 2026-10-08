import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Calendar, Check, Printer, ShieldCheck, Users } from "lucide-react";
import { useBooking } from "../state/booking";
import { api, errorMessage } from "../lib/api";
import { fmtDate, money } from "../lib/format";
import type { ReservationStatusResult } from "../types/mews";
import { t } from "../i18n";

const MAX_POLLS = 5;
const SHUTTLE_BOOKING_URL = "https://example.com/airport-transfer";

export function Confirmation() {
  const {
    rgid,
    created,
    checkIn,
    checkOut,
    adults,
    children,
    infants,
    guest,
    grandTotal,
    currency,
    selectedRoom,
    selectedRate,
    airportTransfer,
    resetAll,
    goTo,
    track,
  } = useBooking();

  const [status, setStatus] = useState<ReservationStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resuming, setResuming] = useState(false);
  const polls = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groupId = rgid ?? created?.id ?? null;

  const loadStatus = useCallback(
    async (poll = false) => {
      if (!groupId) return;
      if (!poll) setLoading(true);

      try {
        const nextStatus = await api.reservationStatus(groupId);
        setStatus(nextStatus);
        setError(null);

        if (
          !nextStatus.paid &&
          !nextStatus.finalFailure &&
          nextStatus.paymentRequests.length > 0 &&
          polls.current < MAX_POLLS
        ) {
          polls.current += 1;
          timer.current = setTimeout(() => loadStatus(true), 2500);
        }
      } catch (caught) {
        setError(errorMessage(caught));
      } finally {
        setLoading(false);
      }
    },
    [groupId],
  );

  useEffect(() => {
    if (!groupId) {
      goTo("dates");
      return;
    }

    loadStatus();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [groupId, loadStatus, goTo]);

  const paidSent = useRef(false);
  useEffect(() => {
    if (status?.paid && !paidSent.current) {
      paidSent.current = true;
      void track("paiement_valide", {
        reservationGroupId: groupId ?? undefined,
      });
    }
  }, [status?.paid, groupId, track]);

  async function resumePayment() {
    if (!groupId) return;

    setResuming(true);
    try {
      const response = await api.paymentLink(
        groupId,
        `${window.location.origin}/confirmation`,
      );

      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
        return;
      }

      polls.current = 0;
      await loadStatus();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setResuming(false);
    }
  }

  const numbers = (status?.reservations ?? created?.reservations ?? [])
    .map((reservation) => reservation.number)
    .filter(Boolean);

  const hasPayment = (status?.paymentRequests.length ?? 0) > 0;
  const paid = status?.paid ?? false;
  const pending = hasPayment && !paid && !status?.finalFailure;
  const failed = status?.finalFailure ?? false;
  const confirmed = paid || (!hasPayment && Boolean(status));
  const displayTotal =
    grandTotal > 0
      ? money(grandTotal, currency)
      : created?.totalAmount?.gross != null
        ? money(created.totalAmount.gross, created.totalAmount.currency)
        : "—";

  const guestCount = adults + children + infants;

  return (
    <div className="min-h-screen bg-[#FAF9F9]">
      <div className="mx-auto w-full max-w-xl px-4 py-8 sm:max-w-3xl sm:px-6 sm:py-12 lg:max-w-5xl 2xl:max-w-[1360px] 2xl:px-8 2xl:py-16">
        <div className="rounded-[28px] border-2 border-[#4E332D] bg-white p-6 text-center shadow-2xl transition-all sm:rounded-[36px] sm:border-4 sm:p-10 lg:p-12 2xl:rounded-[48px] 2xl:p-16">
          <StatusBadge
            loading={loading}
            confirmed={confirmed}
            pending={pending}
            failed={failed}
          />

          <span className="mb-1 block font-woodblock text-xs font-bold uppercase tracking-[0.2em] text-[#9A5636] sm:text-sm 2xl:mb-2 2xl:text-base">
            {confirmed
              ? "Reservation Confirmed & Guaranteed"
              : pending
                ? "Reservation Created · Payment Pending"
                : failed
                  ? "Reservation Needs Attention"
                  : "Verifying Reservation"}
          </span>

          <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-tight text-[#4E332D] sm:text-4xl lg:text-5xl 2xl:mb-3 2xl:text-6xl">
            {confirmed
              ? "See You in the Catskills"
              : pending
                ? t("confirmation.pendingTitle")
                : failed
                  ? t("confirmation.failedTitle")
                  : t("confirmation.confirmedTitle")}
          </h1>

          <p className="mb-8 font-editorial text-base italic text-[#6B6259] sm:text-lg 2xl:mb-10 2xl:text-xl">
            {confirmed
              ? "Arrive as Strangers. Leave as Friends."
              : pending
                ? t("confirmation.pendingSub")
                : failed
                  ? t("confirmation.failedSub")
                  : t("confirmation.arrivalSub")}
          </p>

          <div className="mb-8 space-y-6 rounded-2xl border-2 border-dashed border-[#D1C9BE] bg-[#FAF9F9] p-6 text-left sm:p-8 2xl:mb-12 2xl:space-y-8 2xl:rounded-3xl 2xl:p-10">
            <div className="flex flex-col items-start justify-between gap-2 border-b border-[#EBE8E0] pb-4 sm:flex-row sm:items-center 2xl:pb-6">
              <div>
                <span className="block font-woodblock text-xs uppercase tracking-wider text-[#73716D] sm:text-sm 2xl:text-base">
                  Confirmation Code{numbers.length === 1 ? "" : "s"}
                </span>
                <span className="font-sans text-xs text-[#8A7E74] 2xl:text-sm">
                  {selectedRate ? `Guaranteed via ${selectedRate.name}` : "Mews reservation"}
                </span>
              </div>
              <span className="font-display text-2xl font-bold tracking-widest text-[#4E332D] sm:text-3xl 2xl:text-4xl">
                {loading
                  ? "VERIFYING"
                  : numbers.length > 0
                    ? numbers.join(" · ")
                    : groupId ?? "—"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 font-sans text-sm sm:grid-cols-2 lg:grid-cols-4 2xl:gap-6 2xl:text-base">
              <FolioSpec label="Primary Guest">
                <strong>{[guest.firstName, guest.lastName].filter(Boolean).join(" ") || "—"}</strong>
                {guest.email ? <span>{guest.email}</span> : null}
              </FolioSpec>

              <FolioSpec label="Stay Dates">
                <strong>
                  {checkIn && checkOut
                    ? `${fmtDate(checkIn)} to ${fmtDate(checkOut)}`
                    : "—"}
                </strong>
                <span className="font-bold text-[#9A5636]">
                  {guestCount} Guest{guestCount === 1 ? "" : "s"}
                </span>
              </FolioSpec>

              <FolioSpec label="Suite">
                <strong>{selectedRoom?.name ?? "Reserved room"}</strong>
                {selectedRoom ? (
                  <span>
                    {selectedRoom.normalBedCount} bed
                    {selectedRoom.normalBedCount === 1 ? "" : "s"} · Max{" "}
                    {selectedRoom.capacity} guests
                  </span>
                ) : null}
              </FolioSpec>

              <FolioSpec label="Rate Package">
                <strong>{selectedRate?.name ?? "Confirmed rate"}</strong>
                {selectedRate?.perNightGross != null ? (
                  <span>{money(selectedRate.perNightGross, selectedRate.currency)} / night</span>
                ) : null}
              </FolioSpec>
            </div>

            <div className="flex flex-col items-start justify-between gap-2 border-t border-[#EBE8E0] pt-4 text-base font-bold text-[#4E332D] sm:flex-row sm:items-center sm:text-lg 2xl:pt-6 2xl:text-xl">
              <span>Total Stay Investment</span>
              <span className="font-display text-2xl sm:text-3xl 2xl:text-4xl">
                {displayTotal}
              </span>
            </div>
          </div>

          {error ? (
            <p className="mx-auto mb-6 max-w-2xl rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}

          {(pending || failed) ? (
            <div className="mx-auto mb-8 max-w-2xl rounded-2xl border-2 border-[#D1C9BE] bg-[#FAF9F9] p-5 text-left">
              <p className="flex items-start gap-2 text-sm font-medium text-[#4E332D]">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#9A5636]" aria-hidden="true" />
                <span>
                  {pending
                    ? t("confirmation.pendingNote")
                    : t("confirmation.failedNote")}
                </span>
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={resumePayment}
                  disabled={resuming}
                  className="inline-flex items-center gap-2 rounded-full bg-[#4E332D] px-6 py-3 font-woodblock text-xs uppercase tracking-wider text-white"
                >
                  {resuming
                    ? t("confirmation.redirecting")
                    : t("confirmation.resumePayment")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    polls.current = 0;
                    loadStatus();
                  }}
                  className="rounded-full border-2 border-[#4E332D] px-6 py-3 font-woodblock text-xs uppercase tracking-wider text-[#4E332D]"
                >
                  {t("confirmation.refreshStatus")}
                </button>
              </div>
            </div>
          ) : null}

          {airportTransfer && confirmed ? (
            <div className="mx-auto mb-8 max-w-2xl rounded-2xl border-2 border-[#D1C9BE] bg-[#FAF9F9] p-5 text-left">
              <p className="font-brothers text-base font-bold uppercase tracking-wide text-[#4E332D]">
                {t("confirmation.shuttleTitle")}
              </p>
              <p className="mt-1 text-sm text-[#6B6259]">
                {t("confirmation.shuttleBody")}
              </p>
              <a
                href={SHUTTLE_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#4E332D] px-6 py-3 font-woodblock text-xs uppercase tracking-wider text-white"
              >
                {t("confirmation.shuttleCta")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          ) : null}

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row 2xl:gap-6">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#4E332D] px-6 py-3.5 font-woodblock text-xs uppercase tracking-wider text-[#4E332D] transition-all hover:scale-105 hover:bg-[#EBE8E0] sm:w-auto sm:px-8 sm:text-sm 2xl:py-4 2xl:text-base"
            >
              <Printer className="h-4 w-4 2xl:h-5 2xl:w-5" aria-hidden="true" />
              Print Guest Itinerary
            </button>
            <button
              type="button"
              onClick={() => {
                resetAll();
                goTo("dates");
              }}
              className="w-full rounded-full bg-[#4E332D] px-8 py-3.5 font-woodblock text-xs uppercase tracking-widest text-white shadow-md transition-all hover:scale-105 hover:bg-[#343833] sm:w-auto sm:px-10 sm:text-sm 2xl:py-4 2xl:text-base"
            >
              Book Another Stay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  loading,
  confirmed,
  pending,
  failed,
}: {
  loading: boolean;
  confirmed: boolean;
  pending: boolean;
  failed: boolean;
}) {
  return (
    <div
      className={[
        "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full shadow-md sm:h-16 sm:w-16 2xl:mb-6 2xl:h-20 2xl:w-20",
        confirmed
          ? "bg-[#0E301A] text-[#F2AAA9]"
          : failed
            ? "bg-amber-400 text-[#221C18]"
            : "bg-[#4E332D] text-white",
      ].join(" ")}
    >
      {loading ? (
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      ) : confirmed ? (
        <Check className="h-7 w-7 stroke-[2.5] sm:h-8 sm:w-8 2xl:h-10 2xl:w-10" aria-hidden="true" />
      ) : (
        <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8 2xl:h-10 2xl:w-10" aria-hidden="true" />
      )}
    </div>
  );
}

function FolioSpec({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#D1C9BE]/50 bg-white p-4 2xl:rounded-2xl">
      <span className="block font-mono text-xs uppercase text-[#73716D] 2xl:text-sm">
        {label}
      </span>
      <div className="mt-0.5 flex flex-col gap-0.5 text-[#221C18] [&>span]:text-xs [&>span]:text-[#73716D] 2xl:[&>span]:text-sm">
        {children}
      </div>
    </div>
  );
}
