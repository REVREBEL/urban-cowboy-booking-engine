````markdown
# URBAN COWBOY BOOKING ENGINE
## AUTHORITATIVE PLAN REVISION

Please revise the current implementation plan using the following instructions as authoritative.

Do NOT restart the design from scratch. Preserve the existing Figma screens, visual direction, component styling, and general booking journey unless specifically changed below.

The purpose of this revision is to align the Figma Make prototype with the actual Urban Cowboy Booking Engine architecture and the recommendation logic already defined in the production repository.

---

# 1. IMPORTANT PROJECT CONTEXT

The production repository is:

REVREBEL/urban-cowboy-booking-engine

The current `main` branch already contains important booking-domain logic and should be treated as the reference architecture.

Do NOT assume this is a completely greenfield booking system.

The Figma Make prototype may remain a standalone React/Vite implementation for design purposes, but its state shape, recommendation outputs, components, and terminology should mirror the production booking engine closely enough that the design can later be connected to the existing application without rewriting the UX architecture.

Relevant production files already on `main`:

- `docs/match_logic.md`
- `src/lib/topMatch.ts`
- `src/components/TopMatchPanel.tsx`
- `src/steps/Results.tsx`
- `src/state/booking.tsx`
- `src/lib/shaping.ts`
- `src/types/mews.ts`
- `tests/topMatch.test.ts`

The latest recommendation/content work is already on `main`.

There are no pending Urban Cowboy feature branches that need to be merged before this work.

The only unrelated open PR is Renovate configuration and should not affect this design work.

---

# 2. DO NOT CREATE A SECOND RECOMMENDATION SYSTEM

The previous plan proposed a simple client-side:

Persona × Style → Room lookup table

Do NOT implement that.

The production booking engine already defines the recommendation rules in:

`docs/match_logic.md`

The central principle is:

Eligibility decides what CAN be booked.

Interests decide what SHOULD be recommended.

Availability decides which recommendations the guest actually sees.

The UI should consume the output of that recommendation system rather than own the recommendation logic itself.

For the Figma prototype, mocked recommendation data is acceptable, but its shape and behavior must mirror the production recommendation contract.

---

# 3. BOOKING FLOW

Use the following guest-facing flow:

1 STAY
Dates + Guests + Promo

↓ 

2 ROOM
Find Your Stay

├── Help Me Choose
│     ↓
│   Recommendation Results
│
└── View All Rooms

↓
Room Detail

↓
Select Your Experience / Rate Selection

↓

3 DETAILS
Guest information

↓

4 EXTRAS

↓

5 PAY

IMPORTANT:

Rate Selection belongs within the ROOM stage.

Do NOT create a separate numbered progress step for Rate Selection.

The progress bar remains:

1 Stay
2 Room
3 Details
4 Extras
5 Pay

All of the following should show Step 2 / ROOM as active:

- Find Your Stay
- Help Me Choose
- Recommendation Results
- All Rooms
- Room Detail
- Rate Selection

Selecting a rate advances the guest to Step 3 / DETAILS.

---

# 4. SEPARATE VIEW STATE FROM BOOKING STATE

Do not make the current screen the source of truth for the reservation.

Maintain persistent booking state separately from the visible view.

Conceptually:

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
    interests: [
      MatchInterest,
      MatchInterest?
    ];
  };

  selectedRoomId?: string;
  selectedRoom?: RoomProduct;

  selectedRateId?: string;
  selectedRate?: RateOffer;
};
````

The visible UI can use a separate state such as:

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

Prefer a reducer/context pattern or equivalent shared booking store rather than unrelated local states scattered through screens.

Going backward must preserve the booking state.

---

# 5. ROOM TERMINOLOGY / HIERARCHY

Do not treat every guest-facing room family and every Mews category as the same concept.

Use these conceptual layers:

### Room Experience

Guest-facing merchandising family / way to stay.

Examples:

* Alpine
* Walden
* Forest House
* Cabin
* Chalet
* Lodge
* Opa's
* Slide Mountain
* Mountain View

### Room Product

The actual bookable room/category within an experience.

Examples:

* Alpine Bathing Suite
* Alpine Bathing Suite with Den
* Alpine Penthouse Bathing Suite
* Walden Forest Bathing Suite
* Walden Sunrise Bathing Suite
* Lodge King
* Slide Mountain Haus Double Queen

### Rate Offer

The available rate attached to the selected room product.

Examples:

* Flexible
* Breakfast
* Advance Purchase
* Extended Stay
* Member

The exact number of available room experiences should NOT be hardcoded.

Copy such as:

"8 ROOM EXPERIENCES AVAILABLE"

