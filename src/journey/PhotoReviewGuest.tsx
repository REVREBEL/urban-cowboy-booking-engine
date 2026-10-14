/**
 * Photo Engine's original split-image Review screen with real booking totals
 * and the production guest form. It does not create a reservation: the
 * canonical Payment step handles payment confirmation and Mews operations.
 */
import { lazy, Suspense, useState, type FormEvent } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useBooking } from "../state/booking";
import { EMAIL_RE, money } from "../lib/format";
import { getLang } from "../lib/lang";
import { toPhotoTourRoom } from "../data/photoTourRooms";

const PhoneInput = lazy(() => import("../components/forms/phone-input").then(module => ({ default: module.PhoneInput })));
const label = "font-j-label text-[11px] uppercase tracking-[0.22em]";
const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-full bg-j-ember px-6 py-3 font-j-label text-xs uppercase tracking-[0.2em] text-j-paper transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-paper";
function Row({ title, value, onEdit }: { title: string; value: string; onEdit: () => void }) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)_auto] gap-3 py-3 text-sm">
      <dt className="text-j-ink/70">{title}</dt>
      <dd className="min-w-0">{value}</dd>
      <button type="button" onClick={onEdit} className="text-xs underline underline-offset-4">Edit</button>
    </div>
  );
}
function Field({ id, title, error, children }: { id: string; title: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block font-j-label text-xs uppercase tracking-widest text-j-ink" htmlFor={id}>{title}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-700" role="alert" id={`${id}-error`}>{error}</p>}
    </div>
  );
}
const input = "checkout-field w-full rounded-xl border border-j-ink/20 bg-white px-4 py-3 text-j-ink focus-visible:outline-2 focus-visible:outline-j-ember";

