type Props = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  availableCount: number;
  onChangeSearch: () => void;
  onHelpChoose: () => void;
  onBrowseAll: () => void;
};

function fmt(day: string) {
  if (!day) return "";
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function nightCount(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T00:00:00Z`).getTime();
  const end = new Date(`${checkOut}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

export default function FindYourStay({
  checkIn,
  checkOut,
  adults,
  children,
  availableCount,
  onChangeSearch,
  onHelpChoose,
  onBrowseAll,
}: Props) {
  const nights = nightCount(checkIn, checkOut);

  return (
    <main className="min-h-screen bg-[#ebe8e0]">
      <div className="bg-[#4e332d] px-5 py-4 text-[#ebe8e0] md:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm" style={{ fontFamily: "var(--font-uchen)" }}>
            <span>{fmt(checkIn)} → {fmt(checkOut)}</span>
            {nights > 0 && <span className="opacity-60">· {nights} night{nights !== 1 ? "s" : ""}</span>}
            <span className="opacity-60">
              · {adults} adult{adults !== 1 ? "s" : ""}
              {children > 0 ? ` · ${children} child${children !== 1 ? "ren" : ""}` : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={onChangeSearch}
            className="text-xs uppercase tracking-widest text-[#ccc7bb] underline underline-offset-2 transition-colors hover:text-white"
            style={{ fontFamily: "var(--font-brothers)" }}
          >
            Change
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-8 pt-12 md:px-10">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#9a5636]" style={{ fontFamily: "var(--font-brothers)" }}>
          {availableCount} Room Experience{availableCount !== 1 ? "s" : ""} Available
        </p>
        <h1 className="mb-4 text-4xl leading-none text-[#4e332d] md:text-6xl" style={{ fontFamily: "var(--font-desert)", fontWeight: 700 }}>
          How Would You Like<br className="hidden md:block" /> to Find Your Stay?
        </h1>
        <p className="max-w-xl text-base text-[#767470]" style={{ fontFamily: "var(--font-uchen)" }}>
          Answer a few questions and we&apos;ll match you to the right room, or browse everything available.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-5 pb-16 md:grid-cols-2 md:px-10">
        <button
          type="button"
          onClick={onHelpChoose}
          className="group relative overflow-hidden rounded-2xl bg-[#4e332d] text-left text-[#ebe8e0] transition-shadow hover:shadow-xl"
        >
          <div className="relative flex min-h-[260px] h-full flex-col justify-between p-8 md:p-10">
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest text-[#9a5636]" style={{ fontFamily: "var(--font-brothers)" }}>Recommended</p>
              <h2 className="mb-3 text-3xl leading-tight md:text-4xl" style={{ fontFamily: "var(--font-desert)", fontWeight: 700 }}>Help Me Choose</h2>
              <p className="max-w-xs text-sm leading-relaxed opacity-70" style={{ fontFamily: "var(--font-uchen)" }}>
                Tell us who&apos;s coming and what matters most. We&apos;ll find your match in three questions.
              </p>
            </div>
            <span className="mt-6 text-xs uppercase tracking-widest text-[#9a5636]" style={{ fontFamily: "var(--font-brothers)" }}>Get Matched →</span>
          </div>
        </button>

        <button
          type="button"
          onClick={onBrowseAll}
          className="group relative overflow-hidden rounded-2xl border-2 border-[#ccc7bb] bg-[#ebe8e0] text-left text-[#4e332d] transition-all hover:border-[#4e332d] hover:shadow-xl"
        >
          <div className="relative flex min-h-[260px] h-full flex-col justify-between p-8 md:p-10">
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest text-[#9a5636]" style={{ fontFamily: "var(--font-brothers)" }}>Browse All</p>
              <h2 className="mb-3 text-3xl leading-tight md:text-4xl" style={{ fontFamily: "var(--font-desert)", fontWeight: 700 }}>Show All Rooms</h2>
              <p className="max-w-xs text-sm leading-relaxed text-[#767470]" style={{ fontFamily: "var(--font-uchen)" }}>
                Browse all {availableCount} available room experiences, sorted and ready to compare.
              </p>
            </div>
            <span className="mt-6 text-xs uppercase tracking-widest text-[#9a5636]" style={{ fontFamily: "var(--font-brothers)" }}>Browse Rooms →</span>
          </div>
        </button>
      </div>
    </main>
  );
}
