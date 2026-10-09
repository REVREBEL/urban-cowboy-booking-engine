import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { BookingSummary } from "./booking-summary";

export interface CheckoutStepProps {
  eyebrow: string;
  title: string;
  subtitle?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  children: ReactNode;
}

/**
 * Production checkout shell based on the original CheckoutStep mock.
 *
 * The mock's visual structure is preserved here: expansive 7/5 layout,
 * oversized guest-facing form column, and a sticky folio on the right.
 * Booking state, pricing, extras, payment, and confirmation remain owned by
 * the live booking flow rather than the mock's local data/calculations.
 */
export function CheckoutStep({
  eyebrow,
  title,
  subtitle,
  onBack,
  backLabel = "Back",
  children,
}: CheckoutStepProps) {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 sm:py-10 2xl:py-14">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="group mb-6 inline-flex cursor-pointer items-center gap-2 font-label text-xs uppercase tracking-widest text-smoke-fade transition-colors hover:text-cowboy-umber sm:text-sm 2xl:mb-8"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
          <span>{backLabel}</span>
        </button>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10 2xl:gap-14">
        <div className="space-y-6 lg:col-span-7 2xl:space-y-8">
          <header>
            <span className="mb-1 block font-label text-xs font-bold uppercase tracking-widest text-copper 2xl:text-sm">
              {eyebrow}
            </span>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-cowboy-umber sm:text-4xl lg:text-4xl 2xl:text-5xl">
              {title}
            </h1>
            {subtitle ? (
              <div className="mt-1.5 font-body text-sm leading-relaxed text-ash-900 sm:text-base 2xl:text-lg">
                {subtitle}
              </div>
            ) : null}
          </header>

          {children}
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <BookingSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
