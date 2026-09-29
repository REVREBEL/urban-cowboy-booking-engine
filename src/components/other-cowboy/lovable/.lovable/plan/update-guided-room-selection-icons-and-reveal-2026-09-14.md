# Update guided room-selection icons and reveal

## What will change
- Replace the five matching preference illustrations with the uploaded tub, outdoor soak, cabin, balcony, and writing-desk artwork.
- Rename “Bathe Outside” to “Soak Outside” throughout the visible booking copy.
- Restyle selected question options with a soft off-white fill and a stronger border instead of bright white.
- Keep recommendations hidden until a preference is chosen, then show a short spinner before the room cards fade in.

## Technical details
- Keep the existing preference identifiers so matching behavior and saved booking state remain compatible.
- Use the new uploaded artwork through the project’s asset delivery flow.
- Respect reduced-motion settings and prevent stale loading transitions when selections change quickly.
- Verify the guided flow at desktop and mobile sizes and confirm the preview remains error-free.
