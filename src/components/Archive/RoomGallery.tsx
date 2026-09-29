import { ChevronLeft, ChevronRight, Expand, ImageIcon } from "lucide-react";
import { useState } from "react";

import type { RoomPhoto } from "@/lib/booking/photos";
import { cn } from "@/lib/utils";

const controlClass =
  "flex size-10 items-center justify-center rounded-full bg-background/95 text-foreground shadow-[0_2px_4px_0_rgb(0_0_0_/_0.06),0_1px_2px_0_rgb(0_0_0_/_0.03)] backdrop-blur transition-transform hover:scale-105 active:scale-95";

/**
 * Cowboy room gallery: the photo sits on its own blurred backdrop so any
 * aspect ratio fills the frame, with linen pill controls over the top.
 */
export function RoomGallery({
  photos,
  className,
  contain = false,
  onExpand,
  priority = false,
}: {
  photos: RoomPhoto[];
  className?: string | undefined;
  /** Letterbox the photo over a blurred copy of itself instead of cropping. */
  contain?: boolean;
  onExpand?: (() => void) | undefined;
  priority?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const current = photos[index] ?? photos[0];

  if (!current) {
    return (
      <div
        className={cn("flex items-center justify-center bg-muted", className ?? "h-64")}
      >
        <ImageIcon className="size-7 text-muted-foreground/60" aria-hidden="true" />
      </div>
    );
  }

  const step = (direction: 1 | -1) =>
    setIndex((prev) => (prev + direction + photos.length) % photos.length);

  return (
    <div className={cn("group relative overflow-hidden bg-muted", className ?? "h-64")}>
      {contain && (
        <img
          src={current.url}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full scale-110 object-cover blur-2xl brightness-90"
        />
      )}
      <img
        src={current.url}
        alt={current.alt}
        loading={priority ? "eager" : "lazy"}
        className={cn(
          "relative size-full",
          contain ? "object-contain" : "object-cover",
        )}
      />

      {photos.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => step(-1)}
            className={cn(controlClass, "absolute left-4 top-1/2 -translate-y-1/2")}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => step(1)}
            className={cn(controlClass, "absolute right-4 top-1/2 -translate-y-1/2")}
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1.5 shadow-sm backdrop-blur">
            {photos.map((photo, position) => (
              <button
                key={photo.url}
                type="button"
                aria-label={`Go to image ${position + 1}`}
                aria-current={position === index}
                onClick={() => setIndex(position)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  position === index
                    ? "w-[18px] bg-foreground"
                    : "w-1.5 bg-foreground/30 hover:bg-foreground/60",
                )}
              />
            ))}
          </div>
        </>
      )}

      {onExpand && (
        <button
          type="button"
          aria-label="View images full screen"
          onClick={onExpand}
          className={cn(controlClass, "absolute right-4 top-4")}
        >
          <Expand className="size-4" />
        </button>
      )}
    </div>
  );
}
