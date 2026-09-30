import type { MatchInterest } from '../../../../types';

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
  {
    id: 'iconTub',
    label: 'Iconic Copper Tub',
    description: 'The signature indoor soaking experience',
    icon: '/assets/copper-tub-illustration-unselected.png',
    selectedIcon: '/assets/copper-tub-illustration-selected.png',
    labelArt: '/assets/copper-tub-label-unselected.svg',
    selectedLabelArt: '/assets/copper-tub-label-selected.svg'
  },
  {
    id: 'scenic',
    label: 'Scenic Views',
    description: 'Mountain, forest, and valley views',
    icon: '/assets/scenic-views-illustration-unselected.png',
    selectedIcon: '/assets/scenic-views-illustration-selected.png',
    labelArt: '/assets/scenic-views-label-unselected.svg',
    selectedLabelArt: '/assets/scenic-views-label-selected.svg'
  },
  {
    id: 'outdoorSoak',
    label: 'Soak Outside',
    description: 'A cedar tub in the open mountain air',
    icon: '/assets/soak-outside-illustration-unselected.png',
    selectedIcon: '/assets/outdoor-cedar-soaking-tub.png',
    labelArt: '/assets/soak-outside-label.svg',
    selectedLabelArt: '/assets/soak-outside-label.svg'
  },
  {
    id: 'simpleCozy',
    label: 'Simple + Cozy',
    description: 'A warm, straightforward room to land in',
    icon: '/assets/simple-cozy-illustration-unselected.png',
    selectedIcon: '/assets/simple-cozy-illustration-selected.png',
    labelArt: '/assets/simple-cozy-label-unselected.svg',
    selectedLabelArt: '/assets/simple-cozy-label-selected.svg'
  },
  {
    id: 'ownPlace',
    label: 'My Own Place',
    description: 'More privacy and room to spread out',
    icon: '/assets/my-own-place-illustration-unselected.png',
    selectedIcon: '/assets/the-cabin.png',
    labelArt: '/assets/my-own-place-label-unselected.svg',
    selectedLabelArt: '/assets/my-own-place-label-selected.svg'
  },
  {
    id: 'social',
    label: 'Spaces to Gather',
    description: 'A stay made for time together',
    icon: '/assets/spaces-to-gather-illustration-unselected.png',
    selectedIcon: '/assets/spaces-to-gather-illustration-selected.png',
    labelArt: '/assets/spaces-to-gather-label-unselected.svg',
    selectedLabelArt: '/assets/spaces-to-gather-label-selected.svg'
  }
];

interface Props {
  option: Artwork;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function PreferenceIconButton({ option, selected, disabled, onToggle }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${option.label}: ${option.description}`}
      disabled={disabled}
      onClick={onToggle}
      className={`flex aspect-square w-full max-w-[212px] items-center border p-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BE5B35] focus-visible:ring-offset-4 focus-visible:ring-offset-[#59352F] ${
        selected
          ? 'border-[#BE5B35] shadow-[0_0_0_2px_#BE5B35]'
          : 'border-[#715C57] hover:border-[#D1C9BE]'
      } ${disabled ? 'cursor-not-allowed opacity-35' : 'cursor-pointer'}`}
    >
      <span
        className={`flex h-full w-full flex-col items-center justify-center gap-2.5 border transition-colors ${
          selected ? 'border-[#4E332D] bg-white/95' : 'border-white/10 bg-white/75'
        }`}
      >
        <img
          src={selected ? option.selectedIcon : option.icon}
          alt=""
          aria-hidden="true"
          className={`h-[46%] max-w-[85%] object-contain transition-opacity ${selected ? 'opacity-100' : 'opacity-45'}`}
        />
        <img
          src={selected ? option.selectedLabelArt : option.labelArt}
          alt=""
          aria-hidden="true"
          className={`h-[22%] w-[62%] object-contain transition-opacity ${selected ? 'opacity-100' : 'opacity-55'}`}
        />
      </span>
    </button>
  );
}

