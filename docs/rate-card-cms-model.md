# Configurable Rate Card Model

The rate card renderer separates editorial artwork from live booking data.

## Ownership

### Webflow CMS owns

- internal card name
- optional Mews Rate ID binding
- active state
- member-only flag
- desktop/full artwork
- mobile/compact artwork
- button fill style
- button color
- overlay text color
- rate font pair
- eyebrow
- headline
- short description
- call to action
- optional cancellation penalty window/display fallback
- default/fallback flag
- sort order
- desktop overlay position
- mobile overlay position

### Booking engine / Mews owns

- Mews Rate.Id
- availability / sellability
- price amounts
- currency
- tax amounts
- booking action
- structured rate/policy data when exposed by the Mews integration

Webflow must not become the source of truth for live availability or price.

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

## Current Webflow Offers fields

The production Offers collection currently exposes these rate-card fields:

| Webflow slug | RateCardConfig |
| --- | --- |
| `mews-rate-id` | `mewsRateId` |
| `active` | `active` |
| `member-only` | `memberOnly` |
| `default-card` | `isDefault` |
| `sort-order` | `sortOrder` |
| `desktop-overlay-position` | `desktopOverlayPosition` |
| `mobile-overlay-position` | `mobileOverlayPosition` |
| `full-card` | `desktopArtworkUrl` |
| `compact-card` | `mobileArtworkUrl` |
| `card-fill` | `buttonStyle` |
| `button-color` | `buttonColor` |
| `text-color` | `textColor` |
| `rate-font` | `fontPair` |
| `call-to-action` | `ctaLabel` |
| `cancellation-penalty-window` | `cancellationPenaltyWindow` |
| `cancellation-penalty-window-period` | `cancellationPenaltyWindowPeriod` |
| `eyebrow` | `eyebrow` |
| `headline` | `headline` |
| `description` | `description` |

These fields now exist in the production Offers collection. Existing items use
the renderer's safe defaults until an editor chooses explicit values.

## Button style

Current Webflow `card-fill` values:

- filled
- outline

Button color and text color are independent CMS choices.

## Cowboy color presets

The rate-card adapter maps Webflow option labels to the existing Cowboy palette:

- Paper
- Ash
- Alpine Linen
- Nude Ember
- Lodge Yellow
- Oxidized Teal
- Lake Forest
- Oxblood
- Whiskey Sour
- Bandana Red
- Copper
- Cowboy Umber
- Smoke

No arbitrary CSS color is returned by Webflow. The option label is normalized to
a typed preset and the renderer supplies the known design-system value.

## Font-pair presets

The current Webflow `rate-font` options map to:

- Quattrocento & Bianco Sans
- Rundeck & Noto Serif Tibetan
- League Spartan & Arvo
- League Gothic & DM Sans
- Noto Serif Tibetan & Lato
- Motter Corpus Std & Coustard
- Filicudi & Special Elite

The repository currently contains the required local font assets except for a
Special Elite font file. Until that asset is supplied, the Filicudi / Special
Elite preset uses Filicudi for the primary live price and a monospace fallback
for the secondary line.

The rate-card font pairs are scoped to the rate-card renderer and do not change
the booking engine's global typography tokens.

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

## Published-content boundary

The Worker reads:

```text
GET /api/content/rate-cards
        ↓
Webflow /v2/collections/{collectionId}/items/live
```

Only the published/live Webflow version is consumed by the booking engine.
Staged CMS edits do not affect guests until they are published.

The browser receives only normalized `RateCardConfig[]`. The
`WEBFLOW_CMS_API_TOKEN` remains server-side.

Environment bindings:

- `WEBFLOW_SITE_ID`
- `WEBFLOW_RATE_CARD_COLLECTION_ID`
- `WEBFLOW_CMS_API_TOKEN` (secret)

The Worker applies an 8-second Webflow timeout and logs a sanitized warning if
the upstream CMS fetch fails. Guest-facing behavior still fails safely to an
empty CMS result and application fallback.

## Rate-card resolution

For a live Mews rate:

1. Find an active CMS card whose `mewsRateId` exactly equals Mews `Rate.Id`.
2. If none exists, use the first active card marked `isDefault`, ordered by
   `sortOrder`.
3. If no valid CMS card resolves, the application generates an accessible
   semantic rate card from the live Mews rate instead of falling back to a
   legacy promotional component.

Inactive, archived, and semantically incomplete CMS items are ignored.

A blank `mews-rate-id` is **not** automatically treated as a default. This
prevents an unrelated promotion from becoming the artwork for every unknown
Mews rate.

## Live price disclosure

The live overlay uses:

1. `perNightNet` / `totalNet` when available and labels the amount
   **Excluding Taxes + Fees**.
2. If no usable net amount exists, it falls back to gross pricing and changes
   the disclosure to **Including Taxes + Fees**.

This prevents a gross amount from being labeled as tax-exclusive.

## Cancellation confirmation

The renderer no longer uses a Mews marketing description as cancellation text.

Current precedence:

1. Known Mews `NON_REFUNDABLE` rate group →
   **Full Prepay · Non-Refundable**
2. CMS cancellation penalty window + period →
   calculate the cutoff from the selected check-in date
3. No structured policy data →
   **See rate details for cancellation terms**

The CMS cancellation window is a presentation fallback until the Mews
integration exposes a structured cancellation-policy object. When that becomes
available, Mews should take precedence and the CMS fallback can remain only for
legacy or promotional cases.

## Webflow integration boundary

The Webflow adapter transforms collection items into `RateCardConfig[]`.

The renderer and resolver do not make Webflow API calls directly. This keeps
the card portable and makes the CMS provider replaceable without changing the
UI.
