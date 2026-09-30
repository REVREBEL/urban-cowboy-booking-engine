export type FindYourStayProps = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  availableCount: number;
  onChangeSearch: () => void;
  onHelpMeChoose: () => void;
  onBrowseAll: () => void;
};

function shortDate(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(year, month - 1, day),
  );
}

export default function FindYourStay({
  checkIn,
  checkOut,
  adults,
  children,
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
            (new Date(checkOut + "T00:00:00Z").getTime() -
              new Date(checkIn + "T00:00:00Z").getTime()) /
              86_400_000,
          ),
        )
      : 0;

  return (
    <section className="min-h-[calc(100vh-120px)] bg-[#EBE8E0] pb-24 pt-8 md:pt-12">
      <div className="booking-shell">
        <div className="mb-16 flex flex-wrap items-center justify-between gap-4 border-y border-[#4E332D]/20 py-4">
          <div className="font-editorial text-sm text-[#4E332D]">
            {shortDate(checkIn)} → {shortDate(checkOut)}
            <span className="mx-3 text-[#4E332D]/35">·</span>
            <span className="text-[#4E332D]/60">{nights} night{nights === 1 ? "" : "s"}</span>
            <span className="mx-3 text-[#4E332D]/35">·</span>
            <span className="text-[#4E332D]/60">
              {adults} adult{adults === 1 ? "" : "s"}
              {children > 0 ? " · " + children + " child" + (children === 1 ? "" : "ren") : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={onChangeSearch}
            className="font-bianco text-xs font-bold uppercase tracking-[2px] underline underline-offset-4"
          >
            Change
          </button>
        </div>

        <header className="mb-12 max-w-5xl">
          <p className="mb-3 font-bianco text-xs font-bold uppercase tracking-[5px] text-[#9A5636]">
            {availableCount} Room Experience{availableCount === 1 ? "" : "s"} Available
          </p>
          <h1 className="font-desert text-[clamp(42px,5.2vw,74px)] font-bold uppercase leading-[0.98] tracking-[1px] text-[#4E332D]">
            How Would You Like to Explore the Options?
          </h1>
          <p className="mt-4 max-w-4xl font-editorial text-base text-[#6B6259] md:text-lg">
            Answer a few questions and we&apos;ll match you to the right room, or browse everything available.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          <button
            type="button"
            onClick={onHelpMeChoose}
            className="group relative min-h-[300px] overflow-hidden rounded-2xl bg-[#563730] p-8 text-left text-[#EBE8E0] shadow-sm transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A5636] focus-visible:ring-offset-4 md:p-10"
          >
            <img src="/assets/hammock.svg" alt="" className="absolute bottom-0 right-0 h-[88%] opacity-[0.06]" />
            <span className="relative flex h-full flex-col justify-between">
              <span>
                <span className="mb-5 block font-bianco text-xs font-bold uppercase tracking-[3px] text-[#BE5B35]">Recommended</span>
                <span className="block font-desert text-4xl font-bold uppercase leading-none md:text-5xl">Help Me Choose</span>
                <span className="mt-6 block max-w-sm font-editorial text-sm leading-6 text-[#EBE8E0]/70">
                  Tell us who&apos;s coming and what matters most. We&apos;ll find your match in two quick steps.
                </span>
              </span>
              <span className="mt-8 flex items-center gap-3 font-bianco text-xs font-bold uppercase tracking-[2px] text-[#BE5B35]">
                Get Matched <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onBrowseAll}
            className="group relative min-h-[300px] overflow-hidden rounded-2xl border-2 border-[#CCC7BB] bg-[#EBE8E0] p-8 text-left text-[#4E332D] transition-all hover:-translate-y-1 hover:border-[#4E332D] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A5636] focus-visible:ring-offset-4 md:p-10"
          >
            <img src="/assets/icons/amenities/simple/estonian_sauna.svg" alt="" className="absolute -bottom-10 right-4 h-[105%] opacity-[0.06]" />
            <span className="relative flex h-full flex-col justify-between">
              <span>
                <span className="mb-5 block font-bianco text-xs font-bold uppercase tracking-[3px] text-[#9A5636]">Browse All</span>
                <span className="block font-desert text-4xl font-bold uppercase leading-none md:text-5xl">Show All Rooms</span>
                <span className="mt-6 block max-w-sm font-editorial text-sm leading-6 text-[#6B6259]">
                  Browse all {availableCount} available room experiences, sorted using live availability.
                </span>
              </span>
              <span className="mt-8 flex items-center gap-3 font-bianco text-xs font-bold uppercase tracking-[2px] text-[#9A5636]">
                See All Rooms <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
