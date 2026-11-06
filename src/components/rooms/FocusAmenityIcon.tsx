// src/components/AmenityIcons.tsx
import React from 'react';

/**
 * CSS Design Tokens for Amenity states (no hex values).
 */
export const DESIGN_TOKENS = {
  primaryForeground: 'var(--primary-foreground)',
  accent: 'var(--accent)',
  paper900: 'var(--paper-900)',
} as const;

/**
 * Focus and interaction states derived from FocusAmenityStates.
 */
export type AmenityState =
  | 'default'
  | 'default-on-focus'
  | 'active'
  | 'active-on-focus'
  | 'inactive'
  | 'Default'
  | 'Default on Focus'
  | 'Active'
  | 'Active on Focus'
  | 'Inactive';

/**
 * Mapping of amenity states to CSS design tokens:
 * - Default / Active on Focus: var(--accent)
 * - Default on Focus / Active: var(--paper-900)
 * - Inactive: var(--primary-foreground)
 */
export const AMENITY_STATE_TOKENS: Record<AmenityState, string> = {
  default: 'var(--accent)',
  Default: 'var(--accent)',
  'default-on-focus': 'var(--paper-900)',
  'Default on Focus': 'var(--paper-900)',
  active: 'var(--paper-900)',
  Active: 'var(--paper-900)',
  'active-on-focus': 'var(--accent)',
  'Active on Focus': 'var(--accent)',
  inactive: 'var(--primary-foreground)',
  Inactive: 'var(--primary-foreground)',
};

export type AmenityGroup =
  | 'Room Feature'
  | 'Heating Element'
  | 'Kitchen Feature'
  | 'Basic Features'
  | 'Water Feature'
  | 'Bed Type Icon'
  | 'Badge'
  | 'Outdoor Connection';

export type AmenityIconName =
  // Badge Group (assets/icons/badges/features/)
  | 'Wifi Access'
  | 'wifi_badge'
  | 'Family Friendly'
  | 'family_friendly'
  | 'Esopus Creek Access'
  | 'esopus_creek_access'
  | 'Esopus Creek Access 1'
  | 'esopus_creek_access1'
  | 'Dog Friendly'
  | 'dog_friendly'
  | 'Direct Trailhead Access'
  | 'direct_trail_access'
  | 'Adults Only'
  | 'adults_only'
  // Room Feature (assets/icons/icons-simple/)
  | 'Walden Bathing Suite Den Alcove'
  | 'walden_bathing_suite_den_alcove'
  | 'Alpine Bathing Suite Den'
  | 'walden_bathing_suite_den'
  | 'Opas Living Room'
  | 'opas_livingroom'
  | 'Cabin Sitting Area'
  | 'cabin_sitting_area'
  | 'Slide Mountain Downstair Living Room'
  | 'slide_mountain_downstairs_livingroom'
  | 'Chalet Living Room'
  | 'chalet_upper_living_room'
  | 'Lodge Penthouse Living Room'
  | 'lodge_penthouse_livingroom'
  | 'Letter-Writing Desk'
  | 'letter_writing_desk'
  | 'Architectural Diamond Window'
  | 'architectural_diamond_window'
  | 'Marshall Speaker'
  | 'marshall_speaker'
  | 'Minibar'
  | 'minibar'
  | 'Alpine Bathing Suite Bear Pattern'
  | 'alpine_bed_bear_pattern'
  | 'Alpine Bathing Suite Southwest Pattern'
  | 'alpine_bed_southwest_pattern'
  | 'Scenic Views'
  | 'view_from_window'
  // Heating Element (assets/icons/icons-simple/)
  | 'River Stone Hearth FIreplace'
  | 'river_stone_hearth_fireplace'
  | 'Cast Iron Wood Stove'
  | 'cast_iron_wood_stove'
  | 'Enameled Gas Fireplace'
  | 'enameled_gas_fireplace'
  // Kitchen Feature (assets/icons/icons-simple/)
  | 'Chalet Full Kitchen'
  | 'chalet_full_kitchen'
  | 'Lodge Penhouse Private Bar'
  | 'lodge_penthouse_private_bar'
  | 'Full Kitchen'
  | 'full_kitchen'
  | 'Ops Full Kitchen'
  | 'opas_kitchen'
  | 'Ops Kitchen Full Table'
  | 'opas_kitchen_full_table'
  // Basic Features (assets/icons/icons-simple/)
  | 'Pendleton Robe Dark'
  | 'cowboy_robe_dark'
  | 'Pendleton Robe Light'
  | 'cowboy_robe_light'
  | 'Bath Amenities'
  | 'bath_amenities'
  | 'Heated Floors'
  | 'heated_floors'
  // Water Feature (assets/icons/icons-simple/)
  | 'Copper / Clawfoot Soaking Tub'
  | 'copper_clawfoot_soaking_tub'
  | 'Walkin Rain Shower'
  | 'walkin_rain_shower'
  | 'Outdoor Cedar Soaking Tub'
  | 'outdoor_cedar_soaking_tub'
  // Bed Type Icon (assets/icons/icons-simple/)
  | 'Lodge Penthouse'
  | 'bed_lodge_penthouse'
  | 'Single Bed with Headboard'
  | 'bed_single_headboard'
  | 'Single Bed'
  | 'single_bed'
  | 'Cabin'
  | 'bed_cabin'
  | 'Double Beds with Headboard'
  | 'bed_double_headboard'
  | 'Two Beds'
  | 'two_beds'
  // Outdoor Connection (assets/icons/icons-simple/)
  | 'Private Deck or Porch'
  | 'private_deck_or_porch'
  | 'Patio Chair Round'
  | 'patio_chairs_round'
  | 'Patio Chairs Square'
  | 'patio_chairs_square'
  | 'Walden Balcony'
  | 'walden_balcony';