must derive from current filtered/available data.

Do not use the phrase:

"8 DISTRICT ROOM EXPERIENCES AVAILABLE"

Use:

"8 ROOM EXPERIENCES AVAILABLE"

or optionally:

"8 WAYS TO STAY"

with the number calculated dynamically.

---

# 6. HELP ME CHOOSE QUESTIONS

Replace the previous generic "What's Your Style?" logic with the production recommendation inputs.

The questionnaire should collect:

### Who's Coming Along?

* Partner
* Friends
* Family
* Solo

This is a SOFT ranking preference.

It is not the occupancy rule.

### Bringing a Dog?

* Yes
* No

Dog = Yes is a HARD eligibility filter.

Dog = No should not penalize dog-friendly rooms.

Unknown/Verify dog inventory should not be treated as dog-friendly.

### What Matters Most?

Choose up to two:

* Icon Tub
* Outdoor Soak
* My Own Place
* Scenic Views
* Simple + Cozy

Interest 1 is required.

Interest 2 is optional.

These interests are the strongest soft-ranking inputs.

Actual booking facts such as occupancy, children, age restrictions, and dog eligibility must always override preference scoring.

---

# 7. HARD ELIGIBILITY RULES

The recommendation UI must reflect the following production rules.

### Dates + Availability

Only rooms actually available for the selected dates may appear as recommendations.

Sold-out rooms must be skipped.

The guest should never see a recommendation card for inventory that cannot be booked.

### Occupancy

Actual guest count determines physical room eligibility.

Party type must never override occupancy.

For example:

"Friends" does not automatically mean a 2-bedroom room.

"Family" does not automatically mean children.

### Children / 21+

If actual children are present:

remove Alpine and Walden room inventory that is explicitly 21+.

Do not infer children from the "Family" quiz choice.

A family could consist entirely of adults.

Lodge is not itself 21+ inventory in the same way as Alpine/Walden, though an adult 21+ is required to book.

### Dog

Dog = Yes:

hard-filter rooms to confirmed dog-eligible inventory.

Dog = No:

do not penalize dog-friendly rooms.

Dog policy = Verify:

do not treat that room as dog-eligible until confirmed.

---

# 8. RECOMMENDATION SCORING

Do not recreate the scoring rules independently.

Reference:

`docs/match_logic.md`

The design should assume the recommendation service returns ranked eligible rooms.

Current production specification:

### Single Interest

Interest Fit × 10
+
Party Fit × 2

Interests must outweigh party type.

### Two Interests

Base:

Interest A × 10
+
Interest B × 10
+
Party Fit × 2

Intersection bonus:

* both interests score 4–5: +50
* one interest scores 4–5 and the other 2–3: +20
* otherwise: no intersection bonus

True dual-interest rooms should outrank rooms that only strongly satisfy one selected preference.

Do not fabricate a dual match.

Example:

Icon Tub + Outdoor Soak

No current room genuinely satisfies both.

The UI should honestly present different strong expressions of those interests rather than claim one room provides both.

---

# 9. RECOMMENDATION OUTPUT

The recommendation UI should expect up to three available results:

```ts
type RecommendationResult = {
  room: RoomProduct;
  score?: number;

  matchedInterests: MatchInterest[];

  explanation?: TopMatchCopy;
};
```

Display:

Recommendation 1
→ TOP MATCH

Recommendation 2
→ Alternate

Recommendation 3
→ Alternate

If only one or two eligible/available rooms remain, show only those rooms.

Do not leave empty card slots.

---

# 10. IMPORTANT REV-102 STATUS

The recommendation specification exists on production `main`, but the full ranking implementation is not yet complete.

Current production `Results.tsx` still effectively uses:

```ts
const topMatch = rooms[0] ?? null;
```

and:

```ts
rooms.slice(1, 3)
```

Do NOT copy that temporary behavior into the prototype as the intended architecture.

The prototype should be designed for the eventual ranked output:

```ts
recommendations[0]
recommendations[1]
recommendations[2]
```

where the recommendation engine has already applied:

availability
→ hard eligibility
→ preference scoring
→ ranking

The visual layer should not care how those results were computed.

---

# 11. TOP MATCH EXPLANATION PANEL

The production content architecture is already implemented in:

`src/lib/topMatch.ts`

and rendered through:

`src/components/TopMatchPanel.tsx`

Mirror that contract.

Support these fields:

```ts
type TopMatchCopy = {
  match_badge: string;
  room_type: string;
  party_summary: string;
  interest_summary: string;
  top_match_reason: string;
  benefit_1: string;
  benefit_2: string;
  benefit_3: string;
  season_label: Season;
  alternate_match_heading: string;
};
```

