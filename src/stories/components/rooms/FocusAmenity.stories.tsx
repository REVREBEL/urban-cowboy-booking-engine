// src/stories/components/rooms/FocusAmenity.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FocusAmenity } from "@/components/rooms/FocusAmenity";

const sampleDescription =
  "The Cabin keeps the sleeping setup relaxed: a proper king bed anchors the room, while the built-in bunk or lounging nook gives you another place to stretch out, read, or tuck someone in without turning the whole space into a bedroom.";

const meta: Meta<typeof FocusAmenity> = {
  title: "Components/Rooms/FocusAmenity",
  component: FocusAmenity,
  tags: ["autodocs"],
  args: {
    count: 1,
    icon: "tub",
    title: "Clawfoot soaking tub",
    description: sampleDescription,
    state: "Default",
    active: false,
    tone: "standard",
    onSelect: () => {},
  },
  argTypes: {
    state: {
      control: "select",
      options: ["Default", "Hover", "Active", "Inactive", "Disabled"],
      description: "Explicit design state matching Figma node 1199-3106",
    },
    tone: {
      control: "inline-radio",
      options: ["standard", "faded"],
      description: "Visual tone for the amenity button",
    },
    active: {
      control: "boolean",
      description: "Convenience boolean toggle for active state",
    },
    icon: {
      control: "select",
      options: [
        "tub",
        "robes",
        "seat",
        "window",
        "stove",
        "desk",
        "outdoor-tub",
      ],
      description: "Amenity icon identifier",
    },
    count: {
      control: "number",
      description: "Item index or count displayed in the badge",
    },
    title: {
      control: "text",
      description: "Heading text displayed in tooltip and active card",
    },
    description: {
      control: "text",
      description: "Expanded description text shown in the active state card",
    },
    onSelect: {
      action: "onSelect",
      description: "Callback triggered when button is clicked",
    },
  },
} satisfies Meta<typeof FocusAmenity>;

export default meta;

type Story = StoryObj<typeof FocusAmenity>;

/**
 * Interactive playground with full control over all component props.
 */
export const Playground: Story = {};

/**
 * 1. Default State:
 * Cream foreground disc, dark green double rings, dark badge with count and plus action.
 */
export const Default: Story = {
  args: {
    state: "Default",
    active: false,
  },
};

/**
 * 2. Hover State:
 * Accent-toned foreground disc and badge with animated transition.
 */
export const Hover: Story = {
  args: {
    state: "Hover",
    active: false,
  },
};

/**
 * 3. Active State:
 * Rotated 'X' action icon, accent rings, and opened description card adjacent to the button.
 */
export const Active: Story = {
  args: {
    state: "Active",
    active: true,
    title: "Cabin King Bed + Bunk",
    description: sampleDescription,
  },
};

/**
 * 4. Inactive / Disabled State:
 * Solid dark green disc with cream double rings and icon; count/action badge is hidden.
 */
export const Inactive: Story = {
  args: {
    state: "Inactive",
    active: false,
  },
};

/**
 * All 4 Figma Design States displayed in a vertical stack matching the Figma design reference.
 */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-8 rounded-2xl bg-neutral-100 p-8">
      {/* 1. Default */}
      <div className="flex items-center gap-6">
        <FocusAmenity
          count={1}
          icon="seat"
          title="Sitting Area"
          state="Default"
        />
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          State: Default
        </span>
      </div>

      {/* 2. Hover */}
      <div className="flex items-center gap-6">
        <FocusAmenity
          count={1}
          icon="seat"
          title="Sitting Area"
          state="Hover"
        />
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          State: Hover
        </span>
      </div>

      {/* 3. Active with Expanded Card */}
      <div className="flex items-center gap-6">
        <FocusAmenity
          count={1}
          icon="seat"
          title="Cabin King Bed + Bunk"
          description={sampleDescription}
          state="Active"
          active={true}
        />
      </div>

      {/* 4. Inactive */}
      <div className="flex items-center gap-6">
        <FocusAmenity
          count={1}
          icon="seat"
          title="Sitting Area"
          state="Inactive"
        />
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          State: Inactive
        </span>
      </div>
    </div>
  ),
};

/**
 * Multiple amenity icons in their default state.
 */
export const IconsDefault: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-paper p-6">
      <FocusAmenity
        count={1}
        icon="robes"
        title="Pendleton Robes"
        state="Default"
      />
      <FocusAmenity
        count={2}
        icon="seat"
        title="Sitting Area"
        state="Default"
      />
      <FocusAmenity
        count={3}
        icon="window"
        title="Architectural Diamond Window"
        state="Default"
      />
      <FocusAmenity
        count={4}
        icon="stove"
        title="Cast Iron Wood Stove"
        state="Default"
      />
      <FocusAmenity
        count={5}
        icon="desk"
        title="Letter Writing Desk"
        state="Default"
      />
    </div>
  ),
};

/**
 * Multiple amenity icons in their active state.
 */
export const IconsActive: Story = {
  render: () => (
    <div className="flex flex-col gap-6 rounded-xl bg-paper p-6">
      <FocusAmenity
        count={1}
        icon="robes"
        title="Pendleton Robes"
        description="Plush custom Pendleton robes tailored for cool mountain mornings and evenings by the fire."
        state="Active"
        active={true}
      />
      <FocusAmenity
        count={2}
        icon="stove"
        title="Cast Iron Wood Stove"
        description="Authentic wood-burning stove providing warm radiant heat and crackling lodge ambiance."
        state="Active"
        active={true}
      />
    </div>
  ),
};

/**
 * Tone comparison between standard and faded tones.
 */
export const ToneComparison: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-8 rounded-xl bg-paper p-6">
      <div className="flex flex-col items-center gap-2">
        <FocusAmenity
          count={1}
          icon="tub"
          title="Standard Tone"
          tone="standard"
          state="Default"
        />
        <span className="text-xs text-neutral-500">Tone: Standard</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <FocusAmenity
          count={1}
          icon="tub"
          title="Faded Tone"
          tone="faded"
          state="Default"
        />
        <span className="text-xs text-neutral-500">Tone: Faded</span>
      </div>
    </div>
  ),
};