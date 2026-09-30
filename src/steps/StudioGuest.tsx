import { lazy, Suspense, useEffect, useState } from "react";
import { useBooking } from "@/state/booking";
import { EMAIL_RE } from "@/lib/format";
import { upgradeRooms } from "@/lib/shaping";

const PhoneInput = lazy(() => import("@/components/forms/phone-input").then((module) => ({ default: module.PhoneInput })));

export function StudioGuest() {
  const { selectedRoom, selectedRate, availableRooms, guest, setGuest, goTo } = useBooking();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phoneValid, setPhoneValid] = useState(true);

  useEffect(() => {
    if (!selectedRoom || !selectedRate) goTo("results");
  }, [selectedRoom, selectedRate, goTo]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!guest.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!guest.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!EMAIL_RE.test(guest.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!phoneValid || !guest.telephone.trim()) nextErrors.telephone = "Enter a valid phone number.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const currentTotal = selectedRate?.totalGross ?? selectedRoom?.fromGross ?? 0;
    const hasUpgrades = upgradeRooms(availableRooms, selectedRoom, currentTotal).length > 0;
    goTo(hasUpgrades ? "upgrade" : "extras");
  }

  if (!selectedRoom || !selectedRate) return null;

  return (
    <section className="texture-linen min-h-screen pb-24 pt-10">
      <div className="booking-shell max-w-4xl">
        <button type="button" onClick={() => goTo("results")} className="mb-7 font-woodblock text-xs uppercase tracking-widest text-[#73716D] hover:text-[#4E332D]">
          ← Back to Rooms
        </button>

        <header className="mb-8">
          <p className="font-bianco text-xs font-bold uppercase tracking-[5px] text-[#9A5636]">Your Details</p>
          <h1 className="mt-3 font-desert text-5xl font-bold uppercase leading-none text-[#4E332D] md:text-6xl">Who&apos;s Checking In?</h1>
          <p className="mt-4 max-w-2xl font-editorial text-sm text-[#6B6259]">
            A few details for the reservation, then we&apos;ll show any available room upgrade before the extras.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <form onSubmit={submit} noValidate className="rounded-[28px] border-2 border-[#4E332D] bg-[#FAF9F9] p-6 shadow-sm sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First Name" error={errors.firstName} required>
                <input value={guest.firstName} autoComplete="given-name" onChange={(event) => setGuest({ firstName: event.target.value })} className="studio-field" />
              </Field>
              <Field label="Last Name" error={errors.lastName} required>
                <input value={guest.lastName} autoComplete="family-name" onChange={(event) => setGuest({ lastName: event.target.value })} className="studio-field" />
              </Field>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Email" error={errors.email} required>
                <input type="email" value={guest.email} autoComplete="email" onChange={(event) => setGuest({ email: event.target.value })} className="studio-field" />
              </Field>
              <Field label="Phone" error={errors.telephone} required>
                <Suspense fallback={<div className="studio-field animate-pulse text-[#4E332D]/30">Loading…</div>}>
                  <PhoneInput
                    value={guest.telephone}
                    defaultCountry={guest.nationalityCode}
                    invalid={Boolean(errors.telephone)}
                    onChange={(value, valid) => {
                      setGuest({ telephone: value });
                      setPhoneValid(valid);
                    }}
                  />
                </Suspense>
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Anything We Should Know?">
                <textarea
                  value={guest.notes}
                  onChange={(event) => setGuest({ notes: event.target.value })}
                  className="studio-field min-h-[110px] resize-y"
                  placeholder="Celebrating something, arrival notes, or anything else we should know."
                />
              </Field>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#4E332D]/15 bg-[#EBE8E0]/60 p-4 font-editorial text-xs leading-5 text-[#4E332D]/75">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-[#9A5636]"
                checked={guest.sendMarketingEmails}
                onChange={(event) => setGuest({ sendMarketingEmails: event.target.checked })}
              />
              Send me the occasional Cowboy note, offer, or reason to disappear upstate again.
            </label>

            <div className="mt-7 flex justify-end">
              <button type="submit" className="rounded-full bg-[#9A5636] px-8 py-3 font-bianco text-xs font-bold uppercase tracking-[2px] text-[#EBE8E0] transition hover:bg-[#783224]">
                Continue →
              </button>
            </div>
          </form>

          <aside className="h-fit rounded-[24px] border-2 border-[#0E301A] bg-[#0E301A] p-5 text-[#FAF9F9]">
            <p className="font-bianco text-[10px] font-bold uppercase tracking-[3px] text-[#F2AAA9]">Your Selection</p>
            <h2 className="mt-3 font-brothers text-2xl font-bold uppercase leading-none">{selectedRoom.name}</h2>
            <p className="mt-3 font-editorial text-xs leading-5 text-[#FAF9F9]/70">{selectedRate.name}</p>
            <div className="mt-5 border-t border-[#FAF9F9]/20 pt-4">
              <p className="font-bianco text-[10px] uppercase tracking-wider text-[#FAF9F9]/50">Stay total</p>
              <p className="mt-1 font-brothers text-2xl">
                {selectedRate.totalGross !== null
                  ? new Intl.NumberFormat("en-US", { style: "currency", currency: selectedRate.currency, maximumFractionDigits: 0 }).format(selectedRate.totalGross)
                  : "Final quote next"}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-bianco text-[11px] font-bold uppercase tracking-[1.5px] text-[#4E332D]">
        {label}{required ? " *" : ""}
      </span>
      {children}
      {error && <span role="alert" className="mt-1 block font-editorial text-xs font-semibold text-[#8C2340]">{error}</span>}
    </label>
  );
}