Desktop recommendation result layout:

LEFT
Top Match room card

RIGHT
Top Match explanation panel

Then:

Alternate Match 2
Alternate Match 3

On mobile:

Top Match room card
↓
Top Match explanation
↓
Alternate 2
↓
Alternate 3

The panel should always explain the ACTUAL first available ranked recommendation, never a sold-out theoretical winner.

---

# 12. TOP MATCH CONTENT SAFETY

Do not invent room features.

Copy must come from confirmed structured merchandising metadata.

Examples:

Do not mention:

* heated floors unless `heatedFloors = true`
* fireplace unless `fireplace = true`
* outdoor soaking unless `outdoorSoak = true`
* private deck unless `privateDeck = true`
* scenic view unless `scenicView = true`
* dog-friendliness unless confirmed
* standalone/private accommodation unless supported

If a seasonal physical feature is unavailable, fall back to truthful general Catskills seasonal copy.

The prototype should preserve this principle even when using mocked data.

---

# 13. ROOM MATCH MERCHANDISING METADATA

The prototype should assume room merchandising metadata exists separately from Mews transactional inventory.

Conceptually:

```ts
type RoomMatchContent = {
  mewsCategoryId?: string;

  displayName: string;

  matchReasons: Partial<
    Record<MatchInterest, string>
  >;

  features: {
    dogFriendly?: boolean;
    heatedFloors?: boolean;
    fireplace?: boolean;
    outdoorSoak?: boolean;
    indoorTub?: boolean;
    privateDeck?: boolean;
    scenicView?: boolean;
    ownPlace?: boolean;
    simpleCozy?: boolean;
  };
};
```

In production, Mews RoomCategory IDs should ultimately be the durable join key.

Do not make display-name string matching the long-term architecture.

---

# 14. AVAILABILITY SHOULD BE FETCHED BEFORE RECOMMENDATIONS RENDER

Conceptual data flow:

```text
Guest Search
    ↓
Mews Availability
    ↓
Available Room Products
    ↓
Hard Eligibility
    ↓
Join Room Merchandising Metadata
    ↓
Recommendation Scoring
    ↓
Rank
    ↓
Return First 3 Available
    ↓
Recommendation UI
```

The visual design should include a loading state while recommendation results are being resolved.

Do not briefly show unfiltered recommendations and then remove them.

---

# 15. ALL ROOMS VIEW

The "View All Rooms" experience should remain distinct from Help Me Choose.

Use the existing room card/grid design.

However:

* only available rooms should be displayed after an availability search
* preserve the existing dates/guest context
* do not hardcode room count
* sorting/filtering must preserve state
* going into a room and back must restore the previous grid/filter state

The existing editorial design can still inform section headings such as:

ALPINE
WALDEN
LODGE
FOREST HOUSE

but the primary usable layout should remain the card/grid experience.

---

# 16. ROOM DETAIL

Do NOT ask the guest to choose dates again if dates already exist in booking state.

Instead of:

CHECK AVAILABILITY
SELECT DATES

show the current reservation context:

June 2–3
2 Adults

with:

CHANGE

and a primary action such as:

SEE RATES

or:

CHOOSE THIS ROOM

If the user reaches a room detail page without booking criteria, then the date-selection version may be shown.

Desktop may use the designed right-side sticky panel.

Mobile should use a sticky bottom booking summary / CTA instead of simply pushing the desktop sidebar below all room content.

---

# 17. RATE SELECTION

The five rate cards in the design are VISUAL TEMPLATES, not guaranteed inventory.

Do not hardcode exactly five available rates.

The component should accept:

```ts
RateOffer[]
```

and render only rates returned for the selected room/search.

Examples of potential merchandising treatments:

* RIDE EASY
* SUNUP BEFORE THE TRAIL
* PLAN AHEAD. SAVE A LITTLE.
* STAY A WHILE & UNCLINCH
* WELCOME TO THE OUTFIT.

But a rate card only renders if that rate is actually available.

---

# 18. RATE CARD ARCHITECTURE

Build each rate as a responsive HTML/CSS card.

Do NOT flatten an entire rate card into a single image.

Use real HTML for:

* rate label
* headline
* description
* dates
* guests
* nightly price
* total stay price
* taxes/fees note
* cancellation/deposit note
* CTA

Use uploaded SVG/image assets only for decorative artwork such as:

* cowboy illustrations
* ornamental dividers
* stars
* decorative borders
* texture

The card should visually feel like a designed poster while remaining semantic responsive HTML.

Suggested component structure:

