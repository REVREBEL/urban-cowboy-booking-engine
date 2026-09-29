import { ArrowRight } from "lucide-react";

import { RoomGallery } from "@/components/booking/RoomGallery";
import { roomPhotos } from "@/lib/booking/photos";
import type { Room } from "@/lib/booking/rooms";
import { cn } from "@/lib/utils";

function bedText(room: Room) {
  const bed = room.features.find((feature) => feature.kind === "bed");
  return bed ? bed.label : `Sleeps ${room.maxAdults + room.maxChildren}`;
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex items-baseline gap-2">
      <span className="eyebrow text-[10px] text-muted-foreground">{label}</span>
      <span className="text-sm text-umber">{value}</span>
    </p>
  );
}

export function RoomCard({
  room,
  label,
  reasons,
  featured = false,
  onViewDetails,
  onSelect,
}: {
  room: Room;
  label?: string | undefined;
  reasons?: string[] | undefined;
  featured?: boolean | undefined;
  onViewDetails: () => void;
  onSelect: () => void;
}) {
  const photos = roomPhotos(room.id);

  return (
    <article
      className={cn(
        "flex h-full flex-col gap-6 border bg-linen p-6 pt-6",
        featured ? "border-2 border-copper" : "border border-ink/15",
      )}
    >
      <div className="relative">
        <RoomGallery
          photos={photos}
          className="aspect-[3/2] w-full"
          priority={featured}
        />
        {label && (
          <span
            className={cn(
              "eyebrow absolute left-4 top-4 rounded-full px-3 py-1 text-[10px]",
              featured ? "bg-copper text-background" : "bg-background text-foreground",
            )}
          >
            {label}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-brand text-2xl leading-tight text-umber">
          {room.name}
        </h3>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <Spec label="People" value={String(room.maxAdults + room.maxChildren)} />
          <Spec label="Bed(s)" value={bedText(room)} />
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {room.blurb}
        </p>

        {reasons && reasons.length > 0 && (
          <ul className="space-y-1 border-l-2 border-copper/60 pl-3 text-sm text-foreground">
            {reasons.slice(0, 2).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-auto space-y-4">
        <p className="text-sm text-muted-foreground">
          From{" "}
          <span className="text-xl text-foreground">
            ${room.nightlyFrom}
          </span>{" "}
          per night
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onViewDetails}
            className="font-button rounded-full border border-umber px-5 py-2.5 text-xs text-umber transition-colors hover:bg-umber hover:text-background"
          >
            View details
          </button>
          <button
            type="button"
            onClick={onSelect}
            className="font-button flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs text-primary-foreground transition-opacity hover:opacity-90"
          >
            Select room
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
