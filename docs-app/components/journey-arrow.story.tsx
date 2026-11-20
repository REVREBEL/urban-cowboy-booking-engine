"use client";

import { PhotoTourArrow } from "../../src/journey/PhotoTourArrow";
import { defineStory } from "../lib/story";

const directions = ["up", "down", "left", "right"] as const;
const imageBaseUrl = process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? "";

export const photoTourArrowStory = defineStory({
  Component: PhotoTourArrow,
  args: { initial: { direction: "right", size: 28, chevron: false, imageBaseUrl } },
});

function ArrowVariants() {
  return (
    <div className="w-full space-y-5 rounded-xl bg-paper p-5 text-smoke">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Image arrows</p>
        <div className="flex flex-wrap gap-6">
          {directions.map((direction) => (
            <div key={direction} className="flex flex-col items-center gap-1">
              <PhotoTourArrow direction={direction} size={28} imageBaseUrl={imageBaseUrl} />
              <span className="text-xs">{direction}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Inline chevrons</p>
        <div className="flex flex-wrap gap-6">
          {directions.map((direction) => (
            <div key={direction} className="flex flex-col items-center gap-1">
              <PhotoTourArrow direction={direction} size={28} chevron imageBaseUrl={imageBaseUrl} />
              <span className="text-xs">{direction}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Sizes</p>
        <div className="flex flex-wrap items-end gap-6">
          {[16, 20, 24, 32, 48].map((size) => (
            <div key={size} className="flex flex-col items-center gap-1">
              <PhotoTourArrow direction="right" size={size} chevron imageBaseUrl={imageBaseUrl} />
              <span className="text-xs">{size}px</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export const photoTourArrowVariantsStory = defineStory({
  Component: ArrowVariants,
  args: { initial: {} },
});
