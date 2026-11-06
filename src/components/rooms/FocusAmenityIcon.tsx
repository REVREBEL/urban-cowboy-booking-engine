// src/components/rooms/FocusAmenityIcons.tsx
import React, { useState, useId } from 'react';

/**
 * Exact CSS Style Token from Figma design:
 * RGB(0.0938816, 0.2674481, 0.1551404) -> #184428
 */
export const FIGMA_STYLE_TOKENS = {
  primary: var(--primary),
  primaryMuted: '#2a5d3d',
  badgeBg: '#eef4f0',
  border: '#dce5de',
} as const;

export type AmenityGroup =
  | 'Room Feature'
  | 'Heating Element'
  | 'Kitchen Feature'
  | 'Basic Features'
  | 'Water Feature'
  | 'Bed Type Icon'
  | 'Badge'
  | 'Outdoor Connection';

export type AmenityIconSlug =
  // Badges (assets/icons/badges/features/)
  | 'wifi_badge'
  | 'family_friendly'
  | 'esopus_creek_access'
  | 'esopus_creek_access1'
  | 'dog_friendly'
  | 'direct_trail_access'
  | 'adults_only'
  // Heating Element (assets/icons/icons-simple/)
  | 'river_stone_hearth_fireplace'
  | 'cast_iron_wood_stove'
  | 'enameled_gas_fireplace'
  // Room Feature (assets/icons/icons-simple/)
  | 'walden_bathing_suite_den_alcove'
  | 'walden_bathing_suite_den'
  | 'opas_livingroom'
  | 'cabin_sitting_area'
  | 'slide_mountain_downstairs_livingroom'
  | 'chalet_upper_living_room'
  | 'lodge_penthouse_livingroom'
  | 'letter_writing_desk'
  | 'architectural_diamond_window'
  | 'marshall_speaker'
  | 'minibar'
  | 'alpine_bed_bear_pattern'
  | 'alpine_bed_southwest_pattern'
  | 'view_from_window'
  // Kitchen Feature (assets/icons/icons-simple/)
  | 'chalet_full_kitchen'
  | 'lodge_penthouse_private_bar'
  | 'full_kitchen'
  | 'opas_kitchen'
  | 'opas_kitchen_full_table'
  // Basic Features (assets/icons/icons-simple/)
  | 'cowboy_robe_dark'
  | 'cowboy_robe_light'
  | 'bath_amenities'
  | 'heated_floors'
  // Water Feature (assets/icons/icons-simple/)
  | 'copper_clawfoot_soaking_tub'
  | 'walkin_rain_shower'
  | 'outdoor_cedar_soaking_tub'
  // Bed Type (assets/icons/icons-simple/)
  | 'bed_lodge_penthouse'
  | 'bed_single_headboard'
  | 'single_bed'
  | 'bed_cabin'
  | 'bed_double_headboard'
  | 'two_beds'
  // Outdoor Connection (assets/icons/icons-simple/)
  | 'private_deck_or_porch'
  | 'patio_chairs_round'
  | 'patio_chairs_square'
  | 'walden_balcony';

export interface AmenityMetadata {
  slug: AmenityIconSlug;
  displayName: string;
  figmaName: string;
  group: AmenityGroup;
  assetPath: string;
  figmaId: string;
}

