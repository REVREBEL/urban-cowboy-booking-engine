"use client";

import { Pill } from "../../src/components/ui/Pill";
import { defineStory } from "../lib/story";

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
