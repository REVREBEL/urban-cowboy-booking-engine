<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Fumadocs theme tokens are not interchangeable with the raw design tokens

The docs app is a separate Fumadocs theme layer, so controls rendered by `@fumadocs/story` and `fumadocs-ui` are styled with the `--color-fd-*` tokens defined in `docs-app/app/globals.css`, not the raw `--primary` / `--primary-foreground` tokens from `src/styles/index.css`. These are inverted relative to the raw pair: `--color-fd-primary` is `--lake-forest` (raw `--primary-foreground`) and `--color-fd-primary-foreground` is `--paper` (raw `--primary`). Style docs-layer controls with the `fd-` pair — e.g. an active select option uses `--color-fd-primary` as its background and `--color-fd-primary-foreground` as its text. Use raw tokens only for components from the main project's design system.

## Optional story props render an "Unset" choice

`@fumadocs/story` marks a prop optional when the demo wrapper's prop has a `?`. For enum/string props this adds an "Unset" option and displays "Unset" until a value is provided, even when the wrapper supplies a default in its function signature. To keep controls limited to real values, make demo wrapper props required and set them in `defineStory({ args: { initial: ... } })`.

## The interactive Props panel replaces static prop tables

Component docs must not contain a `| Prop | Values | Notes |` table. The story's Props panel already exposes the wrapper's selectable props (including the variant controls) and is the single source of truth; a static table beside it duplicates that list and drifts out of sync. Keep other reference tables such as data shapes and visual variants — omit only the prop table and its now-empty `## Props` heading.

## Story demos render on light surfaces

Docs story demos must not use `bg-smoke` (or another dark token) as a wrapper canvas, and demo labels must not use `text-paper`. Use the page surface or `bg-paper`, and use foreground/muted text tokens. If a demo previously relied on a dark canvas for light-colored controls, change the control's `colorScheme` to a dark token rather than restoring the canvas. The signboard's `text-paper` is the one exception: it is printed over a dark wooden image. Dark backgrounds painted by the real product components (photo journey steps, the Search button, the RoomPhotoTour footer) are part of the product design and are out of scope; the RoomPhotoTour footer sets its own `--color-paper` text because it always sits on smoke.

The `light` and `paper` schemes use paper as the text colour of outline and transparent controls, which is invisible on a light row. Wrap only those sample controls in `<PaletteSpecimen>` from `components/palette-specimen.tsx`; it renders a bounded `.docs-contrast-specimen` swatch without changing the control itself or the page surface.

## The Colors page shows only the Figma main colors

`colors-showcase.tsx` renders the twelve main-color swatches from the Figma palette in a two-column grid; primitive shades, semantic roles, pairings and control states are out of scope for that page. Read each card's HEX/OKLCH from the live generated token data, not from Figma's placeholder labels. The `--oxblood` family alias resolves to `--cowboy-umber-500` in the booking-engine theme, so the Figma burgundy Oxblood card must paint `var(--oxblood-500)` instead of the alias. Similarly the Figma "Cowboy Ember" card paints `--cowboy-umber` and "Oxidized Teal" paints `--oxidized-teal`; the Figma token text on the teal card is a copy/paste error.

