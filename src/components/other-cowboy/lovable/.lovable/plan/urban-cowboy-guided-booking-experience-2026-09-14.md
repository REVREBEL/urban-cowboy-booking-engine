# Urban Cowboy guided booking experience

## Goal
Turn the supplied booking concepts into one polished, responsive, interactive reservation flow. Preserve the strongest ideas from the references—the editorial room photography, compact stay search, optional preference quiz, curated room matches, clear rate selection, and restrained lodge-inspired visual language—without copying the fixed-size export code.

## What will be built

1. **Shared booking frame**
   - Refine the Urban Cowboy header, progress navigation, footer, typography, palette, and spacing to match the supplied references.
   - Add a compact editable stay bar after the first step so dates and guests remain visible throughout the flow.
   - Keep every screen usable on phones and desktop.

2. **Stay search**
   - Replace the current form-card treatment with the supplied rounded booking search pattern.
   - Support arrival, departure, adults, children, dog, accessibility, and promo code inputs.
   - Preserve validation and carry the selections into later steps.

3. **Guided room selection**
   - Keep both paths: “Help me choose” and “View all rooms.”
   - Present the optional party and ritual questions in a focused overlay inspired by the qualifying-questions reference.
   - Show three curated recommendations with clear match reasons, while keeping all eligible rooms available.

4. **Editorial room cards, galleries, and details**
   - Use the uploaded Room Photos as the primary imagery throughout recommendations and room details, organized by Alpine, Cabin, Opal Haus, Chalet, Forest Haus, Lodge, and Robber Baron categories.
   - Rebuild room cards around the supplied photography and room-card composition: large imagery, meaningful labels, concise specs, price, and strong room/rate actions.
   - Add image controls and polished galleries wherever multiple room photos are available.
   - Upgrade the room details/rate view with the matching photo set, feature icons, room copy, occupancy, and selectable rates.

5. **Complete reservation journey**
   - Add working Details, Extras, Pay, and Confirmation screens based on the supplied connected booking references.
   - Details: guest/contact information and stay summary.
   - Extras: selectable add-ons with running totals.
   - Pay: booking review, terms acceptance, and a clearly labeled demonstration payment action.
   - Confirmation: confirmation number, stay details, selected extras, and next-step information.
   - Keep the flow in browser state only; no real payment processing or persistent reservation storage is included.

6. **Polish and verification**
   - Use semantic design tokens and the existing interface controls throughout.
   - Add unique page metadata for every booking step.
   - Verify the complete path, interactions, images, and layouts at desktop and mobile sizes.

## Technical details

- Continue using the existing TanStack Start routes and shared booking state.
- Create separate routes for `/details`, `/extras`, `/pay`, and `/confirmation`; retain `/` and `/room`.
- Extend the booking model with guest details, add-ons, terms acceptance, totals, and confirmation data.
- Copy only production assets needed from the supplied exports into the app; do not render reference screenshots or import the brittle fixed-canvas exports.
- Associate supplied room photography with the matching room records and provide a tasteful fallback for rooms without dedicated images.
- Reuse the existing matching and eligibility logic, then connect selected rates to the remaining steps.
