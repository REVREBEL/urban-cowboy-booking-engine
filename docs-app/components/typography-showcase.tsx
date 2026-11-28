"use client";

import type { CSSProperties } from "react";
import tokenData from "../lib/design-tokens.generated.json";
import hiddenFontFamilies from "../lib/hidden-font-families.json";
import { TokenCopyButton } from "./token-copy-button";

const SPECIMEN = "Aa Bb Cc 0123456789";
const SENTENCE = "A quick brown fox jumps over the lazy dog.";

// Rate-card-only faces stay declared in the booking engine; this page documents
// the component library's type system, so their specimens are omitted here.
const HIDDEN_FONT_FAMILIES = new Set(hiddenFontFamilies);

function TokenMeta({ token, value }: { token: string; value?: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="text-xs">{token}</code>
      <TokenCopyButton value={token} label={`token ${token}`} />
      {value && value !== token ? (
        <>
          <code className="text-xs text-lake-forest-200">{value}</code>
          <TokenCopyButton value={value} label={`value of ${token}`} />
        </>
      ) : null}
    </div>
  );
}

function roleValue(role: string) {
  return tokenData.typography.familyTokens.find((token) => token.role === role)?.cssValue;
}

export function TypographyShowcase() {
  const { families, familyTokens, sizes, tracking, textCases } = tokenData.typography;
  const shownFamilies = families.filter((group) => !HIDDEN_FONT_FAMILIES.has(group.family));
  const shownRoles = familyTokens.filter((token) => !HIDDEN_FONT_FAMILIES.has(token.primaryFamily));

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="font-families-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="font-families-heading" className="font-label text-sm uppercase tracking-wider">
            Font families
          </h3>
          <p className="text-sm text-lake-forest-200">
            The component library's <code>@font-face</code> families, rendered from their real assets.
            Rate-card-only faces stay declared in the booking engine but are omitted here. A family with a
            design token is labelled with that token; copy either the token or the asset path.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {shownFamilies.map((group) => {
            const faceLabel = group.faces
              .map((face) => `${face.weight}${face.style === "italic" ? " italic" : ""}`)
              .join(" · ");
            return (
              <article key={group.family} className="rounded-card border border-paper-700 bg-paper p-4">
                <p className="font-label text-xs uppercase tracking-wider">{group.family}</p>
                <p
                  className="my-3 break-words text-2xl leading-tight"
                  style={{ fontFamily: `"${group.family}"` }}
                >
                  {SPECIMEN}
                </p>
                <p className="text-xs text-lake-forest-200">{faceLabel}</p>
                <div className="mt-3">
                  {group.tokens.length ? (
                    group.tokens.map((token) => <TokenMeta key={token} token={token} />)
                  ) : (
                    <p className="text-xs text-lake-forest-200">No font-role token uses this family.</p>
                  )}
                </div>
                <ul className="mt-3 flex flex-col gap-2">
                  {group.faces.map((face) => (
                    <li key={`${face.family}-${face.weight}-${face.style}-${face.src}`} className="flex flex-wrap items-center gap-2 text-xs">
                      <code>{face.weight} {face.style}</code>
                      <code className="break-all text-lake-forest-200">{face.src}</code>
                      <TokenCopyButton value={face.src} label={`${face.family} asset ${face.weight}`} />
                      {!face.assetExists ? <span className="text-bandana-red">asset missing</span> : null}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="font-roles-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="font-roles-heading" className="font-label text-sm uppercase tracking-wider">
            Font roles
          </h3>
          <p className="text-sm text-lake-forest-200">
            The component library's <code>--font-*</code> tokens. Specimens use the token itself, so a theme change is reflected here.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-paper-700">
                <th scope="col" className="py-2 pr-4 font-label text-xs uppercase tracking-wider">Role</th>
                <th scope="col" className="py-2 pr-4 font-label text-xs uppercase tracking-wider">Token</th>
                <th scope="col" className="py-2 font-label text-xs uppercase tracking-wider">Specimen</th>
              </tr>
            </thead>
            <tbody>
              {shownRoles.map((token) => (
                <tr key={token.name} className="border-b border-paper-300 align-middle">
                  <td className="py-3 pr-4 font-label text-xs uppercase tracking-wider">{token.role}</td>
                  <td className="py-3 pr-4">
                    <TokenMeta token={token.name} value={token.value} />
                  </td>
                  <td className="py-3 text-lg" style={{ fontFamily: token.cssValue }}>
                    {SENTENCE}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="type-scale-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="type-scale-heading" className="font-label text-sm uppercase tracking-wider">
            Type scale and tracking
          </h3>
          <p className="text-sm text-lake-forest-200">
            Fluid <code>--text-size-*</code> values and their Tailwind aliases, with the single configured tracking token.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {sizes.map((size) => (
            <div key={size.name} className="flex flex-wrap items-baseline justify-between gap-3 border-b border-paper-300 pb-3">
              <span className="break-words" style={{ fontSize: size.cssValue, fontFamily: roleValue("body") }}>
                {SENTENCE}
              </span>
              <div className="flex flex-col gap-1">
                <TokenMeta token={size.name} value={size.value} />
                {size.alias ? <TokenMeta token={size.alias} value={size.value} /> : null}
              </div>
            </div>
          ))}
          {tracking.map((item) => (
            <div key={item.name} className="flex flex-wrap items-baseline justify-between gap-3">
              <span className="text-base" style={{ letterSpacing: item.cssValue, fontFamily: roleValue("label") }}>
                {SENTENCE}
              </span>
              <TokenMeta token={item.name} value={item.value} />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="text-case-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="text-case-heading" className="font-label text-sm uppercase tracking-wider">
            Case treatments
          </h3>
          <p className="text-sm text-lake-forest-200">
            Shared text-case utilities applied with the label font. The values below come from the utility declarations.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {textCases.map((item) => (
            <div key={item.name} className="rounded-field border border-paper-700 bg-paper p-3">
              <p className="text-base" style={{ textTransform: item.value as CSSProperties["textTransform"], fontFamily: roleValue("label") }}>
                find your next stay
              </p>
              <div className="mt-2">
                <TokenMeta token={item.name} value={item.value} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="typography-usage-heading" className="flex flex-col gap-4">
        <h3 id="typography-usage-heading" className="font-label text-sm uppercase tracking-wider">
          Intended usage
        </h3>
        <div className="flex flex-col gap-3 rounded-card border border-paper-700 bg-paper p-4">
          <p className="text-xs uppercase tracking-wider text-lake-forest-200">Heading · --font-heading</p>
          <p className="text-xl" style={{ fontFamily: roleValue("heading") }}>
            Stay a while in the Catskills
          </p>
          <p className="text-xs uppercase tracking-wider text-lake-forest-200">Body · --font-body</p>
          <p className="text-base" style={{ fontFamily: roleValue("body") }}>
            {SENTENCE}
          </p>
          <p className="text-xs uppercase tracking-wider text-lake-forest-200">Label · --font-label</p>
          <p className="text-sm" style={{ fontFamily: roleValue("label"), textTransform: "uppercase" }}>
            Book your stay
          </p>
        </div>
      </section>
    </div>
  );
}
