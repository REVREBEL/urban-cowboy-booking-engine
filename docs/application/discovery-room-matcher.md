# Room Discovery & Matcher Flow

## The Brief

The booking engine supports two ways to move from live date availability into room selection:

1. **Help Me Choose** — answer two short questions and rank the live Mews room types.
2. **Show All Rooms** — browse the full eligible room-type list.

The matcher never owns hotel inventory. It only ranks the already-shaped live Mews results after hard eligibility rules are applied.

## Flow

```text
Dates
  ↓
MatchOrBrowseScreen
  ├─ Help Me Choose → RoomMatcherPage → Matched Results
  └─ Show All Rooms → BuildingExperienceList
                           ↓
                     Help Me Choose
                           ↓
                   HelpMeChooseModal
                           ↓
                    Matched Results
```

When the modal was opened from the room list, **Back** from matched results returns to the room list. When the full matcher was used, Back returns to the full matcher.

## Match or Browse Screen

`MatchOrBrowseScreen.tsx` uses `RusticLodgeSignboard.tsx` to layer live text and actions over:

- `/assets/decoration/backgrounds/background.png`
- `/assets/decoration/backgrounds/backboard.png`

The imported mockup's fake data/types were removed.

## Room Matcher

`RoomMatcherPage.tsx` now writes the canonical `RecommendationPreferences` contract:

```ts
{
  party: "partner" | "friends" | "family" | "solo";
  dog: boolean;
  interests: [MatchInterest, MatchInterest?];
}
```

The same party options and preference list are reused by `HelpMeChooseModal.tsx` so the full-page and modal experiences do not drift.

Actual child counts and age eligibility remain owned by the live booking search, not by a duplicate "kids" question inside the matcher.

### Dog control

Large screens use:

```text
/assets/icons/amenities/detailed/dog_friendly.svg
```

Small screens use the lighter badge:

```text
/assets/badges/features/dog_friendly.svg
```

The dog flag is a hard eligibility filter in the existing room-ranking logic.

## Matched Results

The matched-results screen uses:

- the existing `RoomsListCard` for the top live room;
- `MatchBenefitsCard` beside it to explain why that room ranked first;
- two additional high-ranking `RoomsListCard` options below.

The previous low-visibility Browse All footer was replaced by a prominent action panel with:

- Browse All Rooms
- Share Matches
- Save & Email

Matcher preferences are persisted into the URL before results render so a shared URL can reconstruct the recommendation inputs.

## Saved Matches

Save & Email records a `cart.matches_saved` event through the existing tracking pipeline. The saved email is written into the same `customer.email` field used by cart-recovery data.

Additional match metadata includes:

- top Mews RoomCategoryId;
- two alternate RoomCategoryIds;
- party;
- dog flag;
- interests;
- share URL;
- email-template key.

Template placeholder:

```text
room-match-saved-v1
```

See `email-templates/room-match-saved-v1.md` for the outstanding email-delivery TODO.
