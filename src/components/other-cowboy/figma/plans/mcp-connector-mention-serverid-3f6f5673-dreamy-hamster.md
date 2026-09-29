# Urban Cowboy Booking Engine — Revised Plan (Authoritative)

## Context

React + Vite + Tailwind CSS v4 prototype (`src/App.tsx` currently empty). The goal is a multi-step booking flow for Urban Cowboy that mirrors the architecture of the production repo `REVREBEL/urban-cowboy-booking-engine` closely enough that it can later be connected without rewriting the UX. The prototype uses mocked data but shaped to match the production contract.

---

## Booking Flow

```
1 STAY       → Availability Criteria (dates, guests, promo)
2 ROOM       → Find Your Stay
               ├─ Help Me Choose → questionnaire → Recommendation Results
               └─ View All Rooms → room grid
             → Room Detail
             → Select Your Experience (Rate Selection)   ← still within Step 2 ROOM
3 DETAILS    → guest info (placeholder)
4 EXTRAS     → (placeholder)
5 PAY        → (placeholder)
```

Progress bar steps: **1 Stay / 2 Room / 3 Details / 4 Extras / 5 Pay** — unchanged across all sub-views of Step 2.

---

## State Architecture

### BookingState (persistent, reducer-managed)

```ts
type BookingState = {
  property?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants?: number;
  promoCode?: string;
  recommendationPreferences?: {
    party: 'partner' | 'friends' | 'family' | 'solo';
    dog: boolean;
    interests: [MatchInterest, MatchInterest?];
  };
  selectedRoomId?: string;
  selectedRoom?: RoomProduct;
  selectedRateId?: string;
  selectedRate?: RateOffer;
};
```

### BookingView (separate UI routing state)

```ts
type BookingView =
  | 'availability'
  | 'find-your-stay'
  | 'help-me-choose'
  | 'match-results'
  | 'all-rooms'
  | 'room-detail'
  | 'rate-selection'
  | 'details'
  | 'extras'
  | 'pay';
```

Use a `useReducer` + Context pattern. Going backward must preserve all booking state.

---

## Component Architecture

```
src/
  App.tsx                         ← BookingContext provider + view router
  booking/
    types.ts                      ← BookingState, BookingView, RoomProduct, RateOffer,
                                     RoomMatchContent, RecommendationResult, TopMatchCopy,
                                     MatchInterest, Season
    bookingReducer.ts             ← reducer + actions
    mockData.ts                   ← mocked room catalogue + rates shaped to production contract
    recommendationAdapter.ts      ← rank(availability, booking, preferences) → RecommendationResult[]
    mewsAdapter.ts                ← mocked Mews availability response shim
  components/
    BookingChrome.tsx             ← header + step progress bar
    Footer.tsx
    AvailabilityCriteria.tsx      ← Step 1
    FindYourStay/
      FindYourStay.tsx            ← Step 2 shell: Help Me Choose / View All CTAs
      HelpMeChoose.tsx            ← 3-question form (party, dog, up to 2 interests)
      MatchResults.tsx            ← ranked recommendations UI
      AllRoomsGrid.tsx            ← available room grid with section headers
      RoomCard.tsx                ← shared card used by both grid + results
      TopMatchPanel.tsx           ← explanation panel (mirrors production TopMatchPanel.tsx contract)
    RoomDetail/
      RoomDetail.tsx
      RoomFeatures.tsx
      BookingSummary.tsx          ← sticky CTA panel (sidebar on desktop, bottom bar on mobile)
    RateSelection/
      RateSelection.tsx           ← accepts RateOffer[]
      RateCard.tsx                ← semantic HTML poster card
      RateDetails.tsx             ← disclosure drawer for policy details
    states/
      LoadingState.tsx
      EmptyState.tsx
      ErrorState.tsx
```

---

## Fonts

Run `figma fonts resolve` for: Brothers OT (Regular, Bold), Uchen (Regular, Bold), DesertRain (Bold, SemiBold), Bianco Sans (Bold, Regular), Inter (Regular). Add Oswald via Google Fonts CSS2 `@import`. Declare all resolved `@font-face` rules in `src/index.css`.

## Assets

Download node `1:1698` asset archive → `public/assets/`. Set `const assetPathPrefix = "/assets"`.

## Design Tokens (src/index.css @theme block)

- `--color-parchment: #E8E3D7`
- `--color-brown: #3D1E0F`
- `--color-terracotta: #8B3A2E`
- `--color-ash: #CCC7BB`
- `--color-firefly: #0C1E30`
- Font aliases for each resolved face

---

## Key Implementation Rules (from revision)

