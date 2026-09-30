import { useEffect, useState } from "react";
import type { ShapedRoom } from "@/types/mews";
import { imgUrl } from "@/lib/format";
import { roomDetailTags } from "@/lib/roomTags";

type StudioRoomDetailModalProps = {
  room: ShapedRoom | null;
  imageBaseUrl: string;
  onClose: () => void;
  onProceedToRates: (room: ShapedRoom) => void;
};

export function StudioRoomDetailModal({ room, imageBaseUrl, onClose, onProceedToRates }: StudioRoomDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => setActiveImageIndex(0), [room?.categoryId]);

  if (!room) return null;
  const images = room.imageIds\n    .map((id) => imgUrl(imageBaseUrl, id, 1200))\n    .filter((image): image is string => Boolean(image));
  const tags = roomDetailTags(room.merchandising);
  const nightly = room.rates[0]?.perNightGross ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm sm:p-6">
      <div className="texture-linen relative my-8 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[36px] border-4 border-[#4E332D] bg-[#FAF9F9] shadow-2xl">
        <div className="flex items-center justify-between border-b-2 border-[#4E332D]/20 bg-[#EBE8E0] px-6 py-4">
          <span className="font-woodblock text-xs font-bold uppercase tracking-widest text-[#9A5636]">
            {(room.merchandising?.family || room.property || "Catskills").toUpperCase()}
          </span>
          <button type="button" onClick={onClose} aria-label="Close room details" className="grid h-8 w-8 place-items-center rounded-full border border-[#4E332D]/20 bg-white text-lg text-[#4E332D] hover:bg-[#EBE8E0]">×</button>
        </div>

        <div className="space-y-8 overflow-y-auto p-6 sm:p-8">
          <div>
            <div className="relative mb-3 h-72 overflow-hidden rounded-2xl border-2 border-[#4E332D] bg-[#D7D0C7] shadow-md sm:h-96">
              {images.length > 0 ? (
                <img src={images[activeImageIndex]} alt={room.name + " photo " + (activeImageIndex + 1)} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center font-bianco text-xs uppercase tracking-widest text-[#4E332D]/50">Room imagery loading</div>
              )}
              {images.length > 0 && (
                <div className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-[#221C18]/90 px-3.5 py-1 font-woodblock text-xs uppercase tracking-wider text-white">
                  Photo {activeImageIndex + 1} of {images.length}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {images.map((image, index) => (
                  <button key={image} type="button" onClick={() => setActiveImageIndex(index)} className={"relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition " + (activeImageIndex === index ? "scale-105 border-[#4E332D] shadow-sm" : "border-transparent opacity-60 hover:opacity-100")}>
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between gap-6 border-b border-[#4E332D]/15 pb-6 md:flex-row md:items-start">
            <div>
              <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide text-[#221C18] sm:text-4xl">{room.name}</h2>
              <p className="mt-2 font-editorial text-base italic text-[#9A5636]">{room.description}</p>
            </div>
            <div className="shrink-0 rounded-2xl border-2 border-[#4E332D] bg-[#FAF9F9] p-4 text-right">
              <span className="block font-woodblock text-[10px] uppercase tracking-widest text-[#73716D]">Live rate from</span>
              <span className="font-display text-3xl font-bold text-[#4E332D]">{nightly !== null ? "$" + Math.round(nightly) : "—"}</span>
              <span className="block text-[10px] text-[#73716D]">per night before final quote</span>
            </div>
          </div>

          <section>
            <h3 className="mb-4 font-woodblock text-xs font-bold uppercase tracking-[0.25em] text-[#8A7E74]">Room Details</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#D1C9BE] bg-white p-4">
                <span className="block font-bianco text-[10px] uppercase tracking-wider text-[#73716D]">Sleeps</span>
                <strong className="font-brothers text-lg text-[#4E332D]">{room.capacity}</strong>
              </div>
              <div className="rounded-xl border border-[#D1C9BE] bg-white p-4">
                <span className="block font-bianco text-[10px] uppercase tracking-wider text-[#73716D]">Available</span>
                <strong className="font-brothers text-lg text-[#4E332D]">{room.availableRoomCount}</strong>
              </div>
              <div className="rounded-xl border border-[#D1C9BE] bg-white p-4">
                <span className="block font-bianco text-[10px] uppercase tracking-wider text-[#73716D]">Room Type</span>
                <strong className="font-brothers text-sm uppercase text-[#4E332D]">{room.spaceType || "Room"}</strong>
              </div>
            </div>
          </section>

          {tags.length > 0 && (
            <section className="border-t border-[#4E332D]/15 pt-6">
              <h3 className="mb-5 font-woodblock text-xs font-bold uppercase tracking-[0.25em] text-[#8A7E74]">Signature Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag.key} className="rounded-full border border-[#4E332D] px-3 py-1.5 font-brothers text-[10px] font-bold uppercase tracking-wider text-[#4E332D]">{tag.label}</span>
                ))}
              </div>
            </section>
          )}

          <div className="flex justify-end border-t border-[#4E332D]/15 pt-6">
            <button type="button" onClick={() => onProceedToRates(room)} className="rounded-full bg-[#9A5636] px-7 py-3 font-brothers text-xs font-bold uppercase tracking-widest text-[#EBE8E0] hover:bg-[#783224]">
              See Rates →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
