import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, COLOR_PALETTE, type ButtonColor, type ButtonSize, type ButtonStyle } from "@/components/ui/Button";

const colors = Object.keys(COLOR_PALETTE) as ButtonColor[];
const styles: ButtonStyle[] = ["filled", "outline", "transparent"];
const sizes: ButtonSize[] = ["xsmall", "small", "default", "medium", "large", "xlarge"];

const meta = {
  title: "Components/UI/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Shared booking-engine Button. Explore every palette color and visual variant on light and dark backgrounds, all six utility-driven sizes, and interactive loading, disabled and icon states.",
      },
    },
  },
  argTypes: {
    colorScheme: { control: false, description: "Alternative API alias. The showcase uses the color control." },
    color: { control: "select", options: colors },
    variant: { control: "inline-radio", options: styles },
    size: { control: "select", options: sizes },
    hasIcon: { control: "boolean" },
    iconPosition: { control: "inline-radio", options: ["left", "right"] },
    isLoading: { control: "boolean" },
    disabled: { control: "boolean" },
    onClick: { action: "clicked" },
  },
  args: {
    children: "Book Your Stay",
    color: "lake-forest",
    variant: "filled",
    size: "default",
    hasIcon: false,
    iconPosition: "right",
    isLoading: false,
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** Alias preserved for links pointing to the original Button story. */
export const Default: Story = {};

export const AllColors: Story = {
  render: () => (
    <div className="space-y-7">
      {styles.map((variant) => (
        <section key={variant}>
          <h3 className="mb-3 font-label text-sm uppercase tracking-wider">{variant}</h3>
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-paper p-4">
            {colors.map((color) => (
              <Button key={color} type="button" colorScheme={color} variant={variant} size="small">
                {color}
              </Button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl bg-smoke p-4">
            {colors.map((color) => (
              <Button key={color} type="button" colorScheme={color} variant={variant} size="small">
                {color}
              </Button>
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
      {sizes.map((size) => (
        <Button key={size} type="button" colorScheme="copper" size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
};

function InteractiveExamples() {
  const [selected, setSelected] = useState<"rooms" | "offers">("rooms");
  const [clicks, setClicks] = useState(0);
  return (
    <div className="space-y-5 rounded-xl bg-smoke p-6 text-paper">
      <p className="text-sm">Choose what to explore</p>
      <div className="flex flex-wrap gap-3">
        {(["rooms", "offers"] as const).map((item) => (
          <Button
            key={item}
            type="button"
            aria-pressed={selected === item}
            variant={selected === item ? "filled" : "outline"}
            colorScheme="alpine-linen"
            onClick={() => setSelected(item)}
          >
            {item === "rooms" ? "Rooms" : "Offers"}
          </Button>
        ))}
      </div>
      <Button type="button" colorScheme="whiskey-sour" hasIcon onClick={() => setClicks((value) => value + 1)}>
        Explore {selected}
      </Button>
      <div className="flex flex-wrap gap-3">
        <Button type="button" colorScheme="paper" variant="outline" isLoading>Checking availability</Button>
        <Button type="button" colorScheme="paper" variant="outline" disabled>Unavailable</Button>
        <Button type="button" colorScheme="alpine-linen" variant="transparent" hasIcon iconPosition="left">Go back</Button>
      </div>
      <p className="text-xs text-paper/80">Selected: {selected} · Explore clicks: {clicks}</p>
    </div>
  );
}

export const Interactive: Story = { render: () => <InteractiveExamples /> };

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-paper p-4">
      <Button colorScheme="cowboy-umber">Enabled</Button>
      <Button colorScheme="cowboy-umber" disabled>Disabled</Button>
      <Button colorScheme="cowboy-umber" isLoading>Loading</Button>
      <Button colorScheme="cowboy-umber" hasIcon>With icon</Button>
      <Button colorScheme="cowboy-umber" hasIcon iconPosition="left">Icon on left</Button>
    </div>
  ),
};

export const Outline: Story = { args: { variant: "outline", color: "copper" } };
export const Transparent: Story = { args: { variant: "transparent", color: "lake-forest" } };
export const WithIcon: Story = { args: { hasIcon: true, children: "Explore Suites" } };
export const Loading: Story = { args: { isLoading: true, children: "Checking Availability..." } };
export const Disabled: Story = { args: { disabled: true, children: "Sold Out" } };
