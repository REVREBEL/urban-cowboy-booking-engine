import type { RateCardColor } from "../types/rate-card.ts";

export interface RateCardColorValue {
  hex: string;
  isLight: boolean;
}

export const RATE_CARD_COLORS: Record<RateCardColor, RateCardColorValue> = {
  paper: { hex: "#FAF9F9", isLight: true },
  ash: { hex: "#CCC7BB", isLight: true },
  "alpine-linen": { hex: "#EBE8E0", isLight: true },
  "nude-ember": { hex: "#F2AAA9", isLight: true },
  "lodge-yellow": { hex: "#FDDC4E", isLight: true },
  "oxidized-teal": { hex: "#236B7D", isLight: false },
  "lake-forest": { hex: "#0E301A", isLight: false },
  oxblood: { hex: "#69253A", isLight: false },
  "whiskey-sour": { hex: "#DDC5A4", isLight: true },
  "bandana-red": { hex: "#D65241", isLight: false },
  copper: { hex: "#9A5636", isLight: false },
  "cowboy-umber": { hex: "#4E332D", isLight: false },
  smoke: { hex: "#343833", isLight: false },
};

export function rateCardButtonTextColor(color: RateCardColor): string {
  return RATE_CARD_COLORS[color].isLight ? "#4E332D" : "#FFFFFF";
}
