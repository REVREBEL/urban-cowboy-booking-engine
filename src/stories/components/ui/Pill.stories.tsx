import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pill, PillButton } from "@/components/ui/Pill";
import { Button, COLOR_PALETTE, type ButtonColor, type ButtonStyle } from "@/components/ui/Button";

const colors = Object.keys(COLOR_PALETTE) as ButtonColor[];
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
    borderColor: { control: "inline-radio", options: ["background", "foreground", "faded"], name: "Border Color" },
    clickable: { control: "boolean" },
    variant: { control: "inline-radio", options: styles },
    size: { control: "inline-radio", options: ["xsmall", "small", "default", "large"] },
    textCase: { control: "inline-radio", options: ["uppercase", "title", "lowercase"], name: "Text Case" },
  },
  args: {
    children: "Dogs allowed",
    colorScheme: "lake-forest",
    borderColor: "faded",
    clickable: false,
    variant: "filled",
    size: "default",
    textCase: "title",
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

export const TextCases: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(["uppercase", "title", "lowercase"] as const).map((textCase) => (
        <Pill key={textCase} textCase={textCase} colorScheme="lake-forest">dogs allowed on property</Pill>
      ))}
    </div>
  ),
};

export const BorderColors: Story = {
  render: () => <div className="flex flex-wrap items-center gap-3">{(["background", "foreground", "faded"] as const).map((borderColor) => <Pill key={borderColor} colorScheme="copper" borderColor={borderColor} variant="filled">{borderColor}</Pill>)}</div>,
};
export const Clickable: Story = {
  render: () => <div className="flex flex-wrap items-center gap-3"><Pill colorScheme="copper" clickable>Hover styling</Pill><Pill colorScheme="copper" clickable={false}>Static styling</Pill><PillButton colorScheme="copper" clickable={false}>PillButton without hover</PillButton></div>,
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
        <div key={color} className="flex flex-wrap items-center gap-4 border-b border-smoke/30 py-3">
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