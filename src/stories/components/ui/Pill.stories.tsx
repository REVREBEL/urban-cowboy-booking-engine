import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pill, PillButton } from "@/components/ui/Pill";
import { Button, type ButtonColor, type ButtonStyle } from "@/components/ui/Button";

const colors: ButtonColor[] = [
  "dark",
  "light",
  "alpine-linen",
  "cowboy-umber",
  "smoke",
  "lake-forest",
  "copper",
  "oxblood",
  "oxidized-teal",
  "bandana-red",
  "whiskey-sour",
  "lodge-yellow",
  "nude-ember",
  "paper",
];

const styles: ButtonStyle[] = ["filled", "outline", "transparent"];

const meta = {
  title: "Components/UI/Pill",
  component: Pill,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Reusable display and interactive pills. Colors and variants are drawn directly from the shared Button component. Interactive PillButton delegates to Button for focus and disabled behavior.",
      },
    },
  },
  argTypes: {
    colorScheme: { control: "select", options: colors },
    color: { control: "select", options: colors },
    variant: { control: "inline-radio", options: styles },
    size: { control: "inline-radio", options: ["xsmall", "small", "default", "large"] },
  },
  args: {
    children: "Dogs allowed",
    colorScheme: "lake-forest",
    variant: "filled",
    size: "default",
  },
} satisfies Meta<typeof Pill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllColors: Story = {
  render: () => (
    <div className="space-y-7">
      {styles.map((variant) => (
        <section key={variant}>
          <h3 className="mb-3 font-label text-sm uppercase tracking-wider">{variant}</h3>
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-paper p-4">
            {colors.map((color) => (
              <Pill key={color} colorScheme={color} variant={variant}>
                {color}
              </Pill>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl bg-smoke p-4">
            {colors.map((color) => (
              <Pill key={color} colorScheme={color} variant={variant}>
                {color}
              </Pill>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(["xsmall", "small", "default", "large"] as const).map((size) => (
        <Pill key={size} colorScheme="copper" size={size}>
          {size}
        </Pill>
      ))}
    </div>
  ),
};

function InteractiveExamples() {
  const [features, setFeatures] = useState(["Outdoor soak"]);
  return (
    <div className="space-y-4 rounded-xl bg-smoke p-6">
      <p className="text-sm text-paper">Select your interests</p>
      <div className="flex flex-wrap gap-2">
        {["Outdoor soak", "Scenic views", "Fireplace", "Dog friendly"].map((feature) => {
          const selected = features.includes(feature);
          return (
            <PillButton
              key={feature}
              type="button"
              pressed={selected}
              variant={selected ? "filled" : "outline"}
              colorScheme={selected ? "alpine-linen" : "paper"}
              onClick={() =>
                setFeatures((items) =>
                  selected ? items.filter((item) => item !== feature) : [...items, feature]
                )
              }
            >
              {feature}
            </PillButton>
          );
        })}
      </div>
      <PillButton colorScheme="paper" variant="outline" disabled>
        Unavailable
      </PillButton>
      <p className="text-xs text-paper/80">Selected: {features.join(", ") || "none"}</p>
    </div>
  );
}

export const Selectable: Story = { render: () => <InteractiveExamples /> };

/** Side-by-side check that the Pill uses exactly the same color palette as Button. */
export const ComparedWithButtons: Story = {
  render: () => (
    <div className="space-y-4">
      {colors.map((color) => (
        <div key={color} className="flex flex-wrap items-center gap-4 border-b border-ash/30 py-3">
          <span className="w-32 text-sm">{color}</span>
          <Button colorScheme={color} variant="filled" size="xsmall">
            Button
          </Button>
          <Pill colorScheme={color} variant="filled">
            Pill
          </Pill>
          <Button colorScheme={color} variant="outline" size="xsmall">
            Button outline
          </Button>
          <Pill colorScheme={color} variant="outline">
            Pill outline
          </Pill>
        </div>
      ))}
    </div>
  ),
};