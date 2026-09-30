import type { MatchInterest } from "@/types/merchandising";

type Artwork = {
  id: MatchInterest;
  label: string;
  description: string;
  icon: string;
  selectedIcon: string;
  labelArt: string;
  selectedLabelArt: string;
};

export const PREFERENCE_OPTIONS: Artwork[] = [
  { id: "iconTub", label: "Iconic Copper Tub", description: "The signature indoor soaking experience", icon: "/assets/icons/amenities/buttons/copper_clawfoot_soaking_tub.svg", selectedIcon: "/assets/icons/amenities/detailed/copper_clawfoot_soaking_tub.svg", labelArt: "/assets/labels/copper-tub-label-unselected.svg", selectedLabelArt: "/assets/labels/copper-tub-label-selected.svg" },
  { id: "scenic", label: "Scenic Views", description: "Mountain, forest, and valley views", icon: "/assets/icons/amenities/buttons/peak_balcony_mountian_view.svg", selectedIcon: "/assets/simple-icons/peak_balcony_mountians.svg", labelArt: "/assets/labels/scenic-views-label-unselected.svg", selectedLabelArt: "/assets/labels/scenic-views-label-selected.svg" },
  { id: "outdoorSoak", label: "Soak Outside", description: "A cedar tub in the open mountain air", icon: "/assets/icons/amenities/buttons/outdoor_cedar_soaking_tub.svg", selectedIcon: "/assets/outdoor-cedar-soaking-tub.png", labelArt: "/assets/labels/soak-outside-label.svg", selectedLabelArt: "/assets/labels/soak-outside-label.svg" },
  { id: "simpleCozy", label: "Simple + Cozy", description: "A warm, straightforward room to land in", icon: "/assets/icons/amenities/buttons/letter_writing_desk.svg", selectedIcon: "/assets/simple-icons/cast_iron_wood_stove.svg", labelArt: "/assets/labels/simple-cozy-label-unselected.svg", selectedLabelArt: "/assets/labels/simple-cozy-label-selected.svg" },
  { id: "ownPlace", label: "My Own Place", description: "More privacy and room to spread out", icon: "/assets/icons/amenities/buttons/cabin.svg", selectedIcon: "/assets/icons/amenities/buildings/cabin.svg", labelArt: "/assets/labels/my-own-place-label-unselected.svg", selectedLabelArt: "/assets/labels/my-own-place-label-selected.svg" },
  { id: "social", label: "Spaces to Gather", description: "A stay made for time together", icon: "/assets/icons/amenities/buttons/separate_living_room.svg", selectedIcon: "/assets/simple-icons/separate_living_room.svg", labelArt: "/assets/labels/spaces-to-gather-label-unselected.svg", selectedLabelArt: "/assets/labels/spaces-to-gather-label-selected.svg" },
];

export function PreferenceIconButton({ option, selected, disabled, onToggle }: { option: Artwork; selected: boolean; disabled?: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={option.label + ": " + option.description}
      disabled={disabled}
      onClick={onToggle}
      className={"flex aspect-square w-full max-w-[212px] items-center border p-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BE5B35] focus-visible:ring-offset-4 focus-visible:ring-offset-[#59352F] " + (selected ? "border-[#BE5B35] shadow-[0_0_0_2px_#BE5B35]" : "border-[#715C57] hover:border-[#D1C9BE]") + (disabled ? " cursor-not-allowed opacity-35" : " cursor-pointer")}
    >
      <span className={"flex h-full w-full flex-col items-center justify-center gap-2.5 border transition-colors " + (selected ? "border-[#4E332D] bg-white/95" : "border-white/10 bg-white/75")}>
        <img src={selected ? option.selectedIcon : option.icon} alt="" aria-hidden="true" className={"h-[46%] max-w-[85%] object-contain transition-opacity " + (selected ? "opacity-100" : "opacity-45")} />
        <img src={selected ? option.selectedLabelArt : option.labelArt} alt="" aria-hidden="true" className={"h-[22%] w-[62%] object-contain transition-opacity " + (selected ? "opacity-100" : "opacity-55")} />
      </span>
    </button>
  );
}
