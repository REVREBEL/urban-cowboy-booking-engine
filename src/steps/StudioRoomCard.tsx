import { imgUrl, money } from "@/lib/format";
import { roomDetailTags } from "@/lib/roomTags";
import type { ShapedRoom } from "@/types/mews";

export type StudioRoomCardColor = "paper" | "forest" | "smoke" | "copper";
export type StudioRoomCardLayout = "left" | "right";

type StudioRoomCardProps = {
  room: ShapedRoom;
  imageBaseUrl: string;
  color?: StudioRoomCardColor;
  layout?: StudioRoomCardLayout;
  onSelectRoom?: (room: ShapedRoom) => void;
  onOpenRoomDetails?: (room: ShapedRoom) => void;
};

const COLORS = {
  paper: {
    card: "bg-[#FAF9F9] border-[#0E301A]",
    title: "text-[#4E332D]",
    tagline: "text-[#9A5636]",
    body: "text-[#4E332D]",
    badge: "border-[#4E332D] text-[#4E332D]",
    accent: "border-[#9A5636] text-[#9A5636]",
    select: "bg-[#9A5636] hover:bg-[#783224] text-[#EBE8E0]",
    details: "border-[#9A5636] text-[#9A5636] hover:bg-[#9A5636]/10",
    price: "text-[#4E332D]",
  },
  forest: {
    card: "bg-[#0E301A] border-[#0E301A]",
    title: "text-[#FAF9F9]",
    tagline: "text-[#F2AAA9]",
    body: "text-[#FAF9F9]",
    badge: "border-[#FAF9F9] text-[#FAF9F9]",
    accent: "border-[#F2AAA9] text-[#F2AAA9]",
    select: "bg-[#F2AAA9] hover:bg-[#F2AAA9]/85 text-[#0E301A]",
    details: "border-[#F2AAA9] text-[#F2AAA9] hover:bg-[#F2AAA9]/10",
    price: "text-[#FAF9F9]",
  },
  smoke: {
    card: "bg-[#343833] border-[#343833]",
    title: "text-[#EBE8E0]",
    tagline: "text-[#A4674A]",
    body: "text-[#EBE8E0]",
    badge: "border-[#EBE8E0] text-[#EBE8E0]",
    accent: "border-[#AE785E] text-[#AE785E]",
    select: "bg-[#9A5636] hover:bg-[#783224] text-[#EBE8E0]",
    details: "border-[#9A5636] text-[#D99373] hover:bg-[#9A5636]/10",
    price: "text-[#EBE8E0]",
  },
  copper: {
    card: "bg-[#9A5636] border-[#9A5636]",
    title: "text-[#DDC5A4]",
    tagline: "text-[#2F1F1B]",
    body: "text-[#F2E3CF]",
    badge: "border-[#DDC5A4] text-[#DDC5A4]",
    accent: "border-[#2F1F1B] text-[#2F1F1B]",
    select: "bg-[#2F1F1B] hover:bg-black text-[#DDC5A4]",
    details: "border-[#2F1F1B] text-[#2F1F1B] hover:bg-[#2F1F1B]/10",
    price: "text-[#DDC5A4]",
  },
} as const;

export function StudioRoomCard({
  room,
  imageBaseUrl,
  color = "paper",
  layout = "left",
  onSelectRoom,
  onOpenRoomDetails,
}: StudioRoomCardProps) {
  const palette = COLORS[color];
  const image = room.imageIds[0] ? imgUrl(imageBaseUrl, room.imageIds[0], 1000) : null;
  const tags = roomDetailTags(room.merchandising).slice(0, 5);
  const rate = room.rates[0];
  const nightlyRate = rate?.perNightGross ?? room.fromGross;

  return (
    <article
      className={`flex w-full flex-col items-stretch gap-6 rounded-[16px] border-2 p-5 shadow-sm transition hover:shadow-md sm:p-6 lg:gap-8 ${
        layout === "right" ? "lg:flex-row-reverse " : "lg:flex-row "
      }${palette.card}`}
    >
      <div className="flex min-h-[260px] w-full shrink-0 flex-col self-stretch sm:min-h-[300px] lg:min-h-[336px] lg:w-[46%] xl:w-[48%]">
        <div className="group relative h-full w-full flex-1 overflow-hidden rounded-[17px] bg-[#D7D0C7]">
          {image ? (
            <img
              src={image}
              alt={room.name}
              className="absolute inset-0 block h-full w-full select-none object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center font-bianco text-xs uppercase tracking-widest text-[#4E332D]/50">
              Room imagery loading
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch py-0.5">
        <div>
          <p className={`mb-2 font-bianco text-[10px] font-bold uppercase tracking-[2px] ${palette.tagline}`}>
            {room.merchandising?.family || room.property || "Catskills"}
          </p>
          <h2 className={`font-brothers text-2xl font-bold uppercase leading-[1.05] tracking-[0.72px] sm:text-3xl md:text-[34px] ${palette.title}`}>
            {room.name}
          </h2>
          <p className={`mb-4 mt-3 line-clamp-4 font-editorial text-xs leading-[22px] sm:text-sm sm:leading-[23px] ${palette.body}`}>
            {room.description || "A distinct Urban Cowboy room experience with live availability for your dates."}
          </p>

          <div className="mb-4 flex flex-wrap items-center gap-2 py-1">
            <span className={`rounded-[12px] border px-2.5 py-1 font-brothers text-[10px] font-bold uppercase tracking-[1px] ${palette.badge}`}>
              Sleeps {room.capacity}
            </span>
            {tags.map((tag) => (
              <span
                key={tag.key}
                className={`rounded-[12px] border px-2.5 py-1 font-brothers text-[10px] font-bold uppercase tracking-[1px] ${
                  tag.key === "dog" || tag.key === "21plus" ? palette.accent : palette.badge
                }`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-current/15 pt-3">
          <div className="flex flex-wrap items-center gap-3">
            {onSelectRoom && (
              <button
                type="button"
                onClick={() => onSelectRoom(room)}
                className={`rounded-[17px] px-5 py-2.5 font-brothers text-[11px] font-bold uppercase tracking-[1.1px] shadow-sm transition active:scale-95 ${palette.select}`}
              >
                Select Room
              </button>
            )}
            {onOpenRoomDetails && (
              <button
                type="button"
                onClick={() => onOpenRoomDetails(room)}
                className={`rounded-[17px] border px-5 py-2 font-brothers text-[11px] font-bold uppercase tracking-[1.1px] transition-colors ${palette.details}`}
              >
                View Details
              </button>
            )}
          </div>

          <div className={`text-right font-brothers text-lg sm:text-xl md:text-2xl ${palette.price}`}>
            {nightlyRate !== null && nightlyRate !== undefined
              ? `from ${money(nightlyRate, rate?.currency ?? "USD")}/night`
              : "Check rate"}
          </div>
        </div>
      </div>
    </article>
  );
}
