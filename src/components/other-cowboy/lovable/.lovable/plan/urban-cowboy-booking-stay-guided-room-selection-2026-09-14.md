# Urban Cowboy Booking — Stay + Guided Room Selection

Build the first two steps of the new booking flow, using the Figma booking-engine layouts as structure and Urban Cowboy character for the styling and voice.

## Flow covered

```text
STAY  →  ROOM (Help Me Choose → Your Best Matches → room & rate drawer)  →  [Details, Extras, Pay: later]
```

A progress bar shows all five steps so the whole journey reads clearly, with the later three shown but not yet clickable.

## Screen 1 — Stay

- Headline and short line of Cowboy voice.
- Arrival and departure dates, adults, children, pets, and an "accessible room needed" option.
- These are real eligibility rules: anything a guest sets here filters which rooms can ever be shown.
- Continue moves to the Room step.

## Screen 2 — Room

Opens with two clear choices: **Help me choose** or **View all available rooms**.

**Help me choose**

- Who's coming (Partner, Friends, Family, Solo) — shown only when the party details don't already answer it.
- "What matters most? Pick up to two." Options: Iconic Tub, Bathe Outside, My Own Place, Near Everything, Simple + Cozy, Mountain Views. "Bringing My People" appears only when the party is large enough for it to matter.
- Skippable at any point; nothing here removes a room the guest is eligible for.

**Your Best Matches**

Three rooms with human labels and a plain-language reason, e.g.

- BEST MATCH — Walden Forest Bathing Suite — "Outdoor cedar tub, right in the trees."
- ANOTHER WAY TO SOAK — Alpine Bathing Suite — "Iconic indoor soak with the ridgeline out the window."
- GO ALL IN — Chalet — "Your own place, more room to spread out."

No percentages or scores. "View all available rooms" stays visible below the three.

**All rooms**

Same room cards in a full list, each with its own reason to choose it, so nothing is hidden.

**Room + rate drawer**

Selecting a room opens a side drawer without losing the match context: photography slot, defining amenities, why it matched, and the rates together —

- Member Rate — best direct value, joins the member list
- RIDE EASY — fully flexible
- Advance Purchase — better value when plans are firm

Choosing a rate confirms the room and shows a short summary panel (room, rate, dates, guests) as the handoff point into Details.

## Rooms included

Alpine, Walden, Lodge, Cabin, Chalet, Forest House, Slide Mountain and the other Cowboy room types, written in with real names, character copy, capacity, pet and accessibility flags, and placeholder nightly rates you can correct later. Photos are left as neutral image slots for you to supply.

## Look

Warm rustic-modern: deep charcoal and ember tones, cream paper, one bold accent, generous space, confident type. The Figma frames set the layout (header, progress bar, main column plus sticky summary sidebar, footer); the finish is Urban Cowboy, not the Bambou template styling.

## Technical notes

- New routes: `/` (Stay), `/room` for the room step, drawer as local UI state; step state held in a booking context so dates and preferences persist across steps.
- Rooms, preference tags and rates live in a typed data file in the app; matching is a small transparent rules function — hard filters (occupancy, pets, children, accessibility) first, then preference tags decide the three picks and the reason strings.
- No backend needed at this stage; preferences are kept in memory ready to personalize Extras later.
- Design tokens added to `src/styles.css`; every route gets its own page title and description.

&nbsp;

The Imported Compoent Name "Full Page Room Details" is an example of the direction we're exploring for the room cards expanded information.   
  
Specicially to help visually guides, I've added the figma custom icon component which repersent specifc room type features.  
  
Kitchen Feature  
Heating Element  
Water Feature  
Room Feature  
Bed Type Icon  
Basic Features  
Building Icon  
Badge  
  
Note the component with the word Connected do already have a back end connect to to them so while we can design the front end we should be aware of the specific API calls and steps needed for the framwork. 