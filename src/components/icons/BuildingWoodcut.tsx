import React from 'react';
import type { RoomTypeGroupKey } from '@/types/accommodations';
import { ROOM_TYPE_GROUP_PRESENTATION } from '@/data/roomTypeGroupPresentation';
import { roomTypeGroupName } from '@/data/roomTypeGroups';

export interface BuildingWoodcutProps {
  group: RoomTypeGroupKey;
  className?: string;
  alt?: string;
  decorative?: boolean;
  loading?: 'eager' | 'lazy';
}

/**
 * Canonical renderer for all nine Cowboy Room Type Group building illustrations.
 * Artwork paths live in ROOM_TYPE_GROUP_PRESENTATION so there is one registry
 * for Alpine, Walden, Lodge, Forest House, Cabin, Chalet, Opa's, Slide Mountain,
 * and Mountain View.
 */
export const BuildingWoodcut: React.FC<BuildingWoodcutProps> = ({
  group,
  className = 'w-56 h-36',
  alt,
  decorative = false,
  loading = 'eager',
}) => {
  const artwork = ROOM_TYPE_GROUP_PRESENTATION[group].iconPath;
  const resolvedAlt = decorative
    ? ''
    : alt ?? `${roomTypeGroupName(group)} Architectural Illustration`;

  return (
    <img
      src={artwork}
      alt={resolvedAlt}
      aria-hidden={decorative || undefined}
      className={`${className} object-contain select-none transition-transform duration-300 hover:scale-[1.02]`}
      loading={loading}
    />
  );
};

export default BuildingWoodcut;