export interface AmenityIconDefinition {
  assetPath: string;
  displayName: string;
  group: AmenityGroup;
}

/**
 * Registry mapping each amenity icon name or slug to its SVG asset path.
 */
export const AMENITY_ICON_REGISTRY: Record<string, AmenityIconDefinition> = {
  // Badges (assets/icons/badges/features/)
  'Wifi Access': {
    assetPath: 'assets/icons/badges/features/wifi_badge.svg',
    displayName: 'Wi-Fi Access',
    group: 'Badge',
  },
  wifi_badge: {
    assetPath: 'assets/icons/badges/features/wifi_badge.svg',
    displayName: 'Wi-Fi Access',
    group: 'Badge',
  },
  'Family Friendly': {
    assetPath: 'assets/icons/badges/features/family_friendly.svg',
    displayName: 'Family Friendly',
    group: 'Badge',
  },
  family_friendly: {
    assetPath: 'assets/icons/badges/features/family_friendly.svg',
    displayName: 'Family Friendly',
    group: 'Badge',
  },
  'Esopus Creek Access': {
    assetPath: 'assets/icons/badges/features/esopus_creek_access.svg',
    displayName: 'Esopus Creek Access',
    group: 'Badge',
  },
  esopus_creek_access: {
    assetPath: 'assets/icons/badges/features/esopus_creek_access.svg',
    displayName: 'Esopus Creek Access',
    group: 'Badge',
  },
  'Esopus Creek Access 1': {
    assetPath: 'assets/icons/badges/features/esopus_creek_access1.svg',
    displayName: 'Esopus Creek Access 1',
    group: 'Badge',
  },
  esopus_creek_access1: {
    assetPath: 'assets/icons/badges/features/esopus_creek_access1.svg',
    displayName: 'Esopus Creek Access 1',
    group: 'Badge',
  },
  'Dog Friendly': {
    assetPath: 'assets/icons/badges/features/dog_friendly.svg',
    displayName: 'Dog Friendly',
    group: 'Badge',
  },
  dog_friendly: {
    assetPath: 'assets/icons/badges/features/dog_friendly.svg',
    displayName: 'Dog Friendly',
    group: 'Badge',
  },
  'Direct Trailhead Access': {
    assetPath: 'assets/icons/badges/features/direct_trail_access.svg',
    displayName: 'Direct Trailhead Access',
    group: 'Badge',
  },
  direct_trail_access: {
    assetPath: 'assets/icons/badges/features/direct_trail_access.svg',
    displayName: 'Direct Trailhead Access',
    group: 'Badge',
  },
  'Adults Only': {
    assetPath: 'assets/icons/badges/features/adults_only.svg',
    displayName: 'Adults Only',
    group: 'Badge',
  },
  adults_only: {
    assetPath: 'assets/icons/badges/features/adults_only.svg',
    displayName: 'Adults Only',
    group: 'Badge',
  },

  // Room Features (assets/icons/icons-simple/)
  'Walden Bathing Suite Den Alcove': {
    assetPath: 'assets/icons/icons-simple/walden_bathing_suite_den_alcove.svg',
    displayName: 'Walden Bathing Suite Den Alcove',
    group: 'Room Feature',
  },
  walden_bathing_suite_den_alcove: {
    assetPath: 'assets/icons/icons-simple/walden_bathing_suite_den_alcove.svg',
    displayName: 'Walden Bathing Suite Den Alcove',
    group: 'Room Feature',
  },
  'Alpine Bathing Suite Den': {
    assetPath: 'assets/icons/icons-simple/walden_bathing_suite_den.svg',
    displayName: 'Alpine Bathing Suite Den',
    group: 'Room Feature',
  },
  walden_bathing_suite_den: {
    assetPath: 'assets/icons/icons-simple/walden_bathing_suite_den.svg',
    displayName: 'Alpine Bathing Suite Den',
    group: 'Room Feature',
  },
  'Opas Living Room': {
    assetPath: 'assets/icons/icons-simple/opas_livingroom.svg',
    displayName: "Opa's Living Room",
    group: 'Room Feature',
  },
  opas_livingroom: {
    assetPath: 'assets/icons/icons-simple/opas_livingroom.svg',
    displayName: "Opa's Living Room",
    group: 'Room Feature',
  },
  'Cabin Sitting Area': {
    assetPath: 'assets/icons/icons-simple/cabin_sitting_area.svg',
    displayName: 'Cabin Sitting Area',
    group: 'Room Feature',
  },
  cabin_sitting_area: {
    assetPath: 'assets/icons/icons-simple/cabin_sitting_area.svg',
    displayName: 'Cabin Sitting Area',
    group: 'Room Feature',
  },
  'Slide Mountain Downstair Living Room': {
    assetPath: 'assets/icons/icons-simple/slide_mountain_downstairs_livingroom.svg',
    displayName: 'Slide Mountain Downstairs Living Room',
    group: 'Room Feature',
  },
  slide_mountain_downstairs_livingroom: {
    assetPath: 'assets/icons/icons-simple/slide_mountain_downstairs_livingroom.svg',
    displayName: 'Slide Mountain Downstairs Living Room',
    group: 'Room Feature',
  },
  'Chalet Living Room': {
    assetPath: 'assets/icons/icons-simple/chalet_upper_living_room.svg',
    displayName: 'Chalet Living Room',
    group: 'Room Feature',
  },
  chalet_upper_living_room: {
    assetPath: 'assets/icons/icons-simple/chalet_upper_living_room.svg',
    displayName: 'Chalet Living Room',
    group: 'Room Feature',
  },
  'Lodge Penthouse Living Room': {
    assetPath: 'assets/icons/icons-simple/lodge_penthouse_livingroom.svg',
    displayName: 'Lodge Penthouse Living Room',
    group: 'Room Feature',
  },
  lodge_penthouse_livingroom: {
    assetPath: 'assets/icons/icons-simple/lodge_penthouse_livingroom.svg',
    displayName: 'Lodge Penthouse Living Room',
    group: 'Room Feature',
  },
  'Letter-Writing Desk': {
    assetPath: 'assets/icons/icons-simple/letter_writing_desk.svg',
    displayName: 'Letter-Writing Desk',
    group: 'Room Feature',
  },
  letter_writing_desk: {
    assetPath: 'assets/icons/icons-simple/letter_writing_desk.svg',
    displayName: 'Letter-Writing Desk',
    group: 'Room Feature',
  },
  'Architectural Diamond Window': {
    assetPath: 'assets/icons/icons-simple/architectural_diamond_window.svg',
    displayName: 'Architectural Diamond Window',
    group: 'Room Feature',
  },
  architectural_diamond_window: {
    assetPath: 'assets/icons/icons-simple/architectural_diamond_window.svg',
    displayName: 'Architectural Diamond Window',
    group: 'Room Feature',
  },
  'Marshall Speaker': {
    assetPath: 'assets/icons/icons-simple/marshall_speaker.svg',
    displayName: 'Marshall Speaker',
    group: 'Room Feature',
  },
  marshall_speaker: {
    assetPath: 'assets/icons/icons-simple/marshall_speaker.svg',
    displayName: 'Marshall Speaker',
    group: 'Room Feature',
  },
  Minibar: {
    assetPath: 'assets/icons/icons-simple/minibar.svg',
    displayName: 'Minibar',
    group: 'Room Feature',
  },
  minibar: {
    assetPath: 'assets/icons/icons-simple/minibar.svg',
    displayName: 'Minibar',
    group: 'Room Feature',
  },
  'Alpine Bathing Suite Bear Pattern': {
    assetPath: 'assets/icons/icons-simple/alpine_bed_bear_pattern.svg',
    displayName: 'Alpine Bathing Suite Bear Pattern',
    group: 'Room Feature',
  },
  alpine_bed_bear_pattern: {
    assetPath: 'assets/icons/icons-simple/alpine_bed_bear_pattern.svg',
    displayName: 'Alpine Bathing Suite Bear Pattern',
    group: 'Room Feature',
  },
  'Alpine Bathing Suite Southwest Pattern': {
    assetPath: 'assets/icons/icons-simple/alpine_bed_southwest_pattern.svg',
    displayName: 'Alpine Bathing Suite Southwest Pattern',
    group: 'Room Feature',
  },
  alpine_bed_southwest_pattern: {
    assetPath: 'assets/icons/icons-simple/alpine_bed_southwest_pattern.svg',
    displayName: 'Alpine Bathing Suite Southwest Pattern',
    group: 'Room Feature',
  },
  'Scenic Views': {
    assetPath: 'assets/icons/icons-simple/view_from_window.svg',
    displayName: 'Scenic Views',
    group: 'Room Feature',
  },
  view_from_window: {
    assetPath: 'assets/icons/icons-simple/view_from_window.svg',
    displayName: 'Scenic Views',
    group: 'Room Feature',
  },

  // Heating Elements (assets/icons/icons-simple/)
  'River Stone Hearth FIreplace': {
    assetPath: 'assets/icons/icons-simple/river_stone_hearth_fireplace.svg',
    displayName: 'River Stone Hearth Fireplace',
    group: 'Heating Element',
  },
  river_stone_hearth_fireplace: {
    assetPath: 'assets/icons/icons-simple/river_stone_hearth_fireplace.svg',
    displayName: 'River Stone Hearth Fireplace',
    group: 'Heating Element',
  },
  'Cast Iron Wood Stove': {
    assetPath: 'assets/icons/icons-simple/cast_iron_wood_stove.svg',
    displayName: 'Cast Iron Wood Stove',
    group: 'Heating Element',
  },
  cast_iron_wood_stove: {
    assetPath: 'assets/icons/icons-simple/cast_iron_wood_stove.svg',
    displayName: 'Cast Iron Wood Stove',
    group: 'Heating Element',
  },
  'Enameled Gas Fireplace': {
    assetPath: 'assets/icons/icons-simple/enameled_gas_fireplace.svg',
    displayName: 'Enameled Gas Fireplace',
    group: 'Heating Element',
  },
  enameled_gas_fireplace: {
    assetPath: 'assets/icons/icons-simple/enameled_gas_fireplace.svg',
    displayName: 'Enameled Gas Fireplace',
    group: 'Heating Element',
  },

  // Kitchen Features (assets/icons/icons-simple/)
  'Chalet Full Kitchen': {
    assetPath: 'assets/icons/icons-simple/chalet_full_kitchen.svg',
    displayName: 'Chalet Full Kitchen',
    group: 'Kitchen Feature',
  },
  chalet_full_kitchen: {
    assetPath: 'assets/icons/icons-simple/chalet_full_kitchen.svg',
    displayName: 'Chalet Full Kitchen',
    group: 'Kitchen Feature',
  },
  'Lodge Penhouse Private Bar': {
    assetPath: 'assets/icons/icons-simple/lodge_penthouse_private_bar.svg',
    displayName: 'Lodge Penthouse Private Bar',
    group: 'Kitchen Feature',
  },
  lodge_penthouse_private_bar: {
    assetPath: 'assets/icons/icons-simple/lodge_penthouse_private_bar.svg',
    displayName: 'Lodge Penthouse Private Bar',
    group: 'Kitchen Feature',
  },
  'Full Kitchen': {
    assetPath: 'assets/icons/icons-simple/full_kitchen.svg',
    displayName: 'Full Kitchen',
    group: 'Kitchen Feature',
  },
  full_kitchen: {
    assetPath: 'assets/icons/icons-simple/full_kitchen.svg',
    displayName: 'Full Kitchen',
    group: 'Kitchen Feature',
  },
  'Ops Full Kitchen': {
    assetPath: 'assets/icons/icons-simple/opas_kitchen.svg',
    displayName: 'Opas Full Kitchen',
    group: 'Kitchen Feature',
  },
  opas_kitchen: {
    assetPath: 'assets/icons/icons-simple/opas_kitchen.svg',
    displayName: 'Opas Full Kitchen',
    group: 'Kitchen Feature',
  },
  'Ops Kitchen Full Table': {
    assetPath: 'assets/icons/icons-simple/opas_kitchen_full_table.svg',
    displayName: 'Opas Kitchen Full Table',
    group: 'Kitchen Feature',
  },
  opas_kitchen_full_table: {
    assetPath: 'assets/icons/icons-simple/opas_kitchen_full_table.svg',
    displayName: 'Opas Kitchen Full Table',
    group: 'Kitchen Feature',
  },

  // Basic Features (assets/icons/icons-simple/)
  'Pendleton Robe Dark': {
    assetPath: 'assets/icons/icons-simple/cowboy_robe_dark.svg',
    displayName: 'Pendleton Robe Dark',
    group: 'Basic Features',
  },
  cowboy_robe_dark: {
    assetPath: 'assets/icons/icons-simple/cowboy_robe_dark.svg',
    displayName: 'Pendleton Robe Dark',
    group: 'Basic Features',
  },
  'Pendleton Robe Light': {
    assetPath: 'assets/icons/icons-simple/cowboy_robe_light.svg',
    displayName: 'Pendleton Robe Light',
    group: 'Basic Features',
  },
  cowboy_robe_light: {
    assetPath: 'assets/icons/icons-simple/cowboy_robe_light.svg',
    displayName: 'Pendleton Robe Light',
    group: 'Basic Features',
  },
  'Bath Amenities': {
    assetPath: 'assets/icons/icons-simple/bath_amenities.svg',
    displayName: 'Bath Amenities',
    group: 'Basic Features',
  },
  bath_amenities: {
    assetPath: 'assets/icons/icons-simple/bath_amenities.svg',
    displayName: 'Bath Amenities',
    group: 'Basic Features',
  },
  'Heated Floors': {
    assetPath: 'assets/icons/icons-simple/heated_floors.svg',
    displayName: 'Heated Floors',
    group: 'Basic Features',
  },
  heated_floors: {
    assetPath: 'assets/icons/icons-simple/heated_floors.svg',
    displayName: 'Heated Floors',
    group: 'Basic Features',
  },

  // Water Features (assets/icons/icons-simple/)
  'Copper / Clawfoot Soaking Tub': {
    assetPath: 'assets/icons/icons-simple/copper_clawfoot_soaking_tub.svg',
    displayName: 'Copper / Clawfoot Soaking Tub',
    group: 'Water Feature',
  },
  copper_clawfoot_soaking_tub: {
    assetPath: 'assets/icons/icons-simple/copper_clawfoot_soaking_tub.svg',
    displayName: 'Copper / Clawfoot Soaking Tub',
    group: 'Water Feature',
  },
  'Walkin Rain Shower': {
    assetPath: 'assets/icons/icons-simple/walkin_rain_shower.svg',
    displayName: 'Walkin Rain Shower',
    group: 'Water Feature',
  },
  walkin_rain_shower: {
    assetPath: 'assets/icons/icons-simple/walkin_rain_shower.svg',
    displayName: 'Walkin Rain Shower',
    group: 'Water Feature',
  },
  'Outdoor Cedar Soaking Tub': {
    assetPath: 'assets/icons/icons-simple/outdoor_cedar_soaking_tub.svg',
    displayName: 'Outdoor Cedar Soaking Tub',
    group: 'Water Feature',
  },
  outdoor_cedar_soaking_tub: {
    assetPath: 'assets/icons/icons-simple/outdoor_cedar_soaking_tub.svg',
    displayName: 'Outdoor Cedar Soaking Tub',
    group: 'Water Feature',
  },

  // Bed Type Icons (assets/icons/icons-simple/)
  'Lodge Penthouse': {
    assetPath: 'assets/icons/icons-simple/bed_lodge_penthouse.svg',
    displayName: 'Lodge Penthouse Bed',
    group: 'Bed Type Icon',
  },
  bed_lodge_penthouse: {
    assetPath: 'assets/icons/icons-simple/bed_lodge_penthouse.svg',
    displayName: 'Lodge Penthouse Bed',
    group: 'Bed Type Icon',
  },
  'Single Bed with Headboard': {
    assetPath: 'assets/icons/icons-simple/bed_single_headboard.svg',
    displayName: 'Single Bed with Headboard',
    group: 'Bed Type Icon',
  },
  bed_single_headboard: {
    assetPath: 'assets/icons/icons-simple/bed_single_headboard.svg',
    displayName: 'Single Bed with Headboard',
    group: 'Bed Type Icon',
  },
  'Single Bed': {
    assetPath: 'assets/icons/icons-simple/single_bed.svg',
    displayName: 'Single Bed',
    group: 'Bed Type Icon',
  },
  single_bed: {
    assetPath: 'assets/icons/icons-simple/single_bed.svg',
    displayName: 'Single Bed',
    group: 'Bed Type Icon',
  },
  Cabin: {
    assetPath: 'assets/icons/icons-simple/bed_cabin.svg',
    displayName: 'Cabin Bed',
    group: 'Bed Type Icon',
  },
  bed_cabin: {
    assetPath: 'assets/icons/icons-simple/bed_cabin.svg',
    displayName: 'Cabin Bed',
    group: 'Bed Type Icon',
  },
  'Double Beds with Headboard': {
    assetPath: 'assets/icons/icons-simple/bed_double_headboard.svg',
    displayName: 'Double Beds with Headboard',
    group: 'Bed Type Icon',
  },
  bed_double_headboard: {
    assetPath: 'assets/icons/icons-simple/bed_double_headboard.svg',
    displayName: 'Double Beds with Headboard',
    group: 'Bed Type Icon',
  },
  'Two Beds': {
    assetPath: 'assets/icons/icons-simple/two_beds.svg',
    displayName: 'Two Beds',
    group: 'Bed Type Icon',
  },
  two_beds: {
    assetPath: 'assets/icons/icons-simple/two_beds.svg',
    displayName: 'Two Beds',
    group: 'Bed Type Icon',
  },

  // Outdoor Connection (assets/icons/icons-simple/)
  'Private Deck or Porch': {
    assetPath: 'assets/icons/icons-simple/private_deck_or_porch.svg',
    displayName: 'Private Deck or Porch',
    group: 'Outdoor Connection',
  },
  private_deck_or_porch: {
    assetPath: 'assets/icons/icons-simple/private_deck_or_porch.svg',
    displayName: 'Private Deck or Porch',
    group: 'Outdoor Connection',
  },
  'Patio Chair Round': {
    assetPath: 'assets/icons/icons-simple/patio_chairs_round.svg',
    displayName: 'Patio Chair Round',
    group: 'Outdoor Connection',
  },
  patio_chairs_round: {
    assetPath: 'assets/icons/icons-simple/patio_chairs_round.svg',
    displayName: 'Patio Chair Round',
    group: 'Outdoor Connection',
  },
  'Patio Chairs Square': {
    assetPath: 'assets/icons/icons-simple/patio_chairs_square.svg',
    displayName: 'Patio Chairs Square',
    group: 'Outdoor Connection',
  },
  patio_chairs_square: {
    assetPath: 'assets/icons/icons-simple/patio_chairs_square.svg',
    displayName: 'Patio Chairs Square',
    group: 'Outdoor Connection',
  },
  'Walden Balcony': {
    assetPath: 'assets/icons/icons-simple/walden_balcony.svg',
    displayName: 'Walden Balcony',
    group: 'Outdoor Connection',
  },
  walden_balcony: {
    assetPath: 'assets/icons/icons-simple/walden_balcony.svg',
    displayName: 'Walden Balcony',
    group: 'Outdoor Connection',
  },
};

