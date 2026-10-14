import { tourIconForTitle } from "../lib/tourIconFallback.ts";
import { ROOMS, ROOM_IMAGE_ASSETS as A } from '../data/hotelData.ts';
import type { JourneyRoom } from './data.ts';

export type TourIcon = 'bed' | 'tub' | 'outdoor-tub' | 'window' | 'seat' | 'stove' | 'robes' | 'speaker' | 'shower' | 'floors' | 'desk' | 'balcony';
export interface PhotoHighlight {
  id: string;
  x: number;
  y: number;
  title: string;
  note: string;
  icon: TourIcon;
  amenityId?: string;
  iconPath?: string | null;
  longNote?: string;
}

// Coordinates belong to a photograph, not a room: reused demo media must
// never inherit pins from another camera angle.
export const PHOTO_HIGHLIGHTS: Record<string, PhotoHighlight[]> = {
  [A.ALPINE_BATHING_SUITE]: [
    { id: 'tub', x: 38, y: 58, title: 'Clawfoot soaking tub', note: 'A long soak, with the woods for company.', icon: 'tub' },
    { id: 'window', x: 32, y: 45, title: 'Forest picture window', note: 'Watch the mountain light change through the day.', icon: 'window' },
    { id: 'bed', x: 78, y: 68, title: 'Mountain rest', note: 'Patterned bedding and warm timber surroundings.', icon: 'bed' },
    { id: 'lounge', x: 10, y: 75, title: 'A quiet sitting nook', note: 'Settle in for a slow afternoon.', icon: 'seat' },
  ],
  [A.ALPINE_HEADBOARD]: [
    { id: 'bed', x: 50, y: 42, title: 'Handcrafted headboard', note: 'Timber geometry and hand-printed pattern.', icon: 'bed' },
    { id: 'blanket', x: 50, y: 82, title: 'Heritage wool accents', note: 'Cowboy patterns, layered for mountain rest.', icon: 'robes' },
  ],
  [A.ALPINE_PENTHOUSE_COPPER_TUB]: [
    { id: 'tub', x: 50, y: 68, title: 'Copper soaking tub', note: 'Hand-hammered copper, made for lingering.', icon: 'tub' },
    { id: 'window', x: 50, y: 42, title: 'Mountain panorama', note: 'A changing canopy beyond the glass.', icon: 'window' },
    { id: 'stove', x: 92, y: 78, title: 'By the fire', note: 'A warm corner after your soak.', icon: 'stove' },
  ],
  [A.WALDEN_FOREST_BATHING_SUITE]: [
    { id: 'deck', x: 70, y: 40, title: 'Into the woods', note: 'An open doorway onto the secluded soaking deck.', icon: 'balcony' },
    { id: 'lounge', x: 25, y: 55, title: 'Secluded sitting area', note: 'A patterned nook for conversation and quiet.', icon: 'seat' },
    { id: 'bed', x: 80, y: 85, title: 'Woodland rest', note: 'Wake with the woods just outside.', icon: 'bed' },
  ],
  [A.WALDEN_SUNRISE_BATHING_SUITE]: [
    { id: 'tub', x: 67, y: 80, title: 'Cedar soaking ritual', note: 'A quiet soak in the mountain air.', icon: 'outdoor-tub' },
    { id: 'view', x: 32, y: 30, title: 'Open-air forest views', note: 'The trees and mountain light set the pace.', icon: 'window' },
  ],
  [A.LODGE_PENTHOUSE_BEDROOM]: [
    { id: 'bed', x: 51, y: 64, title: 'Handcrafted branch headboard', note: 'Black-willow branches bring the forest indoors.', icon: 'bed' },
  ],
  [A.LODGE_PENTHOUSE_LIVING_ROOM]: [
    { id: 'lounge', x: 52, y: 68, title: 'Room to gather', note: 'Settle into the private living parlor.', icon: 'seat' },
    { id: 'window', x: 50, y: 42, title: 'Forest-facing windows', note: 'A wall of glass brings the trees into view.', icon: 'window' },
    { id: 'ceiling', x: 29, y: 16, title: 'Vaulted timber ceiling', note: 'Warm timber overhead, with room to breathe.', icon: 'window' },
  ],
};

export function roomAmenities(room: JourneyRoom): { id?: string; title: string; icon: TourIcon; iconPath?: string | null; note?: string | null; longNote?: string | null }[] {
  const features = ROOMS.find((r) => r.id === room.id)?.features ?? room.highlights;

  if (room.cmsAmenities) return room.cmsAmenities.map((amenity) => ({
    id: amenity.id,
    title: amenity.shortName,
    icon: tourIconForTitle(amenity.name),
    iconPath: amenity.iconPath,
    note: amenity.shortDescription,
    longNote: amenity.longDescription,
  }));
  return features.map((title) => ({ title, icon: tourIconForTitle(title) }));
}