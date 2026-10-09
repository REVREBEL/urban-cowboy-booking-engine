export type FindYourStayProps = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants?: number;
  availableCount?: number;
  onChangeSearch: () => void;
  onHelpMeChoose: () => void;
  onBrowseAll: () => void;
};

function fmt(value: string) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function FindYourStay({
  checkIn,
  checkOut,
  adults,
  children,
  infants = 0,
  availableCount,
  onChangeSearch,
  onHelpMeChoose,
  onBrowseAll,
}: FindYourStayProps) {
  const nights =
    checkIn && checkOut
      ? Math.max(
          1,
          Math.round(
            (new Date(`${checkOut}T00:00:00Z`).getTime() -
              new Date(`${checkIn}T00:00:00Z`).getTime()) /
              86_400_000,
          ),
        )
      : 0;

  return (
    <main className="min-h-screen bg-alpine-linen">
      <div className="bg-cowboy-umber px-5 py-4 text-alpine-linen md:px-10">
        <div className="booking-shell flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm" style={{ fontFamily: "var(--font-body)" }}>
            <span>{fmt(checkIn)} → {fmt(checkOut)}</span>
            {nights > 0 && <span className="opacity-60">· {nights} night{nights !== 1 ? "s" : ""}</span>}
            <span className="opacity-60">
              · {adults} adult{adults !== 1 ? "s" : ""}
              {children + infants > 0 ? ` · ${children + infants} child${children + infants !== 1 ? "ren" : ""}` : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={onChangeSearch}
            className="text-xs uppercase tracking-widest text-ash underline underline-offset-2 transition-colors hover:text-white"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Change
          </button>
        </div>
      </div>

      <div className="booking-shell pb-8 pt-12">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-copper" style={{ fontFamily: "var(--font-label)" }}>
          {availableCount === undefined
            ? "Room Experiences"
            : `${availableCount} Room Experience${availableCount !== 1 ? "s" : ""} Available`}
        </p>
        <h1 className="mb-4 text-4xl leading-none text-cowboy-umber md:text-6xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 700 }}>
          How Would You Like<br className="hidden md:block" /> to Find Your Stay?
        </h1>
        <p className="max-w-xl text-base text-ash-900" style={{ fontFamily: "var(--font-body)" }}>
          Answer a few questions and we&apos;ll match you to the right room, or browse everything available.
        </p>
      </div>

      <div className="booking-shell grid grid-cols-1 gap-5 pb-16 md:grid-cols-2">
        <button
          type="button"
          onClick={onHelpMeChoose}
          className="group relative overflow-hidden rounded-2xl bg-cowboy-umber text-left text-alpine-linen transition-shadow hover:shadow-xl"
        >
          <div className="absolute inset-0 opacity-10">
            <img src="/assets/hammock.svg" alt="" aria-hidden="true" className="absolute bottom-0 right-0 h-full object-cover" />
          </div>
          <div className="relative flex min-h-[260px] h-full flex-col justify-between p-8 md:p-10">
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest text-copper" style={{ fontFamily: "var(--font-label)" }}>Recommended</p>
              <h2 className="mb-3 text-3xl leading-tight md:text-4xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 700 }}>Help Me Choose</h2>
              <p className="max-w-xs text-sm leading-relaxed opacity-70" style={{ fontFamily: "var(--font-body)" }}>
                Tell us who&apos;s coming and what matters most. We&apos;ll find your match in 2 quick steps.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-copper transition-colors group-hover:text-ash" style={{ fontFamily: "var(--font-label)" }}>Get Matched</span>
              <img src="/assets/icon-arrow.svg" alt="" aria-hidden="true" className="h-3 opacity-60 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onBrowseAll}
          className="group relative overflow-hidden rounded-2xl border-2 border-ash bg-alpine-linen text-left text-cowboy-umber transition-all hover:border-cowboy-umber hover:shadow-xl"
        >
          <div className="absolute inset-0 opacity-5">
            <img src="/assets/steam-bath-icon.svg" alt="" aria-hidden="true" className="absolute bottom-0 right-0 h-full object-cover" />
          </div>
          <div className="relative flex min-h-[260px] h-full flex-col justify-between p-8 md:p-10">
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest text-copper" style={{ fontFamily: "var(--font-label)" }}>Browse All</p>
              <h2 className="mb-3 text-3xl leading-tight md:text-4xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 700 }}>Show All Rooms</h2>
              <p className="max-w-xs text-sm leading-relaxed text-ash-900" style={{ fontFamily: "var(--font-body)" }}>
                {availableCount === undefined
                  ? "Browse every available room experience."
                  : `Browse all ${availableCount} available room experiences.`}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-copper transition-colors group-hover:text-cowboy-umber" style={{ fontFamily: "var(--font-label)" }}>See All Rooms</span>
              <img src="/assets/icon-arrow.svg" alt="" aria-hidden="true" className="h-3 opacity-40 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </button>
      </div>
    </main>
  );
}
