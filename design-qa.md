# Design QA: Travel Party

## Comparison target

- Source: `/Users/garystringham/Downloads/Travel Party.png` (1280 × 1307)
- Implementation: Help Me Choose step 1 at `http://127.0.0.1:3002/`, reviewed in the in-app browser at a 1280 × 720 viewport and scrolled through the full card.
- Scope: combine the travel-party and dog questions into one responsive card while preserving the existing matching payload and local controls.

## Findings and resolution

- P1, travel-party choices: the inherited gray text and translucent white fill had insufficient contrast on the sage card. Fixed by using the reference's pale-pink fill, dark-green border, and dark-green text for unselected choices.
- P2, flow structure: the dog question was a separate second screen. Fixed by placing the question, Yes/No radio controls, and detailed dog-friendly artwork below the travel-party choices inside the same card.
- P2, progress and copy: the flow still described three questions. Fixed by reducing the quiz progress to two steps and updating the Explore card copy.

## Fidelity surfaces

- Fonts and typography: existing project Desert & Rain, Brothers/Bianco, and Uchen font tokens retained; hierarchy follows the reference.
- Spacing and layout rhythm: centered rounded sage card, two-column party grid, internal divider, dog copy/artwork row, and external lower-right Continue action retained. The content stacks safely at narrow widths.
- Colors and tokens: forest background, sage card, paper text, cowboy umber, and pale-pink choice states match the existing project palette and reference direction.
- Image quality: uses the supplied detailed `/assets/icons/amenities/detailed/dog_friendly.svg` as a current-color mask; it renders at 50% opacity until selected and 100% when selected.
- Copy and content: party labels and dog guidance match the intended flow; the matching data contract remains `party`, `dog`, and `interests`.

## Interaction and accessibility

- Party and dog controls expose radio semantics and checked state.
- Continue remains disabled until both answers are selected.
- Selecting the dog artwork directly chooses Yes.
- Keyboard focus treatments remain visible.
- Verified that Continue advances directly from the combined card to `What Matters Most?`.

## Remaining polish

- P3: the live page currently shows the existing local hotel-configuration warning above the flow because the local Mews request returns 401. This is unrelated to the card implementation.

final result: passed
