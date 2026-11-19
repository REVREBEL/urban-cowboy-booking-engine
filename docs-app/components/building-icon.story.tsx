"use client";

import { BuildingIcon, type BuildingIconColor, type BuildingIconName } from "../../src/components/rooms/BuildingIcon";
import { defineStory } from "../lib/story";

const names: BuildingIconName[] = [
  "Default", "Alpine", "SlideMountain", "Ralphs", "Chalet",
  "ForestHaus", "MountianViewHaus", "EstonianSauna", "Cabin", "OpasCabin",
];
const colors: BuildingIconColor[] = ["Smoke", "Snow", "LakeForest", "Ash", "Alpine"];
const imageBaseUrl = process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? "";

export const buildingIconStory = defineStory({
  Component: BuildingIcon,
  args: { initial: { buildingName: "Default", color: "Smoke", imageBaseUrl } },
});

function BuildingIconVariants() {
  return (
    <div className="grid w-full grid-cols-2 gap-6 sm:grid-cols-4">
      {names.map((buildingName) => (
        <div key={buildingName} className="flex flex-col items-center gap-2">
          <BuildingIcon buildingName={buildingName} color="Smoke" imageBaseUrl={imageBaseUrl} />
          <span className="text-xs text-muted-foreground">{buildingName}</span>
        </div>
      ))}
    </div>
  );
}

export const buildingIconVariantsStory = defineStory({
  Component: BuildingIconVariants,
  args: { initial: {} },
});

function BuildingIconColors() {
  return (
    <div className="flex w-full flex-wrap gap-4">
      {colors.map((color) => (
        <div key={color} className="flex flex-col items-center gap-2">
          <BuildingIcon buildingName="Default" color={color} imageBaseUrl={imageBaseUrl} />
          <span className="text-xs text-muted-foreground">{color}</span>
        </div>
      ))}
    </div>
  );
}

export const buildingIconColorsStory = defineStory({
  Component: BuildingIconColors,
  args: { initial: {} },
});