```text
RateCard
├── Decorative background / border
├── Header
│   ├── Eyebrow
│   ├── Rate headline
│   └── Description
├── Offer
│   ├── Dates
│   ├── Guests
│   ├── Nightly Price
│   ├── Stay Total
│   └── Taxes / Fees
│
├── Illustration
│
└── Footer
    ├── Book Rate CTA
    └── Cancellation / payment summary
```

Position dynamic content using Grid/Flexbox.

Avoid brittle absolute pixel placement for text.

---

# 19. RATE DATA RESPONSIBILITIES

The UI should treat Mews as the transactional/commercial source of truth.

Mews/live booking data supplies things such as:

* availability
* RoomCategory ID
* Rate ID
* nightly amount
* total amount
* stay dates
* occupancy
* applicable settlement/policy information

The Urban Cowboy merchandising layer supplies:

* guest-facing headline
* visual theme
* decorative artwork
* explanatory rate copy
* marketing framing

Conceptually:

```text
Mews Rate Data
      +
Cowboy Rate Merchandising Metadata
      +
Current Booking Search
      ↓
Rendered Rate Card
```

Do not make the rate card's static design the source of pricing truth.

---

# 20. RATE POLICY DISPLAY

Keep the card concise.

The primary card should show only the most important guest-facing restriction such as:

Free cancellation until May 31

or:

Non-refundable · Pay at booking

Detailed policy terms should be available through a:

RATE DETAILS

disclosure/drawer/modal.

Do not place long legal/policy text directly on the visual card.

---

# 21. APPLICATION / API STATES MUST BE DESIGNED

Add explicit visual states for:

### Availability

* loading
* results
* no availability
* API failure
* retry

### Recommendation flow

* calculating matches
* one result
* two results
* three results
* no eligible recommendation

### Room Detail

* room became unavailable
* search criteria changed
* rate inventory refreshed

### Rates

* loading rates
* no eligible rates
* promo code invalid
* member-only rate locked
* price changed
* selected rate became unavailable

Do not leave these until production integration.

---

# 22. BACK / FORWARD BEHAVIOR

Preserve guest context.

Examples:

Room Detail → Match Results
should retain questionnaire answers.

Match Results → Help Me Choose
should retain selected options.

Room Detail → All Rooms
should retain previous filter/sort and scroll state where practical.

Rate Selection → Room Detail
should retain selected room and search criteria.

The production implementation may eventually sync meaningful booking state with URL/history.

The Figma prototype does not need full routing if unnecessary, but it should not be architected in a way that prevents browser history/state restoration later.

---

# 23. RESPONSIVE RULES

Design explicitly for:

Desktop
Tablet
Mobile ~375px

Do not treat mobile merely as stacked desktop.

Important mobile behavior:

* Help Me Choose options remain easy to tap
* Room cards become single-column
* Top Match explanation stacks immediately after Top Match
* Room Detail uses sticky bottom CTA
* Rate cards use horizontal snap scrolling where appropriate
* show enough of the next rate card to communicate horizontal browsing
* provide visible next/previous controls on desktop for horizontal card rails

---

# 24. ACCESSIBILITY

Interactive tiles must behave like real controls.

Use proper:

* radio semantics for one-choice questions
* checkbox semantics for "choose up to two"
* focus-visible states
* keyboard operation
* labels
* aria-expanded where relevant
* accessible carousel controls
* alt text for meaningful imagery
* decorative SVGs hidden from assistive technology

Respect `prefers-reduced-motion`.

Do not rely on color alone for selected state.

---

# 25. COMPONENT ARCHITECTURE

Revise the prototype architecture to approximately:

```text
src/
  App.tsx

  booking/
    types.ts
    bookingReducer.ts
    mockData.ts
    recommendationAdapter.ts
    mewsAdapter.ts

  components/
    BookingChrome.tsx
    Footer.tsx

    AvailabilityCriteria.tsx

    FindYourStay/
      FindYourStay.tsx
      HelpMeChoose.tsx
      MatchResults.tsx
      AllRoomsGrid.tsx
      RoomCard.tsx
      TopMatchPanel.tsx

    RoomDetail/
      RoomDetail.tsx
      RoomFeatures.tsx
      BookingSummary.tsx

    RateSelection/
      RateSelection.tsx
      RateCard.tsx
      RateDetails.tsx

    states/
      LoadingState.tsx
      EmptyState.tsx
      ErrorState.tsx
```

The exact file structure may differ, but keep:

booking-domain logic
separate from
visual components.

Do not bury recommendation tables or Mews mock responses inside React presentation components.

---

# 26. FIGMA SCREENS

