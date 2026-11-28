"use client";

import tokenData from "../lib/design-tokens.generated.json";
import { oklchToHex } from "../lib/oklch-hex";
import { ColorSwatch } from "./color-swatch";

/** The twelve main brand colors from the Figma palette, in design order. */
const MAIN_COLORS = [
  { name: "Lake Forest", token: "--lake-forest" },
  { name: "Paper", token: "--paper" },
  { name: "Alpine Linen", token: "--alpine-linen" },
  { name: "Smoke", token: "--smoke" },
  { name: "Copper", token: "--copper" },
  { name: "Whiskey Sour", token: "--whiskey-sour" },
  { name: "Cowboy Ember", token: "--cowboy-umber" },
  { name: "Oxblood", token: "--oxblood-500" },
  { name: "Nude Ember", token: "--nude-ember" },
  { name: "Bandana Red", token: "--bandana-red" },
  { name: "Lodge Yellow", token: "--lodge-yellow" },
  { name: "Oxidized Teal", token: "--oxidized-teal" },
] as const;

const tokensByName = new Map(
  [...tokenData.colors.familyAliases, ...tokenData.colors.primitives].map((color) => [color.name, color]),
);

/** oklch lightness drives readable labels; both inks are existing theme tokens. */
function ink(resolved: string | undefined) {
  return usesDarkInk(resolved) ? "var(--color-foreground)" : "var(--paper)";
}

function usesDarkInk(resolved: string | undefined) {
  const lightness = Number(/oklch\(\s*([\d.]+)%/i.exec(resolved ?? "")?.[1] ?? 100);
  return lightness >= 62;
}

/** Token data stores OKLCH only; the card also needs a hex value to copy. */
function PaletteCard({ token, resolved, name }: { token: string; resolved?: string; name: string }) {
  const value = resolved ?? token;
  return (
    <ColorSwatch
      colorName={name}
      colorToken={token}
      hexValue={oklchToHex(value)}
      oklchValue={value}
      color={`var(${token})`}
      foreground={ink(value)}
      copyIconDark={usesDarkInk(value)}
    />
  );
}

export function ColorsShowcase() {
  return (
    <section aria-labelledby="main-colors-heading" className="flex flex-col gap-4">
      <div>
        <h3 id="main-colors-heading" className="font-label text-sm uppercase tracking-wider">
          Main colors
        </h3>
        <p className="text-sm text-lake-forest-200">
          The twelve brand colors from the Figma palette. Each card is painted by its own custom property and prints
          the token, HEX and OKLCH values; its copy button copies the HEX value.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {MAIN_COLORS.map(({ name, token }) => {
          const color = tokensByName.get(token);
          return (
            <PaletteCard
              key={token}
              token={token}
              resolved={color?.resolved ?? color?.value}
              name={name}
            />
          );
        })}
      </div>
    </section>
  );
}
