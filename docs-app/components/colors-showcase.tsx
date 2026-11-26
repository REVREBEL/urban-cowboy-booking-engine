"use client";

import { useState } from "react";
import { Button, type ButtonColor } from "../../src/components/ui/Button";
import tokenData from "../lib/design-tokens.generated.json";
import { TokenCopyButton } from "./token-copy-button";

/** oklch lightness drives readable labels; both inks are existing theme tokens. */
function ink(resolved: string | undefined) {
  const lightness = /oklch\(\s*([\d.]+)%/i.exec(resolved ?? "")?.[1];
  return lightness !== undefined && Number(lightness) < 62
    ? "var(--paper)"
    : "var(--color-foreground)";
}

function TokenMeta({ name, value, resolved }: { name: string; value: string; resolved?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="text-xs">{name}</code>
      <TokenCopyButton value={name} label={`token ${name}`} />
      <code className="text-xs text-lake-forest-200">{value}</code>
      <TokenCopyButton value={value} label={`declaration of ${name}`} />
      {resolved && resolved !== value ? (
        <>
          <code className="text-xs text-lake-forest-200">= {resolved}</code>
          <TokenCopyButton value={resolved} label={`rendered value of ${name}`} />
        </>
      ) : null}
    </div>
  );
}

type SwatchProps = {
  name: string;
  value: string;
  resolved?: string;
  label?: string;
};

function Swatch({ name, value, resolved, label }: SwatchProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div
        className="flex h-20 items-end rounded-field border border-paper-700 p-2"
        style={{ backgroundColor: `var(${name})`, color: ink(resolved ?? value) }}
      >
        <span className="font-label text-[11px] uppercase tracking-wider">{label ?? name.replace(/^--/, "")}</span>
      </div>
      <TokenMeta name={name} value={value} resolved={resolved} />
    </div>
  );
}

export function ColorsShowcase() {
  const { primitives, familyAliases, semantic, controlColors, pairings } = tokenData.colors;
  const [clicks, setClicks] = useState(0);

  const families = [...new Set(primitives.map((color) => color.family))].sort();
  const aliases = new Map(familyAliases.map((color) => [color.name, color]));
  const semanticByName = new Map(semantic.map((color) => [color.name, color]));

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="primitive-colors-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="primitive-colors-heading" className="font-label text-sm uppercase tracking-wider">
            Primitive palette
          </h3>
          <p className="text-sm text-lake-forest-200">
            Raw <code>oklch</code> shades from <code>colors.css</code>. Each swatch is painted by its own token and prints the declaration plus the resolved value.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          {families.map((family) => (
            <div key={family} className="flex flex-col gap-3">
              <h4 className="font-label text-xs uppercase tracking-wider">{family}</h4>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                {primitives
                  .filter((color) => color.family === family)
                  .map((color) => (
                    <Swatch key={color.name} name={color.name} value={color.value} resolved={color.resolved} label={color.shade} />
                  ))}
              </div>
              {familyAliases.some((color) => color.name.startsWith(`--${family}-`) || aliases.has(`--${family}`)) ? (
                <div className="flex flex-wrap gap-4">
                  {familyAliases
                    .filter((color) => color.name === `--${family}` || color.name.startsWith(`--${family}-`))
                    .map((color) => (
                      <div key={color.name} className="w-44 min-w-0">
                        <Swatch name={color.name} value={color.value} resolved={color.resolved} />
                      </div>
                    ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="semantic-colors-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="semantic-colors-heading" className="font-label text-sm uppercase tracking-wider">
            Semantic roles
          </h3>
          <p className="text-sm text-lake-forest-200">
            Theme aliases and foreground pairs used by the app. Text samples sit on their own background token.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {semantic
            .filter((color) => !color.name.includes("button"))
            .map((color) => {
              const foreground = semanticByName.get(`${color.name.replace(/^--color-/, "--")}-foreground`)
                ?? semanticByName.get(`${color.name}-foreground`);
              return (
                <article key={color.name} className="flex min-w-0 flex-col gap-3 rounded-card border border-paper-700 bg-paper p-4">
                  <div
                    className="min-h-16 rounded-field border border-paper-700 p-3"
                    style={{ backgroundColor: `var(${color.name})`, color: foreground ? `var(${foreground.name})` : ink(color.resolved) }}
                  >
                    <span className="font-label text-xs uppercase tracking-wider">Aa The quick brown fox</span>
                  </div>
                  <TokenMeta name={color.name} value={color.value} resolved={color.resolved} />
                  {foreground ? <TokenMeta name={foreground.name} value={foreground.value} resolved={foreground.resolved} /> : null}
                </article>
              );
            })}
        </div>
      </section>

      <section aria-labelledby="pairings-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="pairings-heading" className="font-label text-sm uppercase tracking-wider">
            Contrast pairings
          </h3>
          <p className="text-sm text-lake-forest-200">
            Background/foreground pairs already defined by the theme, including the shared control color tokens.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pairings.map((pair) => (
            <div
              key={`${pair.background}-${pair.foreground}`}
              className="flex flex-col gap-2 rounded-field border border-paper-700 p-3"
              style={{ backgroundColor: pair.value, color: pair.foregroundValue }}
            >
              <span className="text-sm">Booking made simple</span>
              <code className="text-[11px]">{pair.background} / {pair.foreground}</code>
              <div className="flex flex-wrap gap-2">
                <TokenCopyButton value={pair.value} label={`background ${pair.background}`} />
                <TokenCopyButton value={pair.foregroundValue} label={`foreground ${pair.foreground}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="control-colors-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="control-colors-heading" className="font-label text-sm uppercase tracking-wider">
            Control colors and interactive states
          </h3>
          <p className="text-sm text-lake-forest-200">
            Each <code>control-color-*</code> utility sets the shared <code>--bg</code>, <code>--fg</code> and border tokens used by filled and outline controls.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {controlColors.map((control) => (
            <Button key={control.name} colorScheme={control.name.replace("control-color-", "") as ButtonColor}>
              {control.name.replace("control-color-", "")}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button colorScheme="lake-forest" variant="filled">Filled</Button>
          <Button colorScheme="lake-forest" variant="outline">Outline</Button>
          <Button colorScheme="lake-forest" variant="transparent">Transparent</Button>
          <Button colorScheme="lake-forest" disabled>Disabled</Button>
          <Button colorScheme="lake-forest" isLoading>Loading</Button>
          <Button colorScheme="copper" onClick={() => setClicks((count) => count + 1)}>Clicked {clicks}×</Button>
        </div>
        <p className="text-xs text-lake-forest-200">
          Hover, focus and active colors come from the same utilities; they are live styles, not static swatches.
        </p>
      </section>
    </div>
  );
}