Continue using the existing Figma screens as the visual source:

Availability Criteria
`1:1390`

Find Your Stay / Help Me Choose
`1:1455`

Show All Rooms
`1:1470`
`1:1517`

Room Detail
`1:1696`

Rate Selection
`1:1683`

Icon Assets
`1:1698`

Do not redesign completed screens unless needed to support the revised interaction architecture.

The two main screens that need UX completion remain:

1. Help Me Choose / Recommendation Results
2. Show All Rooms

---

# 27. HELP ME CHOOSE RESULTS LAYOUT

Desktop target:

```text
TOP MATCH ROOM CARD        YOUR TOP MATCH PANEL
                           why this fits
                           you'll love it because...
                           seasonal reason

ALTERNATE MATCH 2

ALTERNATE MATCH 3
```

The Top Match should feel materially more important than alternates.

However, avoid making the alternates feel like errors or inferior inventory.

They are different valid expressions of the guest's preferences.

Include:

VIEW ALL ROOMS

as an escape hatch.

---

# 28. SEASONAL EXPLANATION

Top Match copy may respond to check-in season:

Winter
December–February

Spring
March–May

Summer
June–August

Fall
September–November

Only mention room-specific seasonal features when supported by room metadata.

Otherwise use truthful property/destination seasonal framing.

---

# 29. CURRENT IMPLEMENTATION VS TARGET ARCHITECTURE

Where existing production code and future architecture differ, design toward the TARGET architecture.

Example:

Current `Results.tsx` temporarily uses the first available room as Top Match.

The prototype should instead assume:

```ts
const recommendations =
  recommendationService.rank({
    availability,
    booking,
    preferences
  });
```

then:

```ts
const topMatch = recommendations[0];
const alternates = recommendations.slice(1, 3);
```

Do not encode the current temporary shortcut as a UX requirement.

---

# 30. VISUAL SYSTEM

Continue using the established Cowboy design direction and Figma source styling.

Current design tokens from the existing prototype may be used:

* Parchment / warm sand
* dark brown
* terracotta / rust
* ash
* firefly
* white

Continue resolving the intended Figma fonts and assets.

Do not substitute unrelated modern SaaS styling.

The booking experience should remain editorial, tactile, and characterful while behaving like a modern booking interface underneath.

---

# 31. VERIFICATION

Before calling the flow complete, verify the following journeys:

### PATH A — HELP ME CHOOSE

Search dates/guests

→ Find Your Stay

→ Help Me Choose

→ Party

→ Dog

→ Interest 1

→ optional Interest 2

→ loading/calculating

→ Top Match + up to 2 alternates

→ Room Detail

→ Select Your Experience

→ select available rate

→ Details

### PATH B — VIEW ALL

Search

→ Find Your Stay

→ View All Rooms

→ Room Detail

→ Rate Selection

→ Details

### PATH C — BACKWARD NAVIGATION

Rate Selection

→ Room Detail

→ Recommendation Results

→ Help Me Choose

All existing answers/search criteria should remain intact.

### PATH D — EDGE STATES

Verify:

* sold-out preferred room
* only one match available
* dog removes otherwise strong match
* children remove 21+ rooms
* invalid promo
* no room availability
* no rate availability
* API error
* mobile layout

---

# 32. DO NOT DO THESE THINGS

Do not:

* build a second recommendation matrix inside the UI
* use Persona × Style as the primary matcher
* hardcode exactly 3 rooms being available
* hardcode exactly 5 rates
* assume `rooms[0]` is the permanent Top Match architecture
* recommend sold-out rooms
* let party type override real occupancy
* infer children from "Family"
* infer dog eligibility from room names
* invent room features in explanatory copy
* ask guests for dates twice
* turn Rate Selection into a separate numbered progress step
* flatten rate cards into static images
* hardcode pixel coordinates for dynamic rate text
* hardcode "8 rooms"
* treat guest-facing experience names and Mews categories as identical concepts
* bury domain rules inside presentation components

---

# 33. PRIMARY DESIGN PRINCIPLE

The booking engine should feel editorial and highly curated to the guest, but underneath it should remain data-driven.

Think of the system as three layers:

```text
BOOKING TRUTH
Mews availability, room/category, rate, occupancy, pricing

        ↓

MERCHANDISING INTELLIGENCE
room metadata, matching weights, recommendation logic,
feature-safe explanations, rate storytelling

        ↓

COWBOY EXPERIENCE
Figma-designed UI, imagery, typography, cards,
guided discovery, editorial presentation
```

The visual layer should never become the source of truth for the first two layers.

Please revise the existing implementation plan accordingly before continuing the build.

```

