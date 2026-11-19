"use client";

import { useState } from "react";
import {
  Button,
  COLOR_PALETTE,
  type ButtonColor,
  type ButtonSize,
  type ButtonStyle,
} from "../../src/components/ui/Button";
import { defineStory } from "../lib/story";

const colors = Object.keys(COLOR_PALETTE) as ButtonColor[];
const styles: ButtonStyle[] = ["filled", "outline", "transparent"];
const sizes: ButtonSize[] = ["xsmall", "small", "default", "medium", "large", "xlarge"];

export const buttonStory = defineStory({
  Component: Button,
  args: {
    initial: {
      children: "Book Your Stay",
      colorScheme: "lake-forest",
      borderColor: "faded",
      variant: "filled",
      size: "default",
      textCase: "uppercase",
      clickable: true,
      hasIcon: false,
      iconPosition: "right",
      isLoading: false,
      disabled: false,
    },
  },
});

/** Deterministic variant grid migrated from the former AllColors/TextCases/Sizes stories. */
function ButtonVariantsDemo() {
  const [clicks, setClicks] = useState(0);
  return (
    <div className="flex w-full flex-col gap-6">
      <section className="space-y-3">
        <h3 className="font-label text-sm uppercase tracking-wider">Variants and palette</h3>
        {styles.map((variant) => (
          <div key={variant} className="space-y-2">
            <p className="text-xs text-muted-foreground">{variant}</p>
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-paper p-3">
              {colors.map((color) => (
                <Button key={color} type="button" colorScheme={color} variant={variant} size="small">
                  {color}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </section>
      <section className="space-y-2">
        <h3 className="font-label text-sm uppercase tracking-wider">Sizes</h3>
        <div className="flex flex-wrap items-center gap-2">
          {sizes.map((size) => (
            <Button key={size} type="button" colorScheme="copper" size={size}>{size}</Button>
          ))}
        </div>
      </section>
      <section className="space-y-2">
        <h3 className="font-label text-sm uppercase tracking-wider">States and text case</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button colorScheme="copper" isLoading>Loading</Button>
          <Button colorScheme="copper" disabled>Disabled</Button>
          <Button colorScheme="copper" clickable={false}>Static</Button>
          <Button colorScheme="copper" textCase="lowercase">lowercase</Button>
          <Button colorScheme="copper" textCase="title">Title case</Button>
        </div>
        <Button
          colorScheme="lake-forest"
          onClick={() => setClicks((value) => value + 1)}
        >
          Clicked {clicks} times
        </Button>
      </section>
    </div>
  );
}

export const buttonVariantsStory = defineStory({
  Component: ButtonVariantsDemo,
  args: { initial: {} },
});
