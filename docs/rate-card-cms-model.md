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
- cancellation free-cancellation threshold
- cancellation full-forfeit threshold
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
A card rendered at 300px therefore becomes 300 × 405. The overlay swaps to
the compact typography treatment at the same breakpoint.

Rate typography:
- full card: 34px amount / 20px cadence
- compact card: 24px amount / 14px cadence

The live overlay uses 30px horizontal padding at the 500px source-card width.
The existing container-width padding rule reduces that spacing on narrower
rendered cards.

The CTA is deliberately more substantial than the global default button on these oversized artwork cards: 58px high on the full composition and 54px on the compact composition, with a wider minimum footprint. This compensates for the carousel's visual scaling so the action still reads as a primary booking control.

Full and compact artwork now use separate vertical placement scales. The 500×1038 full card keeps the price lower in the composition, while the 500×675 compact card moves the live rate upward so it does not drift into the action area.

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
| `call-to-action` | `ctaLabel` (max 24 characters in the renderer; blank/overlong values fall back to **Book Now**) |
| `cancellation-penalty-window` | `cancellationPenaltyWindow` |
| `cancellation-penalty-window-period` | `cancellationPenaltyWindowPeriod` |
| `cancellation-full-forfeit-window` | `cancellationFullForfeitWindow` |
| `cancellation-full-forfeit-window-period` | `cancellationFullForfeitWindowPeriod` |
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

## Booking interaction

The CMS artwork card never confirms a reservation on the first click.

1. **Book Now** opens the rate-detail flyout horizontally to the right.
2. The flyout shows the short current cancellation state, live rate totals,
   deposit/remaining amounts, and the full Mews rate-description/policy text.
3. **Confirm Booking** proceeds with the selected Mews rate.

Both artwork variants use the same interaction:
- full 500 × 1038 card → horizontal full-detail panel
- compact 500 × 675 card → horizontal compact-detail panel

The dynamic price, tax disclosure, CTA, short cancellation state, and full
policy text must not be baked into the uploaded artwork. Those values are
rendered by the booking engine.

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
   **Full Prepay Non Refundable**
2. Before the CMS free-cancellation cutoff →
   **Free Cancellation until MMM dd, yyyy**
3. From the free-cancellation cutoff until the CMS full-forfeit cutoff →
   **Partially Refundable until MMM dd, yyyy**
4. At or inside the full-forfeit cutoff →
   **Full Prepay Non Refundable**
5. No structured policy data →
   **See rate details for cancellation terms**

For the Best Flexible / Ride Easy example, Webflow is configured as:
- free-cancellation threshold: 14 days before arrival
- full-forfeit threshold: 5 days before arrival

The comparison uses the current Catskills calendar date
(`America/New_York`) against the selected arrival date. It does not parse
marketing prose to infer policy rules.

The CMS thresholds are a presentation fallback until the Mews integration
exposes structured cancellation-policy tiers. Mews remains authoritative when
such structured policy data becomes available.

## Webflow integration boundary

The Webflow adapter transforms collection items into `RateCardConfig[]`.

The renderer and resolver do not make Webflow API calls directly. This keeps
the card portable and makes the CMS provider replaceable without changing the
UI.
