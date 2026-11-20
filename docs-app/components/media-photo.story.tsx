"use client";

import { Photo } from "../../src/components/media/photo";
import { defineStory } from "../lib/story";

const imageBaseUrl = process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? "";
const localPhoto = `${imageBaseUrl}/assets/icons/buildings/lodge.svg`;

export const photoStory = defineStory({
  Component: Photo,
  args: {
    initial: {
      src: localPhoto,
      alt: "The Lodge building illustration",
      className: "w-72 h-48 object-contain rounded-xl border border-border p-4",
    },
  },
});

function PhotoStates() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      <figure className="space-y-2">
        <Photo
          src={localPhoto}
          alt="Loaded local asset"
          className="size-full min-h-40 rounded-xl border border-border object-contain p-3"
        />
        <figcaption className="text-xs text-muted-foreground">Loaded local asset</figcaption>
      </figure>
      <figure className="space-y-2">
        <Photo
          src={null}
          alt="Missing source"
          className="min-h-40 rounded-xl"
        />
        <figcaption className="text-xs text-muted-foreground">Missing source → gradient</figcaption>
      </figure>
      <figure className="space-y-2">
        <Photo
          src={`${imageBaseUrl}/assets/icons/buildings/does-not-exist.svg`}
          alt="Broken source"
          className="min-h-40 rounded-xl"
        />
        <figcaption className="text-xs text-muted-foreground">Broken source → gradient</figcaption>
      </figure>
    </div>
  );
}

export const photoStatesStory = defineStory({
  Component: PhotoStates,
  args: { initial: {} },
});
