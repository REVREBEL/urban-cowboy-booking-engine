import { defineStory } from "../lib/story";
import { ColorSwatch } from "./color-swatch";

export const colorSwatchStory = defineStory({
  Component: ColorSwatch,
  args: {
    initial: {
      colorName: "Lake Forest",
      colorToken: "--lake-forest",
      hexValue: "#184428",
      oklchValue: "oklch(27.72% 0.05 152.42)",
    },
  },
});