export const AMENITIES_REGISTRY: Record<AmenityIconSlug, AmenityMetadata> = {
  // Badges
  wifi_badge: {
    slug: 'wifi_badge',
    displayName: 'Wi-Fi Access',
    figmaName: 'Amenity Group=Badge, Icon Name=Wifi Access',
    group: 'Badge',
    assetPath: 'assets/icons/badges/features/wifi_badge.svg',
    figmaId: '349:13',
  },
  family_friendly: {
    slug: 'family_friendly',
    displayName: 'Family Friendly',
    figmaName: 'Amenity Group=Badge, Icon Name=Family Friendly',
    group: 'Badge',
    assetPath: 'assets/icons/badges/features/family_friendly.svg',
    figmaId: '349:11',
  },
  esopus_creek_access: {
    slug: 'esopus_creek_access',
    displayName: 'Esopus Creek Access',
    figmaName: 'Amenity Group=Badge, Icon Name=Esopus Creek Access',
    group: 'Badge',
    assetPath: 'assets/icons/badges/features/esopus_creek_access.svg',
    figmaId: '349:9',
  },
  esopus_creek_access1: {
    slug: 'esopus_creek_access1',
    displayName: 'Esopus Creek Access (Alt)',
    figmaName: 'Amenity Group=Badge, Icon Name=Esopus Creek Access 1',
    group: 'Badge',
    assetPath: 'assets/icons/badges/features/esopus_creek_access1.svg',
    figmaId: '349:9-alt',
  },
  dog_friendly: {
    slug: 'dog_friendly',
    displayName: 'Dog Friendly',
    figmaName: 'Amenity Group=Badge, Icon Name=Dog Friendly',
    group: 'Badge',
    assetPath: 'assets/icons/badges/features/dog_friendly.svg',
    figmaId: '349:7',
  },
  direct_trail_access: {
    slug: 'direct_trail_access',
    displayName: 'Direct Trailhead Access',
    figmaName: 'Amenity Group=Badge, Icon Name=Direct Trailhead Access',
    group: 'Badge',
    assetPath: 'assets/icons/badges/features/direct_trail_access.svg',
    figmaId: '349:5',
  },
  adults_only: {
    slug: 'adults_only',
    displayName: 'Adults Only',
    figmaName: 'Amenity Group=Badge, Icon Name=Adults Only',
    group: 'Badge',
    assetPath: 'assets/icons/badges/features/adults_only.svg',
    figmaId: '349:3',
  },

  // Heating Element
  river_stone_hearth_fireplace: {
    slug: 'river_stone_hearth_fireplace',
    displayName: 'River Stone Hearth Fireplace',
    figmaName: 'Amenity Group=Heating Element, Icon Name=River Stone Hearth FIreplace',
    group: 'Heating Element',
    assetPath: 'assets/icons/icons-simple/river_stone_hearth_fireplace.svg',
    figmaId: '349:27',
  },
  cast_iron_wood_stove: {
    slug: 'cast_iron_wood_stove',
    displayName: 'Cast Iron Wood Stove',
    figmaName: 'Amenity Group=Heating Element, Icon Name=Cast Iron Wood Stove',
    group: 'Heating Element',
    assetPath: 'assets/icons/icons-simple/cast_iron_wood_stove.svg',
    figmaId: '349:25',
  },
  enameled_gas_fireplace: {
    slug: 'enameled_gas_fireplace',
    displayName: 'Enameled Gas Fireplace',
    figmaName: 'Amenity Group=Heating Element, Icon Name=Enameled Gas Fireplace',
    group: 'Heating Element',
    assetPath: 'assets/icons/icons-simple/enameled_gas_fireplace.svg',
    figmaId: '1161:7809',
  },

  // Room Feature
  walden_bathing_suite_den_alcove: {
    slug: 'walden_bathing_suite_den_alcove',
    displayName: 'Walden Suite Den Alcove',
    figmaName: 'Amenity Group=Room Feature, Icon Name=Walden Bathing Suite Den Alcove',
    group: 'Room Feature',
    assetPath: 'assets/icons/icons-simple/walden_bathing_suite_den_alcove.svg',
    figmaId: '349:17',
  },
  walden_bathing_suite_den: {
    slug: 'walden_bathing_suite_den',
    displayName: 'Alpine Bathing Suite Den',
    figmaName: 'Amenity Group=Room Feature, Icon Name=Alpine Bathing Suite Den',
    group: 'Room Feature',
    assetPath: 'assets/icons/icons-simple/walden_bathing_suite_den.svg',
    figmaId: '1179:8410',
  },
  opas_livingroom: {
    slug: 'opas_livingroom',
    displayName: "Opa's Living Room",
    figmaName: 'Amenity Group=Room Feature, Icon Name=Opas Living Room',
    group: 'Room Feature',
    assetPath: 'assets/icons/icons-simple/opas_livingroom.svg',
    figmaId: '1179:8412',
  },
  cabin_sitting_area: {
    slug: 'cabin_sitting_area',
    displayName: 'Cabin Sitting Area',
    figmaName: 'Amenity Group=Room Feature, Icon Name=Cabin Sitting Area',
    group: 'Room Feature',
    assetPath: 'assets/icons/icons-simple/cabin_sitting_area.svg',
    figmaId: '1179:8426',
  },
  slide_mountain_downstairs_livingroom: {
    slug: 'slide_mountain_downstairs_livingroom',
    displayName: 'Slide Mountain Downstairs Living Room',
    figmaName: 'Amenity Group=Room Feature, Icon Name=Slide Mountain Downstair Living Room',
    group: 'Room Feature',
    assetPath: 'assets/icons/icons-simple/slide_mountain_downstairs_livingroom.svg',
    figmaId: '1179:8428',
  },
  chalet_upper_living_room: {
    slug: 'chalet_upper_living_room',
    displayName: 'Chalet Living Room',
    figmaName: 'Amenity Group=Room Feature, Icon Name=Chalet Living Room',
    group: 'Room Feature',
    assetPath: 'assets/icons/icons-simple/chalet_upper_living_room.svg',
    figmaId: '349:19',
  },
  lodge_penthouse_livingroom: {
    slug: 'lodge_penthouse_livingroom',
    displayName: 'Lodge Penthouse Living Room',
    figmaName: 'Amenity Group=Room Feature, Icon Name=Lodge Penthouse Living Room',
    group: 'Room Feature',
    assetPath: 'assets/icons/icons-simple/lodge_penthouse_livingroom.svg',
    figmaId: '349:23',
  },
  letter_writing_desk: {
    slug: 'letter_writing_desk',
    displayName: 'Letter-Writing Desk',
    figmaName: 'Amenity Group=Room Feature, Icon Name=Letter-Writing Desk',
    group: 'Room Feature',
    assetPath: 'assets/icons/icons-simple/letter_writing_desk.svg',
    figmaId: '349:21',
  },
  architectural_diamond_window: {
    slug: 'architectural_diamond_window',
    displayName: 'Diamond Window',
    figmaName: 'Amenity Group=Room Feature, Icon Name=Architectural Diamond Window',
    group: 'Room Feature',
    assetPath: 'assets/icons/icons-simple/architectural_diamond_window.svg',
    figmaId: '349:15',
  },
  marshall_speaker: {
    slug: 'marshall_speaker',
    displayName: 'Marshall Speaker',
    figmaName: 'Amenity Group=Room Feature, Icon Name=Marshall Speaker',
    group: 'Room Feature',
    assetPath: 'assets/icons/icons-simple/marshall_speaker.svg',
    figmaId: '899:1229',
  },
  minibar: {
    slug: 'minibar',
    displayName: 'In-Room Minibar',
    figmaName: 'Amenity Group=Room Feature, Icon Name=Minibar',
    group: 'Room Feature',
    assetPath: 'assets/icons/icons-simple/minibar.svg',
    figmaId: '1161:7577',
  },
  alpine_bed_bear_pattern: {
    slug: 'alpine_bed_bear_pattern',
    displayName: 'Bear Pattern Textile',
    figmaName: 'Amenity Group=Room Feature, Icon Name=Alpine Bathing Suite Bear Pattern',
    group: 'Room Feature',
    assetPath: 'assets/icons/icons-simple/alpine_bed_bear_pattern.svg',
    figmaId: '1161:7575',
  },
  alpine_bed_southwest_pattern: {
    slug: 'alpine_bed_southwest_pattern',
    displayName: 'Southwest Pattern Textile',
    figmaName: 'Amenity Group=Room Feature, Icon Name=Alpine Bathing Suite Southwest Pattern',
    group: 'Room Feature',
    assetPath: 'assets/icons/icons-simple/alpine_bed_southwest_pattern.svg',
    figmaId: '1186:559',
  },
  view_from_window: {
    slug: 'view_from_window',
    displayName: 'Scenic Mountain Views',
    figmaName: 'Amenity Group=Room Feature, Icon Name=Scenic Views',
    group: 'Room Feature',
    assetPath: 'assets/icons/icons-simple/view_from_window.svg',
    figmaId: '349:59',
  },

  // Kitchen Feature
  chalet_full_kitchen: {
    slug: 'chalet_full_kitchen',
    displayName: 'Chalet Full Kitchen',
    figmaName: 'Amenity Group=Kitchen Feature, Icon Name=Chalet Full Kitchen',
    group: 'Kitchen Feature',
    assetPath: 'assets/icons/icons-simple/chalet_full_kitchen.svg',
    figmaId: '349:35',
  },
  lodge_penthouse_private_bar: {
    slug: 'lodge_penthouse_private_bar',
    displayName: 'Penthouse Private Bar',
    figmaName: 'Amenity Group=Kitchen Feature, Icon Name=Lodge Penhouse Private Bar',
    group: 'Kitchen Feature',
    assetPath: 'assets/icons/icons-simple/lodge_penthouse_private_bar.svg',
    figmaId: '349:33',
  },
  full_kitchen: {
    slug: 'full_kitchen',
    displayName: 'Full Kitchen',
    figmaName: 'Amenity Group=Kitchen Feature, Icon Name=Full Kitchen',
    group: 'Kitchen Feature',
    assetPath: 'assets/icons/icons-simple/full_kitchen.svg',
    figmaId: '349:31',
  },
  opas_kitchen: {
    slug: 'opas_kitchen',
    displayName: "Opa's Kitchenette",
    figmaName: 'Amenity Group=Kitchen Feature, Icon Name=Ops Full Kitchen',
    group: 'Kitchen Feature',
    assetPath: 'assets/icons/icons-simple/opas_kitchen.svg',
    figmaId: '1179:8432',
  },
  opas_kitchen_full_table: {
    slug: 'opas_kitchen_full_table',
    displayName: "Opa's Kitchen Full Dining Table",
    figmaName: 'Amenity Group=Kitchen Feature, Icon Name=Ops Kitchen Full Table',
    group: 'Kitchen Feature',
    assetPath: 'assets/icons/icons-simple/opas_kitchen_full_table.svg',
    figmaId: '1179:8436',
  },

  // Basic Features
  cowboy_robe_dark: {
    slug: 'cowboy_robe_dark',
    displayName: 'Pendleton Robe (Dark)',
    figmaName: 'Amenity Group=Basic Features, Icon Name=Pendleton Robe Dark',
    group: 'Basic Features',
    assetPath: 'assets/icons/icons-simple/cowboy_robe_dark.svg',
    figmaId: '349:41',
  },
  cowboy_robe_light: {
    slug: 'cowboy_robe_light',
    displayName: 'Pendleton Robe (Light)',
    figmaName: 'Amenity Group=Basic Features, Icon Name=Pendleton Robe Light',
    group: 'Basic Features',
    assetPath: 'assets/icons/icons-simple/cowboy_robe_light.svg',
    figmaId: '899:7730',
  },
  bath_amenities: {
    slug: 'bath_amenities',
    displayName: 'Botanical Bath Amenities',
    figmaName: 'Amenity Group=Basic Features, Icon Name=Bath Amenities',
    group: 'Basic Features',
    assetPath: 'assets/icons/icons-simple/bath_amenities.svg',
    figmaId: '1171:8109',
  },
  heated_floors: {
    slug: 'heated_floors',
    displayName: 'Radiant Heated Floors',
    figmaName: 'Amenity Group=Basic Features, Icon Name=Heated Floors',
    group: 'Basic Features',
    assetPath: 'assets/icons/icons-simple/heated_floors.svg',
    figmaId: '349:45',
  },

  // Water Feature
  copper_clawfoot_soaking_tub: {
    slug: 'copper_clawfoot_soaking_tub',
    displayName: 'Copper / Clawfoot Tub',
    figmaName: 'Amenity Group=Water Feature, Icon Name=Copper / Clawfoot Soaking Tub',
    group: 'Water Feature',
    assetPath: 'assets/icons/icons-simple/copper_clawfoot_soaking_tub.svg',
    figmaId: '349:57',
  },
  walkin_rain_shower: {
    slug: 'walkin_rain_shower',
    displayName: 'Walk-in Rain Shower',
    figmaName: 'Amenity Group=Water Feature, Icon Name=Walkin Rain Shower',
    group: 'Water Feature',
    assetPath: 'assets/icons/icons-simple/walkin_rain_shower.svg',
    figmaId: '1171:8103',
  },
  outdoor_cedar_soaking_tub: {
    slug: 'outdoor_cedar_soaking_tub',
    displayName: 'Outdoor Cedar Soaking Tub',
    figmaName: 'Amenity Group=Water Feature, Icon Name=Outdoor Cedar Soaking Tub',
    group: 'Water Feature',
    assetPath: 'assets/icons/icons-simple/outdoor_cedar_soaking_tub.svg',
    figmaId: '349:55',
  },

  // Bed Type
  bed_lodge_penthouse: {
    slug: 'bed_lodge_penthouse',
    displayName: 'Penthouse King Bed',
    figmaName: 'Amenity Group=Bed Type Icon, Icon Name=Lodge Penthouse',
    group: 'Bed Type Icon',
    assetPath: 'assets/icons/icons-simple/bed_lodge_penthouse.svg',
    figmaId: '349:49',
  },
  bed_single_headboard: {
    slug: 'bed_single_headboard',
    displayName: 'Single Bed with Headboard',
    figmaName: 'Amenity Group=Bed Type Icon, Icon Name=Single Bed with Headboard',
    group: 'Bed Type Icon',
    assetPath: 'assets/icons/icons-simple/bed_single_headboard.svg',
    figmaId: '1161:7775',
  },
  single_bed: {
    slug: 'single_bed',
    displayName: 'Single Bed',
    figmaName: 'Amenity Group=Bed Type Icon, Icon Name=Single Bed',
    group: 'Bed Type Icon',
    assetPath: 'assets/icons/icons-simple/single_bed.svg',
    figmaId: '349:51',
  },
  bed_cabin: {
    slug: 'bed_cabin',
    displayName: 'Cabin Bed',
    figmaName: 'Amenity Group=Bed Type Icon, Icon Name=Cabin',
    group: 'Bed Type Icon',
    assetPath: 'assets/icons/icons-simple/bed_cabin.svg',
    figmaId: '1171:7925',
  },
  bed_double_headboard: {
    slug: 'bed_double_headboard',
    displayName: 'Double Beds with Headboard',
    figmaName: 'Amenity Group=Bed Type Icon, Icon Name=Double Beds with Headboard',
    group: 'Bed Type Icon',
    assetPath: 'assets/icons/icons-simple/bed_double_headboard.svg',
    figmaId: '1161:7660',
  },
  two_beds: {
    slug: 'two_beds',
    displayName: 'Two Beds',
    figmaName: 'Amenity Group=Bed Type Icon, Icon Name=Two Beds',
    group: 'Bed Type Icon',
    assetPath: 'assets/icons/icons-simple/two_beds.svg',
    figmaId: '349:53',
  },

  // Outdoor Connection
  private_deck_or_porch: {
    slug: 'private_deck_or_porch',
    displayName: 'Private Deck or Porch',
    figmaName: 'Amenity Group=Outdoor Connection, Icon Name=Private Deck or Porch',
    group: 'Outdoor Connection',
    assetPath: 'assets/icons/icons-simple/private_deck_or_porch.svg',
    figmaId: '349:39',
  },
  patio_chairs_round: {
    slug: 'patio_chairs_round',
    displayName: 'Round Bistro Patio Set',
    figmaName: 'Amenity Group=Outdoor Connection, Icon Name=Patio Chair Round',
    group: 'Outdoor Connection',
    assetPath: 'assets/icons/icons-simple/patio_chairs_round.svg',
    figmaId: '1171:8060',
  },
  patio_chairs_square: {
    slug: 'patio_chairs_square',
    displayName: 'Square Adirondack Patio Chairs',
    figmaName: 'Amenity Group=Outdoor Connection, Icon Name=Patio Chairs Square',
    group: 'Outdoor Connection',
    assetPath: 'assets/icons/icons-simple/patio_chairs_square.svg',
    figmaId: '1171:8056',
  },
  walden_balcony: {
    slug: 'walden_balcony',
    displayName: 'Walden Balcony',
    figmaName: 'Amenity Group=Outdoor Connection, Icon Name=Walden Balcony',
    group: 'Outdoor Connection',
    assetPath: 'assets/icons/icons-simple/walden_balcony.svg',
    figmaId: '349:37',
  },
};

