import { Search } from "lucide-react";

import { nights } from "@/lib/booking/matching";
import { useBooking } from "@/lib/booking/store";
import { cn } from "@/lib/utils";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex min-w-0 flex-col justify-center rounded-full px-4 py-2 transition-colors hover:bg-secondary/60",
        className,
      )}
    >
      <span className="eyebrow text-[10px] text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{children}</span>
    </label>
  );
}

const inputClass =
  "w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground";

/**
 * The expanded Cowboy search bar: one white pill holding property, dates,
 * guests, promo and the umber search button.
 */
export function SearchBar({
  onSearch,
  promo,
  onPromoChange,
}: {
  onSearch: () => void;
  promo: string;
  onPromoChange: (value: string) => void;
}) {
  const { booking, setStay } = useBooking();
  const stayNights = nights(booking.stay);
  const guests = booking.stay.adults + booking.stay.children;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
      className="w-full rounded-[2rem] border border-ink/10 bg-snow p-1.5 shadow-[0_4px_6px_0_rgb(0_0_0_/_0.08),0_2px_4px_0_rgb(0_0_0_/_0.06)] backdrop-blur-xl md:rounded-full"
    >
      <div className="flex flex-col gap-1 md:flex-row md:items-stretch md:gap-0 md:pl-2.5">
        <Field label="Property" className="md:w-[13rem]">
          Catskills, NY
        </Field>

        <span aria-hidden="true" className="hidden w-px self-stretch bg-border md:block" />

        <Field label="Check-in" className="md:w-[10rem]">
          <input
            type="date"
            value={booking.stay.arrival}
            onChange={(event) => setStay({ arrival: event.target.value })}
            className={inputClass}
          />
        </Field>

        <span aria-hidden="true" className="hidden w-px self-stretch bg-border md:block" />

        <Field label="Check-out" className="md:w-[10rem]">
          <input
            type="date"
            value={booking.stay.departure}
            onChange={(event) => setStay({ departure: event.target.value })}
            className={inputClass}
          />
        </Field>

        <span aria-hidden="true" className="hidden w-px self-stretch bg-border md:block" />

        <Field label="Guests" className="md:w-[9rem]">
          <select
            value={guests}
            onChange={(event) => setStay({ adults: Number(event.target.value), children: 0 })}
            className={cn(inputClass, "appearance-none")}
          >
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <option key={count} value={count}>
                {count} guest{count === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </Field>

        <span aria-hidden="true" className="hidden w-px self-stretch bg-border md:block" />

        <Field label="Promo" className="md:w-[8.5rem]">
          <input
            value={promo}
            onChange={(event) => onPromoChange(event.target.value)}
            placeholder="Add promo"
            className={inputClass}
          />
        </Field>

        <button
          type="submit"
          disabled={stayNights === 0}
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40 md:mt-0 md:ml-2"
        >
          <Search className="size-4" />
           <span className="font-button text-sm">Search</span>
        </button>
      </div>

      <p className="px-5 pb-1 pt-1 text-center text-xs text-muted-foreground md:pt-2">
        {stayNights > 0
          ? `${stayNights} night${stayNights === 1 ? "" : "s"}, ${guests} guest${guests === 1 ? "" : "s"}`
          : "Choose a check-out date after your check-in."}
      </p>
    </form>
  );
}
