import type { ShapedRate, ShapedRoom } from "@/types/mews";
import { imgUrl } from "@/lib/format";

type StudioRateSelectionProps = {
  room: ShapedRoom;
  imageBaseUrl: string;
  nights: number;
  onBack: () => void;
  onSelectRate: (rate: ShapedRate) => void;
};

const THEMES = [
  { bg: "bg-[#4E332D]", border: "border-[#4E332D]", text: "text-[#EBE8E0]", accent: "text-[#F2AAA9]", button: "bg-[#F2AAA9] text-[#0E301A]" },
  { bg: "bg-[#EBE8E0]", border: "border-[#4E332D]", text: "text-[#4E332D]", accent: "text-[#9A5636]", button: "bg-[#4E332D] text-[#EBE8E0]" },
  { bg: "bg-[#0E301A]", border: "border-[#0E301A]", text: "text-[#FAF9F9]", accent: "text-[#F2AAA9]", button: "bg-[#F2AAA9] text-[#0E301A]" },
  { bg: "bg-[#9A5636]", border: "border-[#9A5636]", text: "text-[#F4E1C7]", accent: "text-[#2F1F1B]", button: "bg-[#2F1F1B] text-[#F4E1C7]" },
  { bg: "bg-[#343833]", border: "border-[#343833]", text: "text-[#EBE8E0]", accent: "text-[#D99373]", button: "bg-[#9A5636] text-[#EBE8E0]" },
];

function price(value: number | null, currency: string) {
  if (value === null) return "Rate on request";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export function StudioRateSelection({ room, imageBaseUrl, nights, onBack, onSelectRate }: StudioRateSelectionProps) {
  const image = room.imageIds[0] ? imgUrl(imageBaseUrl, room.imageIds[0], 1200) : "";

  return (
    <section className="min-h-screen bg-[#EBE8E0] pb-20 pt-8">
      <div className="booking-shell">
        <button type="button" onClick={onBack} className="mb-6 font-woodblock text-xs uppercase tracking-widest text-[#73716D] hover:text-[#4E332D]">← Back to Rooms</button>

        <div className="grid gap-6 border-b border-[#4E332D]/20 pb-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="font-bianco text-xs font-bold uppercase tracking-[5px] text-[#9A5636]">Select Your Experience</p>
            <h1 className="mt-3 font-desert text-5xl font-bold uppercase leading-none text-[#4E332D] md:text-6xl">{room.name}</h1>
            <p className="mt-4 max-w-3xl font-editorial text-sm leading-6 text-[#6B6259]">{room.description}</p>
          </div>
          {image && <img src={image} alt={room.name} className="h-44 w-full rounded-2xl border-2 border-[#4E332D] object-cover shadow-sm" />}
        </div>

        <div className="mt-8 flex gap-5 overflow-x-auto pb-6 pt-2 hide-scrollbar">
          {room.rates.map((rate, index) => {
            const theme = THEMES[index % THEMES.length];
            return (
              <article key={rate.rateId} className={"flex min-h-[440px] w-[330px] shrink-0 flex-col rounded-[28px] border-2 p-6 shadow-md md:w-[380px] " + theme.bg + " " + theme.border + " " + theme.text}>
                <div>
                  <p className={"font-bianco text-[10px] font-bold uppercase tracking-[3px] " + theme.accent}>
                    {rate.knownRateGroup ? rate.knownRateGroup.replace(/[-_]/g, " ") : "Cowboy Rate"}
                  </p>
                  <h2 className="mt-3 font-desert text-3xl font-bold uppercase leading-none">{rate.name}</h2>
                  <p className="mt-5 min-h-[84px] font-editorial text-sm leading-6 opacity-80">
                    {rate.description || "A live rate option returned for this room and your selected dates."}
                  </p>
                </div>

                <div className="my-6 border-y border-current/20 py-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <span className="block font-bianco text-[10px] uppercase tracking-wider opacity-60">Per night</span>
                      <strong className="font-brothers text-2xl">{price(rate.perNightGross, rate.currency)}</strong>
                    </div>
                    <div className="text-right">
                      <span className="block font-bianco text-[10px] uppercase tracking-wider opacity-60">{nights} night{nights === 1 ? "" : "s"}</span>
                      <strong className="font-brothers text-lg">{price(rate.totalGross, rate.currency)}</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 font-editorial text-xs leading-5 opacity-75">
                  <p>Live availability and pricing from Mews.</p>
                  {rate.settlement.value !== null && <p>Deposit rule: {rate.settlement.value}% when applicable to this rate.</p>}
                  {rate.isPrivate && <p>Private or promotional rate eligibility may apply.</p>}
                </div>

                <div className="mt-auto pt-7">
                  <button type="button" onClick={() => onSelectRate(rate)} className={"w-full rounded-full px-6 py-3 font-bianco text-xs font-bold uppercase tracking-[2px] transition-transform hover:-translate-y-0.5 " + theme.button}>
                    Choose This Rate →
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {room.rates.length === 0 && (
          <div className="mt-8 rounded-2xl border-2 border-[#4E332D] bg-[#FAF9F9] p-8 text-center font-editorial text-[#4E332D]">
            No sellable rates were returned for this room.
          </div>
        )}
      </div>
    </section>
  );
}