### Recommendation system
- Do NOT build a Persona × Style lookup table
- `recommendationAdapter.ts` mocks the production contract: `rank({ availability, booking, preferences }) → RecommendationResult[]`
- Apply: availability filter → hard eligibility → preference scoring → ranking → return top 3
- Scoring: Interest × 10 + Party × 2; dual-interest intersection bonus (+50 / +20) per `docs/match_logic.md`
- Hard rules: dog=true → filter to dog-eligible only; children present → remove 21+ rooms; party type never overrides occupancy

### Help Me Choose questions (3 steps)
1. **Who's Coming Along?** — Partner / Friends / Family / Solo (soft ranking, radio)
2. **Bringing a Dog?** — Yes / No (hard eligibility filter)
3. **What Matters Most?** — up to 2 of: Icon Tub / Outdoor Soak / My Own Place / Scenic Views / Simple + Cozy (checkbox, interest 1 required)

### Recommendation output shape
```ts
type RecommendationResult = {
  room: RoomProduct;
  score?: number;
  matchedInterests: MatchInterest[];
  explanation?: TopMatchCopy;
};
```
Display: result[0] → TOP MATCH, result[1–2] → Alternates. Show only what's returned — no empty card slots.

### TopMatchPanel contract (mirrors production `src/components/TopMatchPanel.tsx`)
```ts
type TopMatchCopy = {
  match_badge: string; room_type: string;
  party_summary: string; interest_summary: string;
  top_match_reason: string;
  benefit_1: string; benefit_2: string; benefit_3: string;
  season_label: Season; alternate_match_heading: string;
};
```

### Room terminology
- **Room Experience** — guest-facing family (Alpine, Walden, Lodge, Forest House, Cabin, Chalet, etc.)
- **Room Product** — bookable unit (Alpine Bathing Suite, Alpine Bathing Suite with Den, etc.)
- **Rate Offer** — flexible, breakfast, advance purchase, extended stay, member

### Room count copy
Derive from available data: `"{n} ROOM EXPERIENCES AVAILABLE"` or `"{n} WAYS TO STAY"` — never hardcode "8".

### Room Detail — booking summary panel
- If dates already in BookingState: show "June 2–3 · 2 Adults · **CHANGE**" + **SEE RATES** CTA
- If no dates: show full date-picker version
- Desktop: sticky right sidebar. Mobile: sticky bottom bar.

### Rate Selection
- Accepts `RateOffer[]` — render only available rates, never hardcode 5
- Each `RateCard` is semantic HTML (eyebrow / headline / description / dates / guests / nightly price / stay total / taxes note / CTA / cancellation note) with decorative SVG artwork layered via CSS
- Policy details in a `RateDetails` disclosure drawer, not inline on card

### All Rooms
- Available rooms only (post-availability filter)
- Section headings per Room Experience (ALPINE / WALDEN / LODGE / etc.)
- Back from Room Detail restores filter + scroll position

### Loading / empty / error states (all views must handle)
- Availability: loading / results / no availability / API failure + retry
- Recommendations: calculating / 1–3 results / no eligible results
- Room Detail: room became unavailable / rates refreshed
- Rates: loading / no eligible rates / promo invalid / member rate locked / price changed / rate unavailable

### Back/forward state preservation
- All questionnaire answers retained when going backward
- Search criteria retained throughout
- Architecture must not prevent eventual URL/history sync

### Accessibility
- Radio semantics for single-choice questions, checkbox for multi-select
- `focus-visible`, keyboard operation, `aria-expanded`, alt text
- Decorative SVGs `aria-hidden="true"`
- `prefers-reduced-motion` respected

### Responsive
- Mobile (~375px): single-column cards, horizontal snap-scroll rate rail (show next card edge), sticky bottom CTA on room detail
- Tablet: 2-col room grid
- Desktop: 3-col grid, sticky sidebar on room detail, horizontal rate card rail with prev/next controls

---

## Figma screens (visual source — do not redesign)

| Node | Screen |
|---|---|
| `1:1390` | Availability Criteria (Step 1) |
| `1:1455` | Find Your Stay / Help Me Choose |
| `1:1470` | Show All Rooms (grid) |
| `1:1517` | Show All Rooms (editorial section headers) |
| `1:1696` | Room Detail |
| `1:1683` | Rate Selection / Select Your Experience |
| `1:1698` | Icon Assets (SVGs) |

Screens needing UX completion: **Help Me Choose / Results** and **Show All Rooms**.

---

## Production repo reference files (read during implementation)