export interface AmenityIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The icon name (e.g., 'Walden Bathing Suite Den Alcove', 'Wifi Access')
   * or the asset filename slug (e.g., 'wifi_badge', 'walden_bathing_suite_den_alcove').
   */
  name: AmenityIconName;
  /**
   * Focus/interaction state from the design file:
   * 'Default', 'Default on Focus', 'Active', 'Active on Focus', 'Inactive'
   * (or lowercase / kebab-case: 'default', 'default-on-focus', 'active', 'active-on-focus', 'inactive').
   */
  state?: AmenityState;
  /**
   * Optional amenity group validation matching the Figma component property.
   */
  group?: AmenityGroup;
  /**
   * Numeric size in pixels or CSS dimension.
   * If omitted, uses Tailwind 4 `size-*` utility (default size-6).
   */
  size?: number | string;
  /**
   * Direct override for the color token (e.g., 'var(--accent)', 'var(--paper-900)', 'var(--primary-foreground)').
   */
  color?: string;
  /**
   * Base URL path prefix if assets are mounted at a sub-path or custom CDN.
   * Defaults to '/'.
   */
  basePath?: string;
  /**
   * Additional classes. When setting equal dimensions, prefer Tailwind's `size-*` utility
   * (e.g., `size-4`, `size-6`, `size-8`, `size-[22px]`).
   */
  className?: string;
}