/**
 * Embedded SVG vector definitions accurately matching 100x100 bounds from Figma.
 * All vectors render crisply with currentColor or the designated token.
 */
function renderVectorPaths(slug: AmenityIconSlug): React.ReactNode {
  switch (slug) {
    case 'wifi_badge':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="44" strokeWidth="2.5" />
          <path d="M28 38 C35 30 65 30 72 38" />
          <path d="M35 48 C41 42 59 42 65 48" />
          <path d="M42 58 C46 54 54 54 58 58" />
          <circle cx="50" cy="68" r="3.5" fill="currentColor" />
        </g>
      );

    case 'family_friendly':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="44" strokeWidth="2.5" />
          {/* Parent 1 */}
          <circle cx="37" cy="36" r="6" />
          <path d="M26 62 C26 50 48 50 48 62" />
          {/* Parent 2 */}
          <circle cx="63" cy="36" r="6" />
          <path d="M52 62 C52 50 74 50 74 62" />
          {/* Child in front */}
          <circle cx="50" cy="50" r="4.5" fill="currentColor" />
          <path d="M40 70 C40 61 60 61 60 70" />
        </g>
      );

    case 'esopus_creek_access':
    case 'esopus_creek_access1':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="44" strokeWidth="2.5" />
          {/* Mountain ridge */}
          <path d="M22 52 L36 34 L52 52 L64 42 L78 54" />
          {/* River / Creek */}
          <path d="M30 64 C42 60 52 70 68 64" />
          <path d="M26 72 C40 68 56 78 74 70" />
          {/* Pine tree accent */}
          <path d="M48 24 L54 32 H42 Z" fill="currentColor" stroke="none" />
        </g>
      );

    case 'dog_friendly':
      return (
        <g fill="currentColor">
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <ellipse cx="36" cy="38" rx="6" ry="8" />
          <ellipse cx="64" cy="38" rx="6" ry="8" />
          <ellipse cx="48" cy="30" rx="5.5" ry="7.5" />
          <ellipse cx="50" cy="62" rx="15" ry="12" />
        </g>
      );

    case 'direct_trail_access':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="44" strokeWidth="2.5" />
          {/* Mountain peaks */}
          <path d="M24 55 L42 28 L60 55" />
          <path d="M52 55 L65 38 L78 55" />
          {/* Winding path */}
          <path d="M38 78 C45 68 38 60 50 55" strokeWidth="3" strokeDasharray="3 3" />
          <circle cx="36" cy="78" r="2.5" fill="currentColor" />
        </g>
      );

    case 'adults_only':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="44" strokeWidth="2.5" />
          {/* Two cocktail or wine glasses clinking */}
          <path d="M36 34 L48 50 V66" />
          <path d="M30 66 H54" />
          <path d="M30 34 H48" />
          <path d="M64 34 L52 50 V66" />
          <path d="M46 66 H70" />
          <path d="M52 34 H70" />
        </g>
      );

    case 'river_stone_hearth_fireplace':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Stone Arch Outline */}
          <path d="M20 84 V46 C20 30 33 20 50 20 C67 20 80 30 80 46 V84 H20 Z" />
          <path d="M32 84 V52 C32 42 40 34 50 34 C60 34 68 42 68 52 V84" />
          {/* River stones textures */}
          <ellipse cx="26" cy="38" rx="4" ry="3" />
          <ellipse cx="74" cy="38" rx="4" ry="3" />
          <ellipse cx="38" cy="24" rx="5" ry="3" />
          <ellipse cx="62" cy="24" rx="5" ry="3" />
          <ellipse cx="50" cy="22" rx="4" ry="2.5" />
          <ellipse cx="25" cy="56" rx="4" ry="5" />
          <ellipse cx="75" cy="56" rx="4" ry="5" />
          {/* Hearth flames */}
          <path d="M44 80 C44 72 50 68 50 62 C52 68 58 72 56 80 Z" fill="currentColor" />
          <line x1="14" y1="84" x2="86" y2="84" strokeWidth="3" />
        </g>
      );

    case 'cast_iron_wood_stove':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
          {/* Chimney Pipe */}
          <line x1="50" y1="12" x2="50" y2="34" strokeWidth="4" />
          {/* Stove Main Body */}
          <rect x="28" y="34" width="44" height="42" rx="4" />
          {/* Front Glass Door */}
          <rect x="36" y="42" width="28" height="24" rx="2" />
          {/* Flame inside */}
          <path d="M46 60 C46 54 50 50 50 46 C52 50 56 54 54 60 Z" fill="currentColor" />
          {/* Legs */}
          <path d="M32 76 L26 88" strokeWidth="3" />
          <path d="M68 76 L74 88" strokeWidth="3" />
          <line x1="22" y1="88" x2="78" y2="88" strokeWidth="2" />
        </g>
      );

    case 'enameled_gas_fireplace':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="20" y="24" width="60" height="52" rx="3" />
          <rect x="28" y="32" width="44" height="36" rx="2" />
          {/* Modern ribbon gas flame */}
          <path d="M34 60 C37 54 41 54 44 60 C47 52 52 52 55 60 C58 55 62 55 66 60" strokeWidth="2.5" />
          <line x1="16" y1="76" x2="84" y2="76" strokeWidth="3" />
          {/* Modern minimalist vent slits */}
          <line x1="36" y1="28" x2="64" y2="28" strokeWidth="2" />
        </g>
      );

    case 'walden_bathing_suite_den_alcove':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Architectural Alcove Arch */}
          <path d="M18 84 V42 C18 24 32 16 50 16 C68 16 82 24 82 42 V84" />
          {/* Built-in Bench */}
          <rect x="22" y="58" width="56" height="26" rx="2" />
          {/* Seat Cushion */}
          <line x1="22" y1="64" x2="78" y2="64" strokeWidth="3" />
          {/* Decorative bolster pillows */}
          <rect x="24" y="50" width="14" height="14" rx="3" />
          <rect x="62" y="50" width="14" height="14" rx="3" />
          <line x1="12" y1="84" x2="88" y2="84" strokeWidth="3" />
        </g>
      );

    case 'walden_bathing_suite_den':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Lounge Armchair */}
          <path d="M24 46 V68 C24 73 28 77 33 77 H67 C72 77 76 73 76 68 V46" />
          <path d="M32 46 C32 38 38 32 50 32 C62 32 68 38 68 46 V62 H32 Z" />
          {/* Chair arms */}
          <rect x="18" y="50" width="10" height="24" rx="3" />
          <rect x="72" y="50" width="10" height="24" rx="3" />
          {/* Chair legs */}
          <line x1="28" y1="77" x2="24" y2="86" strokeWidth="2.75" />
          <line x1="72" y1="77" x2="76" y2="86" strokeWidth="2.75" />
          {/* Reading lamp */}
          <path d="M82 86 V24 L76 30" />
          <path d="M72 30 H86 L80 20 Z" fill="currentColor" />
        </g>
      );

    case 'opas_livingroom':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Midcentury / Craftsman Sofa */}
          <rect x="18" y="44" width="64" height="34" rx="4" />
          <line x1="18" y1="58" x2="82" y2="58" strokeWidth="2" />
          <line x1="50" y1="44" x2="50" y2="58" strokeWidth="2" />
          {/* Sofa wooden legs */}
          <line x1="26" y1="78" x2="22" y2="86" strokeWidth="2.75" />
          <line x1="74" y1="78" x2="78" y2="86" strokeWidth="2.75" />
          {/* Coffee Table in foreground */}
          <ellipse cx="50" cy="84" rx="20" ry="4" strokeWidth="2" />
          {/* Wall Art frame above */}
          <rect x="36" y="20" width="28" height="18" rx="1.5" />
        </g>
      );

    case 'cabin_sitting_area':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Left Chair */}
          <rect x="16" y="38" width="24" height="34" rx="3" />
          <line x1="16" y1="56" x2="40" y2="56" />
          <line x1="20" y1="72" x2="16" y2="82" strokeWidth="2.5" />
          <line x1="36" y1="72" x2="40" y2="82" strokeWidth="2.5" />
          {/* Right Chair */}
          <rect x="60" y="38" width="24" height="34" rx="3" />
          <line x1="60" y1="56" x2="84" y2="56" />
          <line x1="64" y1="72" x2="60" y2="82" strokeWidth="2.5" />
          <line x1="80" y1="72" x2="84" y2="82" strokeWidth="2.5" />
          {/* Center drinks table */}
          <line x1="46" y1="54" x2="54" y2="54" strokeWidth="3" />
          <line x1="50" y1="54" x2="50" y2="80" strokeWidth="2" />
          <line x1="45" y1="80" x2="55" y2="80" strokeWidth="2" />
        </g>
      );

    case 'slide_mountain_downstairs_livingroom':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Sectional L-Sofa */}
          <path d="M18 36 V72 C18 76 22 80 26 80 H82 V58 H44 V36 H18 Z" />
          <line x1="18" y1="54" x2="44" y2="54" />
          <line x1="44" y1="70" x2="82" y2="70" />
          {/* Staircase motif accent in upper right */}
          <path d="M58 20 H66 V28 H74 V36 H82" strokeWidth="2" />
        </g>
      );

    case 'chalet_upper_living_room':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* A-frame pitched ceiling timber */}
          <path d="M16 80 L50 20 L84 80" strokeWidth="3" />
          <line x1="30" y1="55" x2="70" y2="55" strokeWidth="2" />
          {/* Low chalet lounge */}
          <rect x="30" y="64" width="40" height="16" rx="2" />
          <circle cx="50" cy="42" r="5" strokeWidth="1.75" />
        </g>
      );

    case 'lodge_penthouse_livingroom':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* High floor-to-ceiling windows */}
          <rect x="22" y="18" width="56" height="42" strokeWidth="2" />
          <line x1="50" y1="18" x2="50" y2="60" strokeWidth="1.5" />
          <line x1="22" y1="38" x2="78" y2="38" strokeWidth="1.5" />
          {/* Executive penthouse couch */}
          <rect x="26" y="62" width="48" height="20" rx="3" />
          <line x1="20" y1="84" x2="80" y2="84" strokeWidth="3" />
        </g>
      );

    case 'letter_writing_desk':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Desk Top */}
          <rect x="18" y="46" width="64" height="8" rx="1.5" />
          {/* Drawer units & legs */}
          <line x1="24" y1="54" x2="24" y2="84" strokeWidth="2.75" />
          <line x1="76" y1="54" x2="76" y2="84" strokeWidth="2.75" />
          <rect x="58" y="54" width="18" height="18" rx="1" />
          <circle cx="67" cy="63" r="1.5" fill="currentColor" />
          {/* Vintage lamp + letter stationery */}
          <path d="M30 46 V32 C30 28 36 24 40 28" />
          <path d="M38 28 L46 34" strokeWidth="3" />
          <rect x="42" y="40" width="12" height="6" rx="1" strokeWidth="1.75" />
        </g>
      );

    case 'architectural_diamond_window':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Arch Window Frame */}
          <path d="M24 84 V46 C24 28 35 18 50 18 C65 18 76 28 76 46 V84 H24 Z" strokeWidth="3" />
          {/* Diamond Lattice Grille */}
          <path d="M50 28 L72 50 L50 72 L28 50 Z" />
          <line x1="50" y1="18" x2="50" y2="84" />
          <line x1="24" y1="50" x2="76" y2="50" />
          <line x1="18" y1="84" x2="82" y2="84" strokeWidth="3.5" />
        </g>
      );

    case 'marshall_speaker':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
          {/* Cabinet */}
          <rect x="18" y="32" width="64" height="42" rx="4" />
          {/* Speaker grille cloth */}
          <rect x="24" y="42" width="52" height="26" rx="2" strokeWidth="2" strokeDasharray="2 2" />
          {/* Top brass control plate */}
          <line x1="28" y1="37" x2="72" y2="37" strokeWidth="1.5" />
          <circle cx="34" cy="37" r="1.75" fill="currentColor" />
          <circle cx="42" cy="37" r="1.75" fill="currentColor" />
          <circle cx="50" cy="37" r="1.75" fill="currentColor" />
          {/* Handle */}
          <path d="M36 32 C36 26 64 26 64 32" strokeWidth="2.5" />
        </g>
      );

    case 'minibar':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Credenza / cabinet */}
          <rect x="28" y="34" width="44" height="48" rx="3" />
          <line x1="50" y1="34" x2="50" y2="76" strokeWidth="2" />
          <line x1="28" y1="76" x2="72" y2="76" strokeWidth="2" />
          {/* Liquor bottles & glassware on top */}
          <rect x="36" y="20" width="8" height="14" rx="1.5" />
          <line x1="40" y1="16" x2="40" y2="20" strokeWidth="2" />
          <path d="M54 24 L60 34 H50 Z" strokeWidth="1.75" />
          {/* Feet */}
          <line x1="34" y1="82" x2="34" y2="88" strokeWidth="3" />
          <line x1="66" y1="82" x2="66" y2="88" strokeWidth="3" />
        </g>
      );

    case 'alpine_bed_bear_pattern':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Bed frame */}
          <rect x="20" y="34" width="60" height="48" rx="3" />
          <line x1="20" y1="52" x2="80" y2="52" strokeWidth="2.5" />
          {/* Bear silhouette silhouette on duvet */}
          <path
            d="M40 68 C40 63 44 60 50 60 C56 60 60 63 60 68 H40 Z"
            fill="currentColor"
          />
          <circle cx="43" cy="62" r="1.5" fill="currentColor" />
          <circle cx="57" cy="62" r="1.5" fill="currentColor" />
          {/* Pillows */}
          <rect x="26" y="38" width="20" height="10" rx="2" />
          <rect x="54" y="38" width="20" height="10" rx="2" />
        </g>
      );

    case 'alpine_bed_southwest_pattern':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="20" y="34" width="60" height="48" rx="3" />
          <line x1="20" y1="52" x2="80" y2="52" strokeWidth="2.5" />
          {/* Pillows */}
          <rect x="26" y="38" width="20" height="10" rx="2" />
          <rect x="54" y="38" width="20" height="10" rx="2" />
          {/* Southwest Kilim Chevron Diamonds */}
          <polygon points="50,56 58,66 50,76 42,66" fill="currentColor" />
          <polyline points="32,60 36,66 32,72" strokeWidth="2" />
          <polyline points="68,60 64,66 68,72" strokeWidth="2" />
        </g>
      );

    case 'view_from_window':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Window casement frame */}
          <rect x="20" y="24" width="60" height="56" rx="2" strokeWidth="3" />
          <line x1="50" y1="24" x2="50" y2="80" strokeWidth="2" />
          {/* Mountain scenery */}
          <path d="M22 66 L38 46 L50 62 L64 42 L78 64" strokeWidth="2" />
          <circle cx="66" cy="34" r="4" fill="currentColor" />
          <line x1="16" y1="80" x2="84" y2="80" strokeWidth="3.5" />
        </g>
      );

    case 'chalet_full_kitchen':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Range hood */}
          <path d="M34 20 L40 32 H60 L66 20 Z" />
          {/* Cooktop & Stove */}
          <rect x="24" y="44" width="52" height="38" rx="2" />
          {/* Burners */}
          <circle cx="36" cy="48" r="3" strokeWidth="1.5" />
          <circle cx="64" cy="48" r="3" strokeWidth="1.5" />
          {/* Oven window */}
          <rect x="32" y="58" width="36" height="18" rx="2" />
          <line x1="38" y1="54" x2="62" y2="54" strokeWidth="2" />
        </g>
      );

    case 'lodge_penthouse_private_bar':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Bar Counter */}
          <rect x="18" y="54" width="64" height="28" rx="2" />
          {/* Overhead glass rack */}
          <line x1="24" y1="22" x2="76" y2="22" strokeWidth="3" />
          <path d="M32 22 V34 L36 38 H28 L32 34" strokeWidth="1.75" />
          <path d="M50 22 V34 L54 38 H46 L50 34" strokeWidth="1.75" />
          <path d="M68 22 V34 L72 38 H64 L68 34" strokeWidth="1.75" />
          {/* Barstools */}
          <ellipse cx="34" cy="54" rx="8" ry="2" strokeWidth="2" />
          <ellipse cx="66" cy="54" rx="8" ry="2" strokeWidth="2" />
        </g>
      );

    case 'full_kitchen':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Refrigerator */}
          <rect x="18" y="24" width="22" height="58" rx="2" />
          <line x1="18" y1="46" x2="40" y2="46" strokeWidth="2" />
          <line x1="36" y1="32" x2="36" y2="40" strokeWidth="2" />
          <line x1="36" y1="52" x2="36" y2="64" strokeWidth="2" />
          {/* Counters & Stove */}
          <rect x="44" y="44" width="38" height="38" rx="2" />
          <rect x="50" y="56" width="26" height="20" rx="1.5" />
          <line x1="52" y1="50" x2="74" y2="50" strokeWidth="2" />
        </g>
      );

    case 'opas_kitchen':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Floating shelves */}
          <line x1="22" y1="28" x2="78" y2="28" strokeWidth="3" />
          <circle cx="34" cy="22" r="3.5" />
          <rect x="48" y="18" width="8" height="10" rx="1" />
          <circle cx="68" cy="22" r="3.5" />
          {/* Cabinet Base */}
          <rect x="22" y="46" width="56" height="36" rx="2" />
          <line x1="50" y1="46" x2="50" y2="82" strokeWidth="2" />
          <circle cx="44" cy="62" r="1.5" fill="currentColor" />
          <circle cx="56" cy="62" r="1.5" fill="currentColor" />
        </g>
      );

    case 'opas_kitchen_full_table':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Farmhouse Dining Table */}
          <rect x="16" y="44" width="68" height="8" rx="1.5" strokeWidth="3" />
          {/* Table X Trestle Legs */}
          <path d="M26 52 L36 82" strokeWidth="3" />
          <path d="M36 52 L26 82" strokeWidth="3" />
          <path d="M74 52 L64 82" strokeWidth="3" />
          <path d="M64 52 L74 82" strokeWidth="3" />
          <line x1="31" y1="67" x2="69" y2="67" strokeWidth="2.5" />
          {/* Pendant Lamp Hanging Above */}
          <line x1="50" y1="14" x2="50" y2="30" strokeWidth="2" />
          <path d="M40 38 L50 30 L60 38 Z" fill="currentColor" />
        </g>
      );

    case 'cowboy_robe_dark':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Wooden Hanger */}
          <path d="M50 18 C50 14 54 14 54 18 C54 22 50 24 50 26" strokeWidth="2" />
          <path d="M32 34 L50 26 L68 34" strokeWidth="2.5" />
          {/* Plush Robe Body */}
          <path d="M32 34 L22 48 L28 54 L34 46 V84 H66 V46 L72 54 L78 48 L68 34" fill="currentColor" fillOpacity="0.15" />
          {/* Robe Collar & Tie Belt */}
          <path d="M40 30 L50 56 L60 30" strokeWidth="2" />
          <rect x="32" y="58" width="36" height="5" rx="1.5" fill="currentColor" />
          <path d="M48 63 V74" strokeWidth="2.5" />
        </g>
      );

    case 'cowboy_robe_light':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Wooden Hanger */}
          <path d="M50 18 C50 14 54 14 54 18 C54 22 50 24 50 26" strokeWidth="2" />
          <path d="M32 34 L50 26 L68 34" strokeWidth="2.5" />
          {/* Robe Outline */}
          <path d="M32 34 L22 48 L28 54 L34 46 V84 H66 V46 L72 54 L78 48 L68 34 Z" />
          {/* Pattern Band Striping (Light Version) */}
          <line x1="34" y1="72" x2="66" y2="72" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="34" y1="76" x2="66" y2="76" strokeWidth="2" strokeDasharray="2 2" />
          <rect x="32" y="58" width="36" height="5" rx="1.5" />
        </g>
      );

    case 'bath_amenities':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Soap pump dispenser */}
          <rect x="22" y="44" width="22" height="38" rx="3" />
          <line x1="33" y1="44" x2="33" y2="34" strokeWidth="2.5" />
          <path d="M33 34 H26" strokeWidth="2.5" />
          <rect x="26" y="54" width="14" height="18" rx="1" strokeWidth="1.5" />
          {/* Lotion bottle */}
          <rect x="52" y="36" width="24" height="46" rx="4" />
          <rect x="58" y="28" width="12" height="8" rx="1.5" />
          <line x1="52" y1="56" x2="76" y2="56" strokeWidth="1.5" />
        </g>
      );

    case 'heated_floors':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Floor tiles */}
          <rect x="18" y="68" width="64" height="14" rx="2" strokeWidth="3" />
          <line x1="39" y1="68" x2="39" y2="82" strokeWidth="2" />
          <line x1="60" y1="68" x2="60" y2="82" strokeWidth="2" />
          {/* Rising radiant heat waves */}
          <path d="M28 58 C26 50 32 44 28 36 C24 28 30 22 28 16" strokeWidth="2.5" />
          <path d="M50 58 C48 50 54 44 50 36 C46 28 52 22 50 16" strokeWidth="2.5" />
          <path d="M72 58 C70 50 76 44 72 36 C68 28 74 22 72 16" strokeWidth="2.5" />
        </g>
      );

    case 'copper_clawfoot_soaking_tub':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Tub Rim & Basin */}
          <path d="M14 44 C14 40 18 36 24 36 H76 C82 36 86 40 86 44 C86 64 74 74 50 74 C26 74 14 64 14 44 Z" />
          <line x1="12" y1="44" x2="88" y2="44" strokeWidth="3" />
          {/* Elegant Vintage Telephone Faucet */}
          <path d="M26 36 V24 C26 20 32 20 32 24" strokeWidth="2" />
          <path d="M22 22 H32" strokeWidth="3" />
          {/* Ornate Clawfeet */}
          <path d="M24 74 L20 84 C22 86 28 86 28 84 L28 74" fill="currentColor" />
          <path d="M76 74 L72 84 C74 86 80 86 80 84 L72 74" fill="currentColor" />
        </g>
      );

    case 'walkin_rain_shower':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Shower glass frame */}
          <path d="M20 18 H80 V84" strokeWidth="2" strokeDasharray="3 3" />
          {/* Overhead Rain Showerhead */}
          <path d="M20 28 H50 V34" strokeWidth="3" />
          <path d="M40 34 H60" strokeWidth="4" />
          {/* Rainfall droplets */}
          <line x1="44" y1="42" x2="44" y2="48" strokeWidth="2" />
          <line x1="50" y1="40" x2="50" y2="50" strokeWidth="2" />
          <line x1="56" y1="42" x2="56" y2="48" strokeWidth="2" />
          <line x1="46" y1="56" x2="46" y2="64" strokeWidth="2" />
          <line x1="54" y1="56" x2="54" y2="64" strokeWidth="2" />
          {/* Floor drain */}
          <line x1="16" y1="84" x2="84" y2="84" strokeWidth="3.5" />
          <ellipse cx="50" cy="84" rx="8" ry="2" strokeWidth="2" />
        </g>
      );

    case 'outdoor_cedar_soaking_tub':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Cedar Barrel Tub */}
          <ellipse cx="50" cy="40" rx="36" ry="12" strokeWidth="3" />
          <path d="M14 40 V70 C14 80 30 86 50 86 C70 86 86 80 86 70 V40" />
          {/* Barrel hoops */}
          <path d="M14 54 C20 62 40 66 50 66 C60 66 80 62 86 54" strokeWidth="2" />
          <path d="M14 70 C20 78 40 82 50 82 C60 82 80 78 86 70" strokeWidth="2" />
          {/* Vertical wood staves */}
          <line x1="32" y1="51" x2="32" y2="82" strokeWidth="1.5" />
          <line x1="50" y1="52" x2="50" y2="86" strokeWidth="1.5" />
          <line x1="68" y1="51" x2="68" y2="82" strokeWidth="1.5" />
          {/* Steam curls */}
          <path d="M38 28 C36 22 42 18 40 12" strokeWidth="2" />
          <path d="M60 28 C58 22 64 18 62 12" strokeWidth="2" />
        </g>
      );

    case 'bed_lodge_penthouse':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Tall upholstered headboard */}
          <rect x="18" y="20" width="64" height="34" rx="3" strokeWidth="3" />
          <line x1="39" y1="20" x2="39" y2="54" strokeWidth="1.5" />
          <line x1="61" y1="20" x2="61" y2="54" strokeWidth="1.5" />
          {/* Luxury Duvet & Pillows */}
          <rect x="24" y="36" width="22" height="12" rx="2" fill="currentColor" fillOpacity="0.15" />
          <rect x="54" y="36" width="22" height="12" rx="2" fill="currentColor" fillOpacity="0.15" />
          <rect x="18" y="52" width="64" height="28" rx="2" />
          <line x1="18" y1="62" x2="82" y2="62" strokeWidth="2" />
          {/* Nightstands */}
          <line x1="12" y1="58" x2="18" y2="58" strokeWidth="2" />
          <line x1="82" y1="58" x2="88" y2="58" strokeWidth="2" />
        </g>
      );

    case 'bed_single_headboard':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Slatted wood headboard */}
          <rect x="28" y="24" width="44" height="30" rx="2" strokeWidth="3" />
          <line x1="36" y1="24" x2="36" y2="54" strokeWidth="2" />
          <line x1="44" y1="24" x2="44" y2="54" strokeWidth="2" />
          <line x1="52" y1="24" x2="52" y2="54" strokeWidth="2" />
          <line x1="60" y1="24" x2="60" y2="54" strokeWidth="2" />
          {/* Bed & Pillow */}
          <rect x="36" y="34" width="28" height="12" rx="2" />
          <rect x="28" y="50" width="44" height="30" rx="2" />
          <line x1="28" y1="60" x2="72" y2="60" strokeWidth="2" />
        </g>
      );

    case 'single_bed':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="30" y="34" width="40" height="46" rx="3" strokeWidth="3" />
          <rect x="38" y="38" width="24" height="12" rx="2" />
          <line x1="30" y1="54" x2="70" y2="54" strokeWidth="2.5" />
        </g>
      );

    case 'bed_cabin':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Rustic Log Headboard */}
          <rect x="20" y="26" width="60" height="28" rx="4" strokeWidth="3" />
          <line x1="16" y1="36" x2="84" y2="36" strokeWidth="3" />
          {/* Pillows */}
          <rect x="26" y="38" width="20" height="12" rx="2" />
          <rect x="54" y="38" width="20" height="12" rx="2" />
          {/* Bed Base */}
          <rect x="20" y="50" width="60" height="30" rx="2" />
          <line x1="20" y1="62" x2="80" y2="62" strokeWidth="2.5" />
        </g>
      );

    case 'bed_double_headboard':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Headboard */}
          <rect x="18" y="26" width="64" height="28" rx="2" strokeWidth="3" />
          <line x1="50" y1="26" x2="50" y2="54" strokeWidth="2" />
          {/* Dual Pillows */}
          <rect x="24" y="36" width="22" height="12" rx="2" />
          <rect x="54" y="36" width="22" height="12" rx="2" />
          {/* Bed Base */}
          <rect x="18" y="50" width="64" height="30" rx="2" />
          <line x1="18" y1="62" x2="82" y2="62" strokeWidth="2.5" />
        </g>
      );

    case 'two_beds':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Left Bed */}
          <rect x="16" y="36" width="28" height="44" rx="2" />
          <rect x="21" y="40" width="18" height="10" rx="2" />
          <line x1="16" y1="54" x2="44" y2="54" strokeWidth="2" />
          {/* Right Bed */}
          <rect x="56" y="36" width="28" height="44" rx="2" />
          <rect x="61" y="40" width="18" height="10" rx="2" />
          <line x1="56" y1="54" x2="84" y2="54" strokeWidth="2" />
        </g>
      );

    case 'private_deck_or_porch':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Porch Railing */}
          <line x1="16" y1="46" x2="84" y2="46" strokeWidth="3" />
          <line x1="16" y1="66" x2="84" y2="66" strokeWidth="3" />
          <line x1="26" y1="46" x2="26" y2="66" strokeWidth="2" />
          <line x1="38" y1="46" x2="38" y2="66" strokeWidth="2" />
          <line x1="50" y1="46" x2="50" y2="66" strokeWidth="2" />
          <line x1="62" y1="46" x2="62" y2="66" strokeWidth="2" />
          <line x1="74" y1="46" x2="74" y2="66" strokeWidth="2" />
          {/* Deck Planks */}
          <line x1="14" y1="76" x2="86" y2="76" strokeWidth="3" />
          <line x1="14" y1="84" x2="86" y2="84" strokeWidth="3" />
          {/* Foliage beyond */}
          <circle cx="70" cy="30" r="8" strokeWidth="2" />
          <circle cx="78" cy="34" r="6" strokeWidth="2" />
        </g>
      );

    case 'patio_chairs_round':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Left curved bistro chair */}
          <path d="M18 42 C18 34 26 34 30 42 V68 H18 Z" />
          <line x1="20" y1="68" x2="16" y2="80" strokeWidth="2.5" />
          <line x1="28" y1="68" x2="32" y2="80" strokeWidth="2.5" />
          {/* Right curved bistro chair */}
          <path d="M70 42 C74 34 82 34 82 42 V68 H70 Z" />
          <line x1="72" y1="68" x2="68" y2="80" strokeWidth="2.5" />
          <line x1="80" y1="68" x2="84" y2="80" strokeWidth="2.5" />
          {/* Round Pedestal Table */}
          <ellipse cx="50" cy="52" rx="16" ry="5" strokeWidth="2.5" />
          <line x1="50" y1="57" x2="50" y2="78" strokeWidth="3" />
          <line x1="40" y1="78" x2="60" y2="78" strokeWidth="3" />
        </g>
      );

    case 'patio_chairs_square':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Left Modern Adirondack Chair */}
          <path d="M18 36 L24 64 H40 L34 36 Z" />
          <line x1="20" y1="64" x2="16" y2="78" strokeWidth="2.75" />
          <line x1="38" y1="64" x2="42" y2="78" strokeWidth="2.75" />
          {/* Right Modern Adirondack Chair */}
          <path d="M66 36 L60 64 H76 L82 36 Z" />
          <line x1="62" y1="64" x2="58" y2="78" strokeWidth="2.75" />
          <line x1="80" y1="64" x2="84" y2="78" strokeWidth="2.75" />
          {/* Center Square Table */}
          <rect x="44" y="52" width="12" height="24" rx="1" strokeWidth="2.5" />
        </g>
      );

    case 'walden_balcony':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Wall opening & door */}
          <rect x="28" y="20" width="44" height="60" rx="1.5" strokeWidth="2" />
          <line x1="50" y1="20" x2="50" y2="80" strokeWidth="1.5" />
          {/* Overhanging Balcony with timber braces */}
          <rect x="18" y="56" width="64" height="20" rx="1.5" strokeWidth="3" />
          <line x1="18" y1="66" x2="82" y2="66" strokeWidth="1.5" />
          <line x1="32" y1="56" x2="32" y2="76" strokeWidth="1.5" />
          <line x1="46" y1="56" x2="46" y2="76" strokeWidth="1.5" />
          <line x1="60" y1="56" x2="60" y2="76" strokeWidth="1.5" />
          <line x1="74" y1="56" x2="74" y2="76" strokeWidth="1.5" />
          {/* Angled structural corbels underneath */}
          <path d="M22 76 L32 88" strokeWidth="3" />
          <path d="M78 76 L68 88" strokeWidth="3" />
        </g>
      );

    default:
      return (
        <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="3" />
      );
  }
}