export function PhotoReviewGuest() {
  const booking = useBooking();
  const room = booking.selectedRoom;
  const rate = booking.selectedRate;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phoneValid, setPhoneValid] = useState(true);
  if (!room || !rate) return null;
  const photo = toPhotoTourRoom(room, booking.imageBaseUrl);
  const image = photo.images[0];
  const { guest, setGuest } = booking;
  const total = booking.grandTotal;
  const dateText = `${booking.checkIn} → ${booking.checkOut} · ${booking.nightsCount} nights`;

  function submit(event: FormEvent) {
    event.preventDefault();
    const failures: Record<string, string> = {};
    if (!guest.firstName.trim()) failures.firstName = "Enter your first name";
    if (!guest.lastName.trim()) failures.lastName = "Enter your last name";
    if (!EMAIL_RE.test(guest.email.trim())) failures.email = "Enter a valid email address";
    if (!guest.telephone.trim() || !phoneValid) failures.telephone = "Enter a valid phone number";
    setErrors(failures);
    if (Object.keys(failures).length) return;
    booking.goTo("payment");
  }

  return (
    <section className="grid min-h-dvh items-start bg-j-night text-j-paper lg:grid-cols-[1.1fr_1fr]" data-photo-review-step>
      <div className="lg:sticky lg:top-0">
        {image && (
          <figure className="relative w-full">
            <img src={image} alt={room.name} fetchPriority="high" className="block h-auto w-full" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-j-night to-transparent p-6 pt-24 sm:p-8 sm:pt-32">
              <p className={`${label} text-j-paper/80`}>{photo.building}</p>
              <h1 className="font-j-display text-4xl sm:text-5xl">{room.name}</h1>
            </div>
          </figure>
        )}
      </div>
      <div className="min-h-dvh bg-j-paper px-5 pb-16 pt-24 text-j-ink sm:px-8">
        <p className={`${label} text-j-ember`}>05 — Your stay</p>
        <h2 className="mt-3 font-j-display text-4xl">Review & guest details</h2>
        <dl className="mt-6 divide-y divide-j-line">
          <Row title="Dates" value={dateText} onEdit={() => booking.goTo("dates")} />
          <Row title="Guests" value={String(booking.adults + booking.children + booking.infants)} onEdit={() => booking.goTo("dates")} />
          <Row title="Room" value={room.name} onEdit={() => booking.goTo("results")} />
          <Row title="Rate" value={rate.name} onEdit={() => booking.goTo("rates")} />
        </dl>
        <div className="mt-6 space-y-2 border-t-2 border-j-ink pt-4 text-sm tabular-nums">
          <div className="flex justify-between gap-3"><span>Room</span><span>{money(rate.totalGross, booking.currency)}</span></div>
          {booking.selectedProducts.map(product => (
            <div className="flex justify-between gap-3" key={product.id}>
              <span>{product.name}</span><span>Included in extras total</span>
            </div>
          ))}
          {booking.selectedProducts.length > 0 && (
            <div className="flex justify-between gap-3"><span>Extras</span><span>{money(booking.productsTotal, booking.currency)}</span></div>
          )}
          {booking.totalTax != null && (
            <div className="flex justify-between gap-3 text-j-ink/70"><span>Tax included in total</span><span>{money(booking.totalTax, booking.currency)}</span></div>
          )}
          <div className="flex items-baseline justify-between gap-4 border-t border-j-line pt-3">
            <span className="font-bold">{booking.quote ? "Total" : "Estimated total"}</span>
            <span className="font-j-display text-3xl">{money(total, booking.currency)}</span>
          </div>
        </div>
        <button type="button" onClick={() => booking.goTo("extras")} className="mt-3 text-sm underline underline-offset-4">Edit extras</button>
        <form onSubmit={submit} className="mt-9 space-y-5" noValidate>
          <h3 className="font-j-display text-2xl">Who should we expect?</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="photo-first-name" title="First name" error={errors.firstName}>
              <input className={input} id="photo-first-name" autoComplete="given-name" value={guest.firstName} required aria-invalid={!!errors.firstName} onChange={e => setGuest({ firstName: e.target.value })} />
            </Field>
            <Field id="photo-last-name" title="Last name" error={errors.lastName}>
              <input className={input} id="photo-last-name" autoComplete="family-name" value={guest.lastName} required aria-invalid={!!errors.lastName} onChange={e => setGuest({ lastName: e.target.value })} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="photo-email" title="Email address" error={errors.email}>
              <input className={input} id="photo-email" type="email" autoComplete="email" value={guest.email} required aria-invalid={!!errors.email} onChange={e => setGuest({ email: e.target.value })} />
            </Field>
            <Field id="photo-phone" title="Telephone" error={errors.telephone}>
              <div className="checkout-phone-shell text-j-ink">
                <Suspense fallback={<div className={input}>Loading telephone field…</div>}>
                  <PhoneInput id="photo-phone" name="telephone" required invalid={!!errors.telephone}
                    ariaDescribedBy={errors.telephone ? "photo-phone-error" : undefined}
                    value={guest.telephone} defaultCountry={getLang() === "fr" ? "CA" : "US"}
                    onChange={(value, valid) => { setGuest({ telephone: value }); setPhoneValid(valid); }} />
                </Suspense>
              </div>
            </Field>
          </div>
          <Field id="photo-notes" title="Anything we should know?">
            <textarea className={input + " min-h-24 resize-y"} id="photo-notes" value={guest.notes} onChange={e => setGuest({ notes: e.target.value })} />
          </Field>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-j-ink/75">
            <input type="checkbox" className="mt-0.5 h-5 w-5 accent-j-ember"
              checked={guest.sendMarketingEmails} onChange={e => setGuest({ sendMarketingEmails: e.target.checked })} />
            <span>I'd like occasional updates and special offers from Urban Cowboy.</span>
          </label>
          <p className="flex items-start gap-2 text-xs text-j-ink/70">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            Next, review payment and reservation conditions before confirming.
          </p>
          <button type="submit" className={`${btnPrimary} w-full py-4`}>
            Continue to payment review <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}
