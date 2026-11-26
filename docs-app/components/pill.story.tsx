"use client";

import { useState } from "react";
import { Pill, PillButton } from "../../src/components/ui/Pill";
import {
  Button,
  COLOR_PALETTE,
  type ButtonColor,
  type ButtonStyle,
} from "../../src/components/ui/Button";
import { defineStory } from "../lib/story";

const colors = Object.keys(COLOR_PALETTE) as ButtonColor[];
const styles: ButtonStyle[] = ["filled", "outline", "transparent"];
const sizes = ["xsmall", "small", "default", "large"] as const;

export const pillStory = defineStory({
  Component: Pill,
  args: {
    initial: {
      children: "Dogs allowed",
      colorScheme: "lake-forest",
      variant: "filled",
      size: "default",
      textCase: "title",
    },
  },
});

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

function PillVariantsDemo() {
  return (
    <div className="flex w-full flex-col gap-6">
      {styles.map((variant) => (
        <section key={variant} className="space-y-3">
          <h3 className="font-label text-sm uppercase tracking-wider">{variant}</h3>
          {[["bg-paper", "Light"], ["bg-smoke", "Dark"]].map(([surface, label]) => (
            <div key={surface} className="space-y-2">
              <p className="text-xs text-muted-foreground">{label} surface</p>
              <div className={`flex flex-wrap items-center gap-2 rounded-xl ${surface} p-3`}>
                {colors.map((color) => (
                  <Pill key={color} colorScheme={color} variant={variant}>
                    {color}
                  </Pill>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      <section className="space-y-2">
        <h3 className="font-label text-sm uppercase tracking-wider">Text case</h3>
        <div className="flex flex-wrap items-center gap-2">
          {(["uppercase", "title", "lowercase"] as const).map((textCase) => (
            <Pill key={textCase} textCase={textCase} colorScheme="lake-forest">
              dogs allowed on property
            </Pill>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="font-label text-sm uppercase tracking-wider">Border colors</h3>
        <div className="flex flex-wrap items-center gap-2">
          {(["background", "foreground", "faded"] as const).map((borderColor) => (
            <Pill key={borderColor} colorScheme="copper" borderColor={borderColor} variant="filled">
              {borderColor}
            </Pill>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="font-label text-sm uppercase tracking-wider">Sizes</h3>
        <div className="flex flex-wrap items-center gap-2">
          {sizes.map((size) => (
            <Pill key={size} colorScheme="copper" size={size}>
              {size}
            </Pill>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="font-label text-sm uppercase tracking-wider">Interactive states</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Pill colorScheme="copper" clickable>Hover styling</Pill>
          <Pill colorScheme="copper" clickable={false}>Static styling</Pill>
          <PillButton colorScheme="copper" clickable={false}>PillButton without hover</PillButton>
        </div>
        <InteractiveExamples />
      </section>

      <section className="space-y-3">
        <h3 className="font-label text-sm uppercase tracking-wider">Compared with Button</h3>
        {colors.map((color) => (
          <div key={color} className="flex flex-wrap items-center gap-3 border-b border-smoke/30 py-3">
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
      </section>
    </div>
  );
}

export const pillVariantsStory = defineStory({
  Component: PillVariantsDemo,
  args: { initial: {} },
});
