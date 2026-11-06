export type BuildingIconName =
  | "Default"
  | "Alpine"
  | "SlideMountain"
  | "Ralphs"
  | "Chalet"
  | "ForestHaus"
  | "MountianViewHaus"
  | "EstonianSauna"
  | "Cabin"
  | "OpasCabin";

export interface BuildingIconProps {
  buildingName?: BuildingIconName;
  className?: string;
  alt?: string;
  decorative?: boolean;
  loading?: "eager" | "lazy";
}

const BUILDING_ICON_CONFIG: Record<
  BuildingIconName,
  { src: string; heightClass: string; label: string }
> = {
  Default: {
    src: "/assets/icons/buildings/lodge.svg",
    heightClass: "h-[154.88px]",
    label: "Building",
  },
  Alpine: {
    src: "/assets/icons/buildings/alpine.svg",
    heightClass: "h-[144.028px]",
    label: "Alpine",
  },
  SlideMountain: {
    src: "/assets/icons/buildings/slide_mountain_haus.svg",
    heightClass: "h-[196.149px]",
    label: "Slide Mountain Haus",
  },
  Ralphs: {
    src: "/assets/icons/buildings/ralphs_bar_bowling.svg",
    heightClass: "h-[130.089px]",
    label: "Ralph's Bar and Bowling",
  },
  Chalet: {
    src: "/assets/icons/buildings/chalet.svg",
    heightClass: "h-[144.476px]",
    label: "Chalet",
  },
  ForestHaus: {
    src: "/assets/icons/buildings/forest_haus.svg",
    heightClass: "h-[228.762px]",
    label: "Forest Haus",
  },
  MountianViewHaus: {
    src: "/assets/icons/buildings/mountian_view_haus.svg",
    heightClass: "h-[131.991px]",
    label: "Mountain View Haus",
  },
  EstonianSauna: {
    src: "/assets/icons/buildings/estonian_sauna.svg",
    heightClass: "h-[171.469px]",
    label: "Estonian Sauna",
  },
  Cabin: {
    src: "/assets/icons/buildings/cabin.svg",
    heightClass: "h-[171.342px]",
    label: "Cabin",
  },
  OpasCabin: {
    src: "/assets/icons/buildings/opas_cabin.svg",
    heightClass: "h-[192.172px]",
    label: "Opa's Cabin",
  },
};

/**
 * Figma BuildingIcon component set (1352:9306).
 *
 * Variant names and geometry intentionally mirror the Figma component set,
 * including the source spelling "MountianViewHaus".
 */
export function BuildingIcon({
  buildingName = "Default",
  className = "",
  alt,
  decorative = true,
  loading = "lazy",
}: BuildingIconProps) {
  const config = BUILDING_ICON_CONFIG[buildingName];

  return (
    <div
      data-figma-node="1352:9306"
      data-building-name={buildingName}
      className={["flex items-center justify-center", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={["relative w-[283px] shrink-0", config.heightClass].join(" ")}>
        <img
          src={config.src}
          alt={decorative ? "" : alt ?? config.label + " architectural illustration"}
          aria-hidden={decorative || undefined}
          loading={loading}
          className="absolute inset-0 block size-full max-w-none object-contain"
        />
      </div>
    </div>
  );
}

export default BuildingIcon;