/**
 * AmenityIcon component rendering the official Figma amenity icon assets.
 * Applies exact CSS design tokens (var(--primary-foreground), var(--accent), var(--paper-900))
 * for all states via CSS mask.
 *
 * Example:
 * ```tsx
 * <AmenityIcon name="wifi_badge" />
 * <AmenityIcon name="Cabin Sitting Area" state="Active" className="size-8" />
 * <AmenityIcon name="esopus_creek_access" state="Inactive" size={28} />
 * ```
 */
export function AmenityIcon({
  name,
  state = 'default',
  group,
  size,
  color,
  basePath = '/',
  className = '',
  title,
  style,
  ...restProps
}: AmenityIconProps) {
  const definition = AMENITY_ICON_REGISTRY[name];

  if (!definition) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[AmenityIcon] Unknown amenity icon name: "${name}"`);
    }
    return null;
  }

  if (group && definition.group !== group && process.env.NODE_ENV !== 'production') {
    console.warn(
      `[AmenityIcon] Mismatched group for "${name}". Expected "${definition.group}", received "${group}".`
    );
  }

  const normalizedBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
  const resolvedSrc = `${normalizedBasePath}${definition.assetPath}`;
  const accessibleLabel = title ?? definition.displayName;

  // Determine state token (default fallback to var(--paper-900) if unspecified state)
  const resolvedColor = color ?? AMENITY_STATE_TOKENS[state] ?? 'var(--paper-900)';

  // Dimensions: inline styles if numeric size provided, otherwise Tailwind size-* classes
  const sizeStyle: React.CSSProperties =
    size !== undefined
      ? {
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }
      : {};

  const hasSizeClass = /\bsize-/.test(className);
  const defaultSizeClass = !hasSizeClass && size === undefined ? 'size-6' : '';

  return (
    <span
      role="img"
      aria-label={accessibleLabel}
      title={accessibleLabel}
      style={{
        display: 'inline-block',
        backgroundColor: resolvedColor,
        maskImage: `url("${resolvedSrc}")`,
        WebkitMaskImage: `url("${resolvedSrc}")`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        ...sizeStyle,
        ...style,
      }}
      className={`shrink-0 align-middle ${defaultSizeClass} ${className}`.trim()}
      {...restProps}
    />
  );
}

export default AmenityIcon;