export interface AmenityIconProps extends React.SVGProps<SVGSVGElement> {
  name: AmenityIconSlug;
  size?: number | string;
  color?: string;
  /**
   * If true, renders standard <img> referencing the design asset file path directly.
   * Defaults to false (renders inline embedded SVG).
   */
  useAssetFile?: boolean;
  className?: string;
}

/**
 * AmenityIcon: Main component compliant with React 19 and Tailwind 4.
 * Uses exact CSS Style Token from Figma design (#184428).
 */
export function AmenityIcon({
  name,
  size = 24,
  color = FIGMA_STYLE_TOKENS.primary,
  useAssetFile = false,
  className = '',
  style,
  ...restProps
}: AmenityIconProps) {
  const meta = AMENITIES_REGISTRY[name];
  const titleId = useId();

  if (!meta) {
    console.warn(`[AmenityIcon] Unknown icon name: "${name}"`);
    return null;
  }

  // File image fallback mode if consumer wants to reference disk SVG assets directly
  if (useAssetFile) {
    return (
      <img
        src={`/${meta.assetPath}`}
        alt={meta.displayName}
        width={size}
        height={size}
        className={`inline-block object-contain ${className}`}
        style={{ ...style, width: size, height: size }}
      />
    );
  }

  return (
    <svg
      role="img"
      aria-labelledby={titleId}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill={color}
      style={{ color, ...style }}
      className={`inline-block shrink-0 align-middle ${className}`}
      {...restProps}
    >
      <title id={titleId}>{meta.displayName}</title>
      {renderVectorPaths(name)}
    </svg>
  );
}

