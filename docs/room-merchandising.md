# Urban Cowboy room merchandising model

The booking engine separates three concerns:

1. **Mews inventory truth**: category ID, availability, occupancy, price, rates.
2. **Urban Cowboy merchandising**: dog policy, age policy, room-family facts, amenity facts, recommendation scores.
3. **UI presentation**: cards, tags, match explanations, drawers.

The merchandising registry lives in `src/lib/roomMerchandising.ts`.

## Durable identity

Production logic should identify a room type by the Mews `RoomCategoryId`, not by its display name.

Each merchandising record therefore has:

- `categoryIds`: durable Mews category UUIDs.
- `legacyNames`: temporary exact-name aliases used only while migrating the live catalogue.

The resolver always tries `categoryIds` first. The name fallback is intentionally isolated in one file so room cards, the matcher, TopMatch copy, and dialogs never infer facts from names themselves.

The repository does not currently contain the production Catskills room-category UUIDs, so no UUIDs are invented here.

The confirmed Catskills identifiers are:

- Booking Engine Configuration ID: `4725ace3-6b93-439f-a549-b4bc00ae1d10`
- Hotel / Enterprise ID: `8bd38131-c371-4625-9c29-b10600705d34`
- Adult age category: `8f3ceb39-5c40-417a-b9a5-b106007064f8`
- Child age category: `db093f0b-738e-4afe-9191-b106007065ff`

The Mews subscription number `16703` is an account/subscription reference and is not used in Booking Engine API request payloads.

To retrieve the category IDs with the registered production Booking Engine client:

```bash
MEWS_CLIENT='Your Registered Client 1.0.0' npm run room-ids
```

Then copy each returned UUID into the corresponding `categoryIds` array in `src/lib/roomMerchandising.ts`.

During development, the Results page also logs any room that resolved through a legacy name with its live `RoomCategoryId`.

Once every Catskills category has a UUID binding, the `legacyNames` fallback can be removed.

## Matching rules

The score matrix comes from `docs/match_logic.md`.

Eligibility happens before ranking:

- Mews availability and occupancy determine what can physically be booked.
- If children or infants are present, rooms with `agePolicy: "adultsOnly21"` are removed.
- `adult21Required` does **not** remove families; it means an adult 21+ must be present.
- If the guest says a dog is coming, only `dogPolicy: "allowed"` is eligible. `unknown` is not silently treated as dog-friendly.

Then interests and party type rank the remaining rooms:

- one interest: `interest × 10 + party × 2`
- two interests: both interest scores + party score
- both interests score 4–5: +50 intersection bonus
- one scores 4–5 and the other 2–3: +20 intersection bonus
- documented single-interest ladders break ties

Availability has already been applied by Mews, so sold-out inventory never occupies a recommendation slot.

## Source discipline

A high recommendation score is not automatically a guest-facing factual claim.

The `features` object is deliberately more conservative than the scoring matrix. Only explicit feature flags may appear in tags or recommendation copy.

Dog policies and the room facts currently encoded in the registry follow the project matching matrix and the current Urban Cowboy Catskills lodging pages. Unknown dog policies for Opa's Cabin, Mountain View Haus, and Slide Mountain Haus Double Queen remain `unknown` until the property/CRS confirms them.
