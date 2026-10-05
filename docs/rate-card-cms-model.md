# Configurable Rate Card Model

The rate card renderer separates editorial artwork from live booking data.

## Ownership

### CMS-owned
- internal card name
- optional Mews Rate ID binding
- default/fallback flag
- active state
- sort order
- desktop artwork
- mobile artwork
- desktop overlay position
- mobile overlay position
- button style
- color theme
- font-pair preset
- eyebrow
- headline
- description
- optional supporting text

### Booking-engine / live data
- nightly rate
- rate cadence label
- taxes/fees label
- Book Now action
- cancellation confirmation
- availability / sellability
- Mews rate identity

## Artwork sizes

Desktop/full artwork:
- 500 × 1038
- aspect ratio is locked by the renderer

Mobile/compact artwork:
- 500 × 675
- aspect ratio is locked by the renderer

In automatic mode the component responds to its own rendered width using CSS
container queries. At 420px and below it switches to the compact composition.
A card rendered at 300px therefore becomes 300 × 405 while its live overlay
type and spacing scale proportionally.

The CTA retains a minimum 44px interactive height.

## Overlay position presets

Each CMS item configures desktop and mobile independently:

- high
- normal
- low

These are mapped to tested percentage positions by application code. Editors do
not enter arbitrary pixel or CSS coordinates.

## Button presets

- filled
- outline

The CTA font remains the booking-engine button font for consistency across all
rate cards.

## Color presets

- white
- blue
- green

The actual color values are application design tokens. CMS items store only the
preset name.

## Font-pair presets

Current renderer presets:

- brothers-bianco
- brothers-uchen
- desert-bianco

The font pair controls the live price/supporting typography. The CTA continues
to use the global button font.

## Accessibility

Artwork is decorative and renders with an empty alt attribute and
`aria-hidden="true"`.

The CMS headline and description are required machine-readable fields. They are
rendered as semantic HTML inside the rate-card article and visually hidden while
artwork is available.

If artwork is missing or fails to load, the same CMS text becomes the visible
fallback card. The transactional overlay remains live and usable.

A CMS item with a blank headline or description is considered incomplete by
the resolver and is skipped.

## Rate-card resolution

For a live Mews rate:

1. Find an active CMS card whose `mewsRateId` exactly equals Mews `Rate.Id`.
2. If none exists, use the first active default card by `sortOrder`.
3. If no valid default exists, return no CMS configuration.

Inactive and semantically incomplete CMS items are ignored.

## Webflow integration boundary

The Worker fetches the Webflow `Offers` collection and transforms its items into
`RateCardConfig[]` at `GET /api/content/rate-cards`. The browser receives only
normalized card data; `WEBFLOW_CMS_API_TOKEN` remains server-side.

Environment bindings:

- `WEBFLOW_SITE_ID`
- `WEBFLOW_RATE_CARD_COLLECTION_ID`
- `WEBFLOW_CMS_API_TOKEN` (secret)

Confirmed local collection identifiers are documented in `.dev.vars.example`.
The current collection already supplies `mews-rate-id`, `full-card`,
`compact-card`, `active`, `headline`, `description`, and related offer fields.
New presentation fields use their Webflow slugs when added; absent optional
fields fall back to the renderer's safe presets.

The renderer and resolver do not make Webflow API calls directly. This keeps the
card portable and makes the CMS provider replaceable without changing the UI.
