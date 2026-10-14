import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useBooking } from "../state/booking";
import { t } from "../i18n";
import { EMAIL_RE } from "../lib/format";
import { getLang } from "../lib/lang";
import { CheckoutStep } from "@/components/booking/summary/CheckoutStep";

const PhoneInput = lazy(() =>
  import("@/components/forms/phone-input").then((module) => ({
    default: module.PhoneInput,
  })),
);

export function Guest() {
  const { selectedRoom, selectedRate, guest, setGuest, goTo } = useBooking();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phoneValid, setPhoneValid] = useState(true);

  useEffect(() => {
    if (!selectedRoom || !selectedRate) goTo("results");
  }, [selectedRoom, selectedRate, goTo]);

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!guest.firstName.trim()) nextErrors.firstName = t("guest.err.firstName");
    if (!guest.lastName.trim()) nextErrors.lastName = t("guest.err.lastName");
    if (!EMAIL_RE.test(guest.email.trim())) nextErrors.email = t("guest.err.email");
    if (!phoneValid) nextErrors.telephone = t("guest.err.telephone");
    else if (!guest.telephone.trim()) {
      nextErrors.telephone = t("guest.err.telephoneRequired");
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    goTo("extras");
  }

  if (!selectedRoom || !selectedRate) return null;

  return (
    <div className="min-h-screen bg-paper">
      <CheckoutStep
        eyebrow="STEP 3 OF 5 · GUEST DETAILS"
        title="Guest Information"
        subtitle={t("guest.subtitle")}
        onBack={() => goTo("rates")}
        backLabel={t("guest.backLabel")}
      >
        <form onSubmit={submit} className="space-y-5 sm:space-y-6 2xl:space-y-7" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:gap-6">
            <Field
              htmlFor="guest-first-name"
              label={t("guest.firstName")}
              error={errors.firstName}
              required
            >
              <input
                id="guest-first-name"
                name="firstName"
                className="checkout-field"
                value={guest.firstName}
                autoComplete="given-name"
                required
                aria-invalid={!!errors.firstName || undefined}
                aria-describedby={errors.firstName ? "guest-first-name-error" : undefined}
                placeholder="e.g. Gary"
                onChange={(event) => setGuest({ firstName: event.target.value })}
              />
            </Field>

            <Field
              htmlFor="guest-last-name"
              label={t("guest.lastName")}
              error={errors.lastName}
              required
            >
              <input
                id="guest-last-name"
                name="lastName"
                className="checkout-field"
                value={guest.lastName}
                autoComplete="family-name"
                required
                aria-invalid={!!errors.lastName || undefined}
                aria-describedby={errors.lastName ? "guest-last-name-error" : undefined}
                placeholder="e.g. Stringham"
                onChange={(event) => setGuest({ lastName: event.target.value })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:gap-6">
            <Field
              htmlFor="guest-email"
              label={t("guest.email")}
              error={errors.email}
              required
            >
              <input
                id="guest-email"
                name="email"
                type="email"
                className="checkout-field"
                value={guest.email}
                autoComplete="email"
                required
                aria-invalid={!!errors.email || undefined}
                aria-describedby={errors.email ? "guest-email-error" : undefined}
                placeholder={t("guest.emailPlaceholder")}
                onChange={(event) => setGuest({ email: event.target.value })}
              />
            </Field>

            <Field
              htmlFor="guest-phone"
              label={t("guest.phone")}
              error={errors.telephone}
              required
            >
              <div className="checkout-phone-shell">
                <Suspense fallback={<div className="checkout-field animate-pulse text-cowboy-umber/30">…</div>}>
                  <PhoneInput
                    id="guest-phone"
                    name="telephone"
                    required
                    invalid={!!errors.telephone}
                    ariaDescribedBy={errors.telephone ? "guest-phone-error" : undefined}
                    value={guest.telephone}
                    defaultCountry={getLang() === "fr" ? "CA" : "US"}
                    onChange={(value, valid) => {
                      setGuest({ telephone: value });
                      setPhoneValid(valid);
                    }}
                  />
                </Suspense>
              </div>
            </Field>
          </div>

          <Field htmlFor="guest-notes" label={t("guest.notes")}>
            <textarea
              id="guest-notes"
              name="notes"
              rows={3}
              className="checkout-field min-h-[112px] resize-y leading-relaxed"
              value={guest.notes}
              placeholder={t("guest.notesPlaceholder")}
              onChange={(event) => setGuest({ notes: event.target.value })}
            />
          </Field>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-alpine-linen bg-white p-4 text-sm text-ash-900 shadow-2xs sm:p-5">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#9A5636]"
              checked={guest.sendMarketingEmails}
              onChange={(event) =>
                setGuest({ sendMarketingEmails: event.target.checked })
              }
            />
            <span>{t("guest.marketing")}</span>
          </label>

          <div className="border-t-2 border-alpine-linen pt-4 2xl:pt-6">
            <div className="mb-5 flex items-start gap-3 text-xs text-ash-900 sm:items-center sm:text-sm 2xl:mb-6 2xl:text-base">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-lake-forest sm:mt-0 2xl:h-6 2xl:w-6" aria-hidden="true" />
              <span>
                Your guest details stay with this booking session as you finish your curated add-ons and reservation guarantee.
              </span>
            </div>

            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-cowboy-umber py-4 font-label text-sm uppercase tracking-widest text-white shadow-lg transition-all hover:bg-smoke hover:shadow-xl active:scale-[0.99] sm:py-5 sm:text-base 2xl:py-6 2xl:text-lg"
            >
              <span>Continue to Curated Add-ons</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 2xl:h-6 2xl:w-6" aria-hidden="true" />
            </button>
          </div>
        </form>
      </CheckoutStep>
    </div>
  );
}

function Field({
  htmlFor,
  label,
  error,
  required,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block font-label text-xs font-bold uppercase tracking-wider text-cowboy-umber sm:text-sm 2xl:text-base"
      >
        {label} {required ? <span className="text-copper">*</span> : null}
      </label>
      {children}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-1.5 text-xs font-medium text-red-600"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
