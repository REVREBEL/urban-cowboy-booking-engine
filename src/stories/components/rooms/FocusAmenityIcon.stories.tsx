// src/stories/components/rooms/FocusAmenityIcons.stories.tsx

import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from 'react';

import {
  AmenityIcon,
  AMENITY_ICON_REGISTRY,
  AMENITY_STATE_TOKENS,
  DESIGN_TOKENS,
  type AmenityIconName,
  type AmenityState,
  type AmenityGroup,
} from "@/components/rooms/FocusAmenityIcon";


// Extract canonical display names for controls
const canonicalNames: AmenityIconName[] = [
  'Wifi Access',
  'Family Friendly',
  'Esopus Creek Access',
  'Dog Friendly',
  'Direct Trailhead Access',
  'Adults Only',
  'Walden Bathing Suite Den Alcove',
  'Alpine Bathing Suite Den',
  'Opas Living Room',
  'Cabin Sitting Area',
  'Slide Mountain Downstair Living Room',
  'Chalet Living Room',
  'Lodge Penthouse Living Room',
  'Letter-Writing Desk',
  'Architectural Diamond Window',
  'River Stone Hearth FIreplace',
  'Cast Iron Wood Stove',
  'Enameled Gas Fireplace',
  'Chalet Full Kitchen',
  'Lodge Penhouse Private Bar',
  'Full Kitchen',
  'Ops Full Kitchen',
  'Ops Kitchen Full Table',
  'Pendleton Robe Dark',
  'Pendleton Robe Light',
  'Bath Amenities',
  'Heated Floors',
  'Copper / Clawfoot Soaking Tub',
  'Walkin Rain Shower',
  'Outdoor Cedar Soaking Tub',
  'Lodge Penthouse',
  'Alpine Bathing Suite Bear Pattern',
  'Alpine Bathing Suite Southwest Pattern',
  'Single Bed with Headboard',
  'Single Bed',
  'Cabin',
  'Double Beds with Headboard',
  'Two Beds',
  'Scenic Views',
  'Marshall Speaker',
  'Minibar',
  'Private Deck or Porch',
  'Patio Chair Round',
  'Patio Chairs Square',
  'Walden Balcony',
];

const availableStates: AmenityState[] = [
  'Default',
  'Default on Focus',
  'Active',
  'Active on Focus',
  'Inactive',
];

const meta: Meta<typeof AmenityIcon> = {
  title: "Components/Rooms/FocusAmenity/FocusAmenityIcon",
  component: AmenityIcon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    name: {
      control: 'select',
      options: canonicalNames,
      description: 'Amenity icon name or filename slug from Figma',
    },
    state: {
      control: 'select',
      options: availableStates,
      description: 'Focus/interaction state mapping to CSS tokens',
    },
    size: {
      control: { type: 'number', min: 16, max: 120, step: 4 },
      description: 'Explicit pixel size (optional; prefer Tailwind size-* utility)',
    },
    color: {
      control: 'text',
      description: 'Direct CSS variable token override (e.g., var(--accent))',
    },
    className: {
      control: 'text',
      description: 'Tailwind utility classes (e.g., size-8, hover:size-10)',
    },
    basePath: {
      control: 'text',
      description: 'Base asset path prefix',
    },
  },
  args: {
    name: 'Wifi Access',
    state: 'Default',
    className: 'size-10',
    basePath: '/',
  },
};

export default meta;
type Story = StoryObj<typeof AmenityIcon>;

/**
 * Primary interactive story with full Storybook Controls.
 */
export const Default: Story = {
  args: {
    name: 'Wifi Access',
    state: 'Default',
    className: 'size-12',
  },
};

/**
 * Focus & interaction states derived from FocusAmenityStates:
 * - Default -> var(--accent)
 * - Default on Focus -> var(--paper-900)
 * - Active -> var(--paper-900)
 * - Active on Focus -> var(--accent)
 * - Inactive -> var(--primary-foreground)
 */