- `REVREBEL/urban-cowboy-booking-engine` `main` branch
- `docs/match_logic.md` — scoring rules
- `src/lib/topMatch.ts` — TopMatchCopy generation contract
- `src/components/TopMatchPanel.tsx` — panel component contract
- `src/types/mews.ts` — Mews type shapes
- `src/state/booking.tsx` — existing state pattern
- `src/lib/shaping.ts` — data shaping utilities
- `src/steps/Results.tsx` — current Results screen (note: temporary `rooms[0]` shortcut — design toward ranked output, not this)

---

## HelpMeChoose Visual Redesign (Immediate Task)

**File to rewrite:** `src/components/FindYourStay/HelpMeChoose.tsx`

Assets already copied to `public/assets/`:
- Dog: `3521b.svg` (on), `4e9fd.svg` (off)
- Interest illustrations (unselected): `c5193.png` (Copper Tub), `c9a68.png` (My Own Place), `33141.png` (Scenic Views), `0b3b2.png` (Soak Outside), `67756.png` (Simple+Cozy), `27393.png` (Spaces to Gather)
- Interest illustrations (selected): `762ae.png`, `fddb4.png`, `9275e.png`, `fa948.png`, `39f19.png`, `5a262.png`
- Ribbon labels (unselected): `68438.svg`, `f1681.svg`, `2cb72.svg`, `03952.svg`, `9b9ea.svg`, `43578.svg`
- Ribbon labels (selected): `12bf1.svg`, `28fa4.svg`, `95b21.svg`, `03952.svg` (Soak same), `9e775.svg`, `5195c.svg`

### Step 1 — Party (ButtonTravelParty)
- 2×2 grid of cards, each ~`w-[248px] h-[100px] rounded-[20px]`
- Selected: `background: rgba(255,255,255,0.70)`, `border: 2px solid #4e332d`
- Unselected: `background: rgba(255,255,255,0.25)`, `border: 2px solid #a79996`
- Inside: Brothers OT uppercase label (e.g. "PARTNER") + Uchen italic subtext (e.g. "Just the two of us")
- Options: `partner` / `friends` / `family` / `solo`
- Page bg: `bg-[#4e332d]` (dark brown so translucent whites read)

### Step 2 — Dog toggle (IconToggleButton medallion)
- Two large medallion images side-by-side: `3521b.svg` (Yes) and `4e9fd.svg` (No)
- Selected medallion: full opacity, `border: 3px solid #4e332d`, no filter
- Unselected medallion: `opacity-40`, `border: 2px solid #a79996`
- Size ~160×160 each

### Step 3 — Interests (IconButton sketch cards)
- Wrap in `flex flex-wrap gap-3 justify-center`
- Each card ~200×200px, outer wrapper `border: 1.5px solid #715c57` (unselected) or `border: 2px solid #4e332d` (selected)
- Inner: unselected `bg-[rgba(255,255,255,0.25)]`, selected `bg-[rgba(255,255,255,0.70)]`
- Illustration img top (96px tall, `opacity-50` unselected, full opacity selected)
- Ribbon label img bottom (~45px tall) from asset above
- Multi-select up to 2; toggling a third deselects the oldest
- Interests to show: all 6 (Iconic Copper Tub, My Own Place, Scenic Views, Soak Outside, Simple+Cozy, Spaces to Gather)

### Progress dots & navigation
- Three dots at top (●●○ etc.), Brothers OT step label
- "Continue" → disabled until valid selection; on final step submits preferences and navigates to `match-results`
- "Back" link always visible

---

## AllRoomsGrid Redesign Status

`src/components/FindYourStay/AllRoomsGrid.tsx` has been fully rewritten with:
- `FilterBar` component: sort (price/size asc/desc), beds (one/two), feature pills with SVG icons from `/assets/simple-icons/`
- 5 card variants: `HeroCard`, `DarkCard`, `CenteredCard`, `HorizontalCard`, `ForestCard`
- Building headers with editorial copy per experience (Alpine 01 – Opa's 07)
- Grouped display by experience when unsorted; flat list when sorted
- `EmptyState` used when no rooms match filters

Remaining: verify `EmptyState` component exists at `src/components/states/EmptyState.tsx`.

## Verification paths

**Path A** — Help Me Choose → party → dog → interests → loading → top match + alternates → room detail → rate selection → details  
**Path B** — View All Rooms → room detail → rate selection → details  
**Path C** — Backward: rate selection → room detail → results → help me choose (all answers/criteria intact)  
**Path D** — Edge states: sold-out room, only 1 match, dog filter removes best match, children remove 21+ rooms, invalid promo, no availability, API error, mobile layout
