import type { Meta, StoryObj } from "@storybook/react-vite";
import { PhotoTourArrow } from "@/journey/PhotoTourArrow";

const DIRECTIONS = ["up", "down", "left", "right"] as const;

const meta: Meta<typeof PhotoTourArrow> = {
  title: "Journey/Photo Tour Arrow",
  component: PhotoTourArrow,
  tags: ["autodocs"],
  args: {
    direction: "right",
    size: 24,
    chevron: false,
  },
  argTypes: {
    direction: { control: "select", options: DIRECTIONS, description: "Orientation of the arrow/chevron.", },
    size: { control: { type: "range", min: 12, max: 64, step: 2 }, description: "Icon bounding box size in pixels.", },
    chevron: { control: "boolean", description: "When true, forces rendering of the custom inline SVG chevron instead of the image arrow.", },
  },
  decorators: [(Story) => <div className="flex min-h-32 items-center justify-center bg-primary-foreground text-primary"><Story /></div>],
} satisfies Meta<typeof PhotoTourArrow>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Arrow: Story = {};
export const Chevron: Story = { args: { chevron: true, size: 28, } };
export const Back: Story = { args: { direction: "left", size: 28 } };


/**
 * Interactive playground with full control over direction, size, and mode.
 */
export const Playground: Story = {};

/**
 * Chevron mode rendered in all 4 cardinal directions.
 */
export const ChevronDirections: Story = {
  args: {
    chevron: true,
    size: 28,
  },
  render: (args) => (
    <div className="flex items-center gap-8 p-4 rounded-xl bg-primary-foreground">
      {DIRECTIONS.map((dir) => (
        <div key={dir} className="flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary-foreground shadow-sm border border-card text-primary-foreground">
            <PhotoTourArrow {...args} direction={dir} />
          </div>
          <span className="text-xs font-label text-primary uppercase">
            {dir}
          </span>
        </div>
      ))}
    </div>
  ),
};

/**
 * Side-by-side comparison between standard image arrow assets and inline SVG chevrons.
 */
export const AssetVsChevronComparison: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6 p-4 max-w-md">
      {/* Default Asset Column */}
      <div className="flex flex-col gap-4 p-4 rounded-xl border border-neutral-200 bg-primary-foreground shadow-sm">
        <h4 className="font-label text-xs font-semibold uppercase tracking-wider text-primary">
          Image Asset Arrows
        </h4>
        <div className="flex items-center justify-around text-primary">
          {DIRECTIONS.map((dir) => (
            <PhotoTourArrow key={dir} direction={dir} size={24} chevron={false} />
          ))}
        </div>
      </div>

      {/* Chevron Column */}
      <div className="flex flex-col gap-4 p-4 rounded-xl border border-neutral-200 bg-primary-foreground shadow-sm">
        <h4 className="font-label text-xs font-semibold uppercase tracking-wider text-primary">
          Inline SVG Chevrons
        </h4>
        <div className="flex items-center justify-around text-primary">
          {DIRECTIONS.map((dir) => (
            <PhotoTourArrow key={dir} direction={dir} size={24} chevron={true} />
          ))}
        </div>
      </div>
    </div>
  ),
};

/**
 * Demonstrates scale adaptability across typical UI sizing steps.
 */
export const Sizes: Story = {
  args: {
    chevron: true,
    direction: "right",
  },
  render: (args) => (
    <div className="flex items-end gap-6 p-4">
      {[16, 20, 24, 32, 48].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center text-primary">
            <PhotoTourArrow {...args} size={size} />
          </div>
          <span className="text-xs font-mono text-neutral-500">{size}px</span>
        </div>
      ))}
    </div>
  ),
};