/**
 * AmenityBadge: Highlight pill with token-based background and typography
 */
export interface AmenityBadgeProps {
  name: AmenityIconSlug;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AmenityBadge({
  name,
  label,
  size = 'md',
  className = '',
}: AmenityBadgeProps) {
  const meta = AMENITIES_REGISTRY[name];
  const displayLabel = label || meta?.displayName || name;

  const sizeClasses = {
    sm: 'text-xs py-1 px-2.5 gap-1.5',
    md: 'text-sm py-1.5 px-3.5 gap-2',
    lg: 'text-base py-2 px-4 gap-2.5',
  }[size];

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-full font-medium tracking-tight border transition-colors ${sizeClasses} ${className}`}
      style={{
        backgroundColor: FIGMA_STYLE_TOKENS.badgeBg,
        borderColor: FIGMA_STYLE_TOKENS.border,
        color: FIGMA_STYLE_TOKENS.primary,
      }}
    >
      <AmenityIcon name={name} size={iconSizes} color={FIGMA_STYLE_TOKENS.primary} />
      <span>{displayLabel}</span>
    </div>
  );
}

/**
 * Interactive Preview Catalog & Showcase Component
 */
export default function AmenityIconsApp() {
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewSize, setPreviewSize] = useState<number>(36);
  const [activeTab, setActiveTab] = useState<'catalog' | 'card_example'>('catalog');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const groups: string[] = [
    'All',
    'Badge',
    'Room Feature',
    'Heating Element',
    'Kitchen Feature',
    'Basic Features',
    'Water Feature',
    'Bed Type Icon',
    'Outdoor Connection',
  ];

  const filteredIcons = Object.values(AMENITIES_REGISTRY).filter((item) => {
    const matchesGroup = selectedGroup === 'All' || item.group === selectedGroup;
    const matchesSearch =
      item.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.group.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const handleCopyCode = (slug: string) => {
    const code = `<AmenityIcon name="${slug}" size={24} />`;
    navigator.clipboard?.writeText(code);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 1800);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Figma Design Tokens summary */}
        <header className="border-b border-stone-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="size-3 rounded-full inline-block"
                style={{ backgroundColor: FIGMA_STYLE_TOKENS.primary }}
              />
              <span className="text-xs uppercase font-semibold tracking-wider text-stone-500">
                Figma Component Set: AmenityIcons (#184428)
              </span>
            </div>
            <h1 className="text-3xl font-serif tracking-tight font-semibold text-stone-900">
              Resort Amenity Icons System
            </h1>
            <p className="text-stone-600 text-sm mt-1">
              Production-ready React 19 & Tailwind 4 component set extracted from Figma JSON tokens.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-stone-200/80 p-1 rounded-lg text-xs font-medium self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Icon Catalog ({Object.keys(AMENITIES_REGISTRY).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('card_example')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'card_example'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Room Card Preview
            </button>
          </div>
        </header>

        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Search */}
              <div className="w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search amenities (e.g. fireplace, wifi, deck)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#184428] focus:border-[#184428]"
                />
              </div>

              {/* Size Slider */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs text-stone-500 font-medium">Icon Scale:</span>
                <input
                  type="range"
                  min="20"
                  max="64"
                  step="4"
                  value={previewSize}
                  onChange={(e) => setPreviewSize(Number(e.target.value))}
                  className="w-32 accent-[#184428]"
                />
                <span className="text-xs font-mono text-stone-600 w-8">{previewSize}px</span>
              </div>
            </div>

            {/* Group Categories Horizontal Pills */}
            <div className="flex flex-wrap gap-2 pb-2">
              {groups.map((group) => {
                const isSelected = selectedGroup === group;
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setSelectedGroup(group)}
                    className={`text-xs px-3.5 py-1.5 rounded-full transition-all border ${
                      isSelected
                        ? 'bg-[#184428] text-white border-[#184428] shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {group}
                  </button>
                );
              })}
            </div>

            {/* Grid of Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredIcons.map((item) => (
                <div
                  key={item.slug}
                  onClick={() => handleCopyCode(item.slug)}
                  className="group relative bg-white border border-stone-200 rounded-xl p-4 flex flex-col items-center justify-between hover:border-[#184428] hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Badge indicating Group */}
                  <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400 self-start">
                    {item.group}
                  </span>

                  {/* Icon Render Area */}
                  <div className="py-6 flex items-center justify-center transition-transform group-hover:scale-110">
                    <AmenityIcon
                      name={item.slug}
                      size={previewSize}
                      color={FIGMA_STYLE_TOKENS.primary}
                    />
                  </div>

                  {/* Icon Metadata */}
                  <div className="w-full text-center border-t border-stone-100 pt-3">
                    <p className="text-sm font-medium text-stone-800 truncate" title={item.displayName}>
                      {item.displayName}
                    </p>
                    <p className="text-[11px] font-mono text-stone-400 truncate mt-0.5" title={item.assetPath}>
                      {item.slug}
                    </p>
                  </div>

                  {/* Copy snippet overlay */}
                  <div className="absolute inset-0 bg-[#184428]/90 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-4 text-center">
                    <span className="text-xs font-mono">
                      {copiedSlug === item.slug ? '✓ Copied to clipboard!' : 'Click to copy JSX'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filteredIcons.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                <p className="text-stone-500 text-sm">No amenities found matching "{searchQuery}".</p>
              </div>
            )}
          </div>
        )}

        {/* Real-life Room Card Demonstration */}
        {activeTab === 'card_example' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Card Preview 1: Walden Bathing Suite */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="relative h-60 bg-stone-800 flex items-end p-6">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative z-10 flex flex-wrap gap-2">
                  <AmenityBadge name="esopus_creek_access" size="sm" />
                  <AmenityBadge name="wifi_badge" size="sm" />
                  <AmenityBadge name="direct_trail_access" size="sm" />
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between items-baseline">
                    <h2 className="text-2xl font-serif font-semibold text-stone-900">
                      The Walden Bathing Suite
                    </h2>
                    <span className="text-lg font-medium text-[#184428] font-serif">$495 / night</span>
                  </div>
                  <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                    Spacious creek-side retreat with vintage stone hearth, deep soaking tub, private sitting alcove, and direct access to mountain walking trails.
                  </p>
                </div>

                {/* Primary Specifications */}
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-stone-100">
                  <div className="flex items-center gap-3">
                    <AmenityIcon name="bed_lodge_penthouse" size={26} />
                    <span className="text-xs text-stone-700 font-medium">1 King Bed + Alcove</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AmenityIcon name="copper_clawfoot_soaking_tub" size={26} />
                    <span className="text-xs text-stone-700 font-medium">Clawfoot Soaking Tub</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AmenityIcon name="river_stone_hearth_fireplace" size={26} />
                    <span className="text-xs text-stone-700 font-medium">Stone Hearth Fireplace</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AmenityIcon name="walden_balcony" size={26} />
                    <span className="text-xs text-stone-700 font-medium">Private Forest Balcony</span>
                  </div>
                </div>

                {/* Amenities List */}
                <div>
                  <h3 className="text-xs uppercase font-semibold text-stone-400 tracking-wider mb-3">
                    Featured Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    <AmenityBadge name="heated_floors" size="sm" />
                    <AmenityBadge name="cowboy_robe_dark" size="sm" />
                    <AmenityBadge name="marshall_speaker" size="sm" />
                    <AmenityBadge name="minibar" size="sm" />
                    <AmenityBadge name="view_from_window" size="sm" />
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-3 px-4 rounded-xl text-white font-medium text-sm transition-all shadow-xs hover:shadow-md"
                  style={{ backgroundColor: FIGMA_STYLE_TOKENS.primary }}
                >
                  Reserve Suite
                </button>
              </div>
            </div>

            {/* Card Preview 2: Opa's Chalet */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="relative h-60 bg-stone-900 flex items-end p-6">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative z-10 flex flex-wrap gap-2">
                  <AmenityBadge name="family_friendly" size="sm" />
                  <AmenityBadge name="dog_friendly" size="sm" />
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between items-baseline">
                    <h2 className="text-2xl font-serif font-semibold text-stone-900">
                      Opa's Mountain Chalet
                    </h2>
                    <span className="text-lg font-medium text-[#184428] font-serif">$650 / night</span>
                  </div>
                  <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                    Two-story family timber chalet with full open kitchen, cast iron wood stove, expansive dining area, and secluded cedar soaking tub.
                  </p>
                </div>

                {/* Primary Specifications */}
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-stone-100">
                  <div className="flex items-center gap-3">
                    <AmenityIcon name="two_beds" size={26} />
                    <span className="text-xs text-stone-700 font-medium">2 Double Beds + Cabin Bunk</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AmenityIcon name="outdoor_cedar_soaking_tub" size={26} />
                    <span className="text-xs text-stone-700 font-medium">Outdoor Cedar Tub</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AmenityIcon name="cast_iron_wood_stove" size={26} />
                    <span className="text-xs text-stone-700 font-medium">Cast Iron Stove</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AmenityIcon name="chalet_full_kitchen" size={26} />
                    <span className="text-xs text-stone-700 font-medium">Full Chef's Kitchen</span>
                  </div>
                </div>

                {/* Amenities List */}
                <div>
                  <h3 className="text-xs uppercase font-semibold text-stone-400 tracking-wider mb-3">
                    Featured Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    <AmenityBadge name="opas_kitchen_full_table" size="sm" />
                    <AmenityBadge name="patio_chairs_square" size="sm" />
                    <AmenityBadge name="bath_amenities" size="sm" />
                    <AmenityBadge name="walkin_rain_shower" size="sm" />
                    <AmenityBadge name="letter_writing_desk" size="sm" />
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-3 px-4 rounded-xl text-white font-medium text-sm transition-all shadow-xs hover:shadow-md"
                  style={{ backgroundColor: FIGMA_STYLE_TOKENS.primary }}
                >
                  Reserve Chalet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}