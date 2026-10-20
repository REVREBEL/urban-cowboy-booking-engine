// src/stories/components/rooms/AmenityIcons.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AmenityIcons } from "@/components/rooms/AmenityIcons";
import type { TourIcon } from "@/journey/tour";

const ALL_ICONS: TourIcon[] = [
  "seat",
  "tub",
  "robes",
  "window",
  "stove",
  "desk",
  "outdoor-tub",
];

const meta: Meta<typeof AmenityIcons> = {
  title: "Components/Rooms/AmenityIcons",
  component: AmenityIcons,
  tags: ["autodocs"],
  args: {
    icon: "seat",
  },
  argTypes: {
    icon: {
      control: "select",
      options: ALL_ICONS,
      description: "Fallback TourIcon identifier used when iconPath is empty.",
    },
    iconPath: {
      control: "text",
      description: "CMS-provided SVG or image URL path.",
    },
    className: {
      control: "text",
      description: "Additional CSS classes applied to the wrapper.",
    },
  },
} satisfies Meta<typeof AmenityIcons>;

export default meta;
type Story = StoryObj<typeof AmenityIcons>;

/**
 * Interactive playground with full control over all component props.
 */
export const Playground: Story = {
  args: {
    icon: "seat",
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-6">
        <div className="relative flex size-24 items-center justify-center rounded-full bg-primary p-3 text-primary-foreground shadow-md">
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * Grid displaying all available fallback TourIcon variants.
 */
export const AllIcons: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 p-4">
      {ALL_ICONS.map((iconName) => (
        <div
          key={iconName}
          className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 p-4 bg-white shadow-sm"
        >
          <div className="relative flex size-20 items-center justify-center rounded-full bg-primary p-3 text-primary-foreground">
            <AmenityIcons icon={iconName} />
          </div>
          <span className="text-xs font-mono text-neutral-600">{iconName}</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * Demonstrates color inheritance across dark (inactive) and light (hover) themes.
 */
export const ThemeContexts: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-6 p-4">

      <div className="flex flex-col items-center gap-2">
        <div className="relative flex size-24 items-center justify-center rounded-full bg-primary p-3 text-primary-foreground border border-neutral-300">
          <AmenityIcons icon="seat" />
        </div>
        <span className="text-xs font-medium text-neutral-600">Primary</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="relative flex size-24 items-center justify-center rounded-full bg-secondary-foreground p-3 text-secondary border border-neutral-300">
          <AmenityIcons icon="seat" />
        </div>
        <span className="text-xs font-medium text-neutral-600">Secondary Foreground</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="relative flex size-24 items-center justify-center rounded-full bg-secondary p-3 text-secondary-foreground">
          <AmenityIcons icon="seat" />
        </div>
        <span className="text-xs font-medium text-neutral-600">Secondary</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="relative flex size-24 items-center justify-center rounded-full bg-accent p-3 text-accent-foreground">
          <AmenityIcons icon="seat" />
        </div>
        <span className="text-xs font-medium text-neutral-600">Accent</span>
      </div>
    </div>
  ),
};