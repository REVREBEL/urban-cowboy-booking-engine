# Urban Cowboy Room Type merchandising model

See `docs/accommodation-domain-model.md` for the canonical lodging terminology.

The booking engine separates three concerns:

1. **Mews operational truth**: Room Type ID (`RoomCategoryId` at the API boundary), availability, occupancy, price and rates.
2. **Urban Cowboy Room Type profile**: Room Type Group relationship, policies, feature facts, recommendation scores and match reasons.
3. **UI presentation**: Room Type Group sections, room cards, tags, match explanations and detail views.

The current profile registry lives in `src/lib/roomMerchandising.ts`.

## Durable identity

Production logic identifies each Room Type with the Mews `RoomCategoryId`, exposed in our domain as the Room Type ID.

Each profile currently contains:

- `mewsRoomTypeIds`: durable Mews Room Type UUID bindings.
- `legacyNames`: transitional exact-name aliases.
- `roomTypeGroupKey`: our higher-level Room Type Group relationship.

UUID matching is authoritative. Name matching remains only as a migration/failsafe bridge.

All 22 current Catskills production Room Types have durable Mews bindings.

## Room Type Groups

Mews does not provide the Room Type Group layer required by the Catskills booking experience. The Cowboy model currently defines:

- Alpine
- Walden
- Lodge
- Forest House
- Cabin
- Chalet
- Opa's
- Slide Mountain
- Mountain View

This relationship powers higher-level filtering and the editorial building/group presentation.

## Matching rules

The score matrix comes from `docs/match_logic.md`.

Eligibility happens before ranking:

- Mews availability and occupancy determine what can physically be booked.
- If children or infants are present, Room Types with `agePolicy: "adultsOnly21"` are removed.
- `adult21Required` means an adult 21+ must be present; it does not by itself remove families.
- If the guest says a dog is coming, only `dogPolicy: "allowed"` is eligible. `unknown` is not treated as dog-friendly.

Then interests and party type rank the remaining live Room Types.

The matching algorithm stays in application code. Its Room Type facts and scoring configuration can later be managed through the Webflow-backed content/configuration layer.

## Source discipline

A recommendation score is not automatically a guest-facing factual claim.

The `features` object remains deliberately conservative. Only verified feature flags should appear in guest-facing tags or match explanations.
