"use client";

import type { CSSProperties } from "react";
import tokenData from "../lib/design-tokens.generated.json";
import { TokenCopyButton } from "./token-copy-button";

type Token = { name: string; value: string; cssValue: string };

function TokenMeta({ token }: { token: Token }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="text-xs">{token.name}</code>
      <TokenCopyButton value={token.name} label={`token ${token.name}`} />
      <code className="text-xs text-lake-forest-200">{token.value}</code>
      <TokenCopyButton value={token.value} label={`value of ${token.name}`} />
    </div>
  );
}

export function GeneralTokensShowcase() {
  const { radii, buttonRadii, shadows, buttonBorderWidths, controlSizes, utilityBorderWidths } = tokenData.general;
  const { gaps } = tokenData;

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="radii-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="radii-heading" className="font-label text-sm uppercase tracking-wider">
            Radii
          </h3>
          <p className="text-sm text-lake-forest-200">
            Theme corner radii and the dedicated control radii. Samples use the token as the CSS value.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...radii, ...buttonRadii].map((token) => (
            <div key={token.name} className="flex min-w-0 flex-col gap-3 rounded-field border border-paper-700 bg-paper p-3">
              <div
                aria-hidden="true"
                className="h-16 w-full border-2 border-lake-forest bg-alpine-linen-100"
                style={{ borderRadius: token.cssValue }}
              />
              <TokenMeta token={token} />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="shadows-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="shadows-heading" className="font-label text-sm uppercase tracking-wider">
            Shadows
          </h3>
          <p className="text-sm text-lake-forest-200">
            Declared shadow values are shown exactly as written, including the intentionally zero-valued shadows.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shadows.map((token) => (
            <div key={token.name} className="flex min-w-0 flex-col gap-3 rounded-card border border-paper-700 bg-paper p-4">
              <div
                aria-hidden="true"
                className="h-12 rounded-field bg-paper"
                style={{ boxShadow: token.cssValue }}
              />
              <TokenMeta token={token} />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="border-widths-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="border-widths-heading" className="font-label text-sm uppercase tracking-wider">
            Border widths
          </h3>
          <p className="text-sm text-lake-forest-200">
            The named button border token plus literal widths used by the shared control utilities. Undefined references are listed as gaps below.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {buttonBorderWidths.map((token) => (
            <div key={token.name} className="flex flex-wrap items-center justify-between gap-3 border-b border-paper-300 pb-3">
              <div aria-hidden="true" className="h-8 w-24 bg-alpine-linen-100" style={{ border: `${token.resolved} solid var(--copper)` }} />
              <TokenMeta token={token} />
            </div>
          ))}
          {utilityBorderWidths.map((token) => (
            <div key={token.value} className="flex flex-wrap items-center justify-between gap-3 border-b border-paper-300 pb-3">
              <div aria-hidden="true" className="h-8 w-24 bg-alpine-linen-100" style={{ border: `${token.value} solid var(--copper)` }} />
              <div className="flex flex-col gap-1">
                <code className="text-xs">{token.value}</code>
                <p className="text-xs text-lake-forest-200">{token.utilities.join(", ")}</p>
                <TokenCopyButton value={token.value} label={`border width ${token.value}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="control-sizing-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="control-sizing-heading" className="font-label text-sm uppercase tracking-wider">
            Control sizing
          </h3>
          <p className="text-sm text-lake-forest-200">
            Size declarations from the shared <code>btn-*</code> utilities. This is the sizing scale the booking controls actually use.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-paper-700">
                <th scope="col" className="py-2 pr-4 font-label text-xs uppercase tracking-wider">Utility</th>
                <th scope="col" className="py-2 pr-4 font-label text-xs uppercase tracking-wider">Sample</th>
                <th scope="col" className="py-2 pr-4 font-label text-xs uppercase tracking-wider">Declarations</th>
              </tr>
            </thead>
            <tbody>
              {controlSizes.map((size) => (
                <tr key={size.name} className="border-b border-paper-300 align-middle">
                  <td className="py-3 pr-4"><code>{size.name}</code></td>
                  <td className="py-3 pr-4">
                    <span
                      className="inline-block border-solid border-copper bg-paper text-lake-forest"
                      style={{
                        fontFamily: "var(--font-button)",
                        fontSize: size.fontSize || undefined,
                        lineHeight: size.lineHeight || undefined,
                        letterSpacing: size.letterSpacing || undefined,
                        paddingTop: size.paddingTop || undefined,
                        paddingBottom: size.paddingBottom || undefined,
                        paddingInline: size.paddingInline || undefined,
                        borderRadius: size.borderRadius || undefined,
                        borderWidth: size.borderWidth || undefined,
                      } as CSSProperties}
                    >
                      Book Your Stay
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <code className="text-xs text-lake-forest-200">
                      {[
                        `font-size: ${size.fontSize}`,
                        `line-height: ${size.lineHeight}`,
                        `letter-spacing: ${size.letterSpacing}`,
                        `padding: ${size.paddingTop} ${size.paddingInline} ${size.paddingBottom}`,
                        `radius: ${size.borderRadius}`,
                        `border: ${size.borderWidth}`,
                      ].join(" · ")}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="gaps-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="gaps-heading" className="font-label text-sm uppercase tracking-wider">
            Gaps in the current theme
          </h3>
          <p className="text-sm text-lake-forest-200">
            These names are referenced or expected but have no definition in <code>src/styles</code>. They are recorded, not given invented values.
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {gaps.map((gap) => (
            <li key={`${gap.kind}-${gap.token ?? gap.family}`} className="rounded-field border border-paper-700 bg-paper p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <code>{gap.token ?? `${gap.family} (${gap.pattern})`}</code>
                <span className="text-xs text-lake-forest-200">{gap.kind}</span>
                <span className="text-xs text-lake-forest-200">{gap.references} reference(s)</span>
              </div>
              <p className="mt-2 text-xs text-lake-forest-200">{gap.note}</p>
              {gap.sources?.length ? <p className="mt-1 text-xs text-lake-forest-200">{gap.sources.join(", ")}</p> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
