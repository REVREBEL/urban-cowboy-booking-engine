import {
  OneBed, CopperClawfootSoakingTub, OutdoorCedarSoakingTub,
  ArchitecturalDiamondWindow, SittingArea, CastIronWoodStove,
  CowboyRobe, MarshallSpeaker, WalkinRainShower, HeatedFloors,
  LetterWritingDesk, PrivateBalcony,
} from '@/components/icons/generated/amenities/simple';
import type { TourIcon as IconName } from '../../journey/tour';

const ICONS = {
  bed: OneBed, tub: CopperClawfootSoakingTub, 'outdoor-tub': OutdoorCedarSoakingTub,
  window: ArchitecturalDiamondWindow, seat: SittingArea, stove: CastIronWoodStove,
  robes: CowboyRobe, speaker: MarshallSpeaker, shower: WalkinRainShower,
  floors: HeatedFloors, desk: LetterWritingDesk, balcony: PrivateBalcony,
};

export function TourIcon({ name, className = 'size-10' }: { name: IconName; className?: string }) {
  const Icon = ICONS[name];
  return <Icon className={className} aria-hidden="true" />;
}