export const AllStates: Story = {
  render: (args) => {
    const states: { label: AmenityState; tokenKey: string; tokenVar: string }[] = [
      { label: 'Default', tokenKey: 'var(--accent)', tokenVar: DESIGN_TOKENS.accent },
      { label: 'Default on Focus', tokenKey: 'var(--paper-900)', tokenVar: DESIGN_TOKENS.paper900 },
      { label: 'Active', tokenKey: 'var(--paper-900)', tokenVar: DESIGN_TOKENS.paper900 },
      { label: 'Active on Focus', tokenKey: 'var(--accent)', tokenVar: DESIGN_TOKENS.accent },
      { label: 'Inactive', tokenKey: 'var(--primary-foreground)', tokenVar: DESIGN_TOKENS.primaryForeground },
    ];

    return (
      <div className="flex flex-col gap-6 p-6 rounded-2xl bg-(--primary-foreground)]/5 border border-(--primary-foreground)/15">
        <div>
          <h3 className="text-base font-semibold text-paper-900">
            Focus & Interaction States
          </h3>
          <p className="text-xs text-(--accent) mt-1">
            Bound directly to CSS style tokens without hardcoded values.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {states.map(({ label, tokenKey, tokenVar }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-between p-4 rounded-xl border border-(--primary-foreground)/20 bg-(--primary-foreground)]/5 text-center min-w-32.5"
            >
              <div className="flex items-center justify-center size-20 rounded-lg bg-(--primary-foreground)]/10">
                <AmenityIcon
                  name={args.name ?? 'Walden Bathing Suite Den Alcove'}
                  state={label}
                  className="size-12"
                />
              </div>
              <div className="mt-3">
                <span className="block text-xs font-semibold text-paper-900">
                  {label}
                </span>
                <code
                  className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded font-mono"
                  style={{ color: tokenVar }}
                >
                  {tokenKey}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Responsive sizing scale using Tailwind 4 `size-*` utilities.
 */
export const Sizes: Story = {
  render: (args) => {
    const sizeVariants = [
      { label: 'size-4 (16px)', className: 'size-4' },
      { label: 'size-6 (24px)', className: 'size-6' },
      { label: 'size-8 (32px)', className: 'size-8' },
      { label: 'size-12 (48px)', className: 'size-12' },
      { label: 'size-16 (64px)', className: 'size-16' },
      { label: 'size-[96px] (Figma)', className: 'size-[96px]' },
    ];

    return (
      <div className="flex flex-col gap-6 p-6 rounded-2xl bg-(--primary-foreground)]/5 border border-(--primary-foreground)/15">
        <div>
          <h3 className="text-base font-semibold text-paper-900">
            Tailwind 4 Sizing Scale
          </h3>
          <p className="text-xs text-(--accent) mt-1">
            Standardized with Tailwind 4 `size-*` utilities instead of separate width and height.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-6">
          {sizeVariants.map((variant) => (
            <div
              key={variant.label}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-(--primary-foreground)/10"
            >
              <AmenityIcon
                name={args.name ?? 'Direct Trailhead Access'}
                state={args.state ?? 'Default'}
                className={variant.className}
              />
              <span className="text-[11px] font-mono text-(--accent)">
                {variant.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Feature Badges from `assets/icons/badges/features/`.
 */
export const FeatureBadges: Story = {
  render: () => {
    const badges: AmenityIconName[] = [
      'Wifi Access',
      'Family Friendly',
      'Esopus Creek Access',
      'Dog Friendly',
      'Direct Trailhead Access',
      'Adults Only',
    ];

    return (
      <div className="flex flex-col gap-4 p-6 rounded-2xl bg-(--primary-foreground)]/5 border border-(--primary-foreground)/15">
        <div>
          <h3 className="text-base font-semibold text-paper-900">
            Feature & Property Badges
          </h3>
          <p className="text-xs text-(--accent) mt-1">
            Located in `assets/icons/badges/features/`
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {badges.map((badgeName) => (
            <div
              key={badgeName}
              className="flex flex-col items-center p-3 rounded-xl border border-(--primary-foreground)/20 bg-(--primary-foreground)]/10 text-center"
            >
              <AmenityIcon name={badgeName} state="Active" className="size-10" />
              <span className="mt-2 text-xs font-medium text-paper-900 line-clamp-2">
                {badgeName}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Grouped Directory showing icons by Figma Amenity Group.
 */
export const AllIconsByGroup: Story = {
  render: () => {
    const groups: AmenityGroup[] = [
      'Badge',
      'Room Feature',
      'Heating Element',
      'Kitchen Feature',
      'Basic Features',
      'Water Feature',
      'Bed Type Icon',
      'Outdoor Connection',
    ];

    // Filter canonical names by group
    const groupedIcons = groups.map((grp) => ({
      group: grp,
      icons: canonicalNames.filter((name) => AMENITY_ICON_REGISTRY[name]?.group === grp),
    }));

    return (
      <div className="flex flex-col gap-8 max-w-4xl p-6 rounded-2xl bg-(--primary-foreground)]/5 border border-(--primary-foreground)/15">
        <div>
          <h3 className="text-lg font-bold text-paper-900">
            Amenity Icons Catalog
          </h3>
          <p className="text-xs text-(--accent) mt-1">
            All 44 amenity icons grouped by Figma design component groups.
          </p>
        </div>

        {groupedIcons.map(({ group, icons }) => (
          <div key={group} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-(--primary-foreground)/20 pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-paper-900">
                {group}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-(--accent)/15 text-(--accent) font-semibold">
                {icons.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {icons.map((iconName) => (
                <div
                  key={iconName}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-(--primary-foreground)/15 bg-(--primary-foreground)]/5 text-center transition hover:border-(--accent)"
                >
                  <AmenityIcon name={iconName} state="Default" className="size-8" />
                  <span className="mt-2 text-[11px] font-medium text-paper-900 line-clamp-2">
                    {iconName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

/**
 * Interactive State Simulator for testing transitions.
 */
export const InteractiveExplorer: Story = {
  render: () => {
    const [selectedState, setSelectedState] = useState<AmenityState>('Default');
    const [sampleIcon, setSampleIcon] = useState<AmenityIconName>('Walden Bathing Suite Den Alcove');
    const currentStateToken = AMENITY_STATE_TOKENS[selectedState as AmenityState] ?? DESIGN_TOKENS.accent;

    return (
      <div className="flex flex-col gap-6 p-6 rounded-2xl max-w-md bg-(--primary-foreground)/5 border border-(--primary-foreground)/15">
        <div>
          <h3 className="text-base font-semibold text-paper-900">
            Interactive State Switcher
          </h3>
          <p className="text-xs text-(--accent) mt-1">
            Click states to test token color switches in real-time.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-(--primary-foreground)/20 bg-(--primary-foreground)/10">
          <AmenityIcon name={sampleIcon} state={selectedState} className="size-20" />
          <span className="mt-4 text-sm font-semibold text-paper-900">
            {sampleIcon}
          </span>
          <span className="text-xs text-(--accent) mt-0.5">
            Active State: <strong>{selectedState}</strong>
          </span>
          <code
            className="mt-2 text-xs font-mono px-2 py-0.5 rounded"
            style={{ color: currentStateToken }}
          >
            {currentStateToken}
          </code>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-paper-900">
            Select State:
          </label>
          <div className="flex flex-wrap gap-2">
            {availableStates.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedState(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                  selectedState === st
                    ? 'border-paper-900 bg-paper-900 text-primary-foreground'
                    : 'border-(--primary-foreground)/25 text-paper-900 hover:bg-(--primary-foreground)/10'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-paper-900">
            Quick Icon Switch:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Walden Bathing Suite Den Alcove',
              'Cast Iron Wood Stove',
              'Copper / Clawfoot Soaking Tub',
              'Wifi Access',
              'Patio Chair Round',
            ].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setSampleIcon(name as AmenityIconName)}
                className={`px-2 py-1 text-[11px] rounded border transition ${
                  sampleIcon === name
                    ? 'border-(--accent) font-semibold text-paper-900 bg-(--accent)/15'
                    : 'border-(--primary-foreground)/20 text-(--accent) hover:bg-(--primary-foreground)]/10'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  },
};