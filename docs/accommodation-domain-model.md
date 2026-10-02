# Accommodation domain model

This project uses hotel-domain terminology inside the application and keeps Mews terminology at the integration boundary.

## Canonical lodging hierarchy

```text
Room
  ├── Physical Room
  └── Component / Virtual Room

Room Type
Room Type Group
Bed Type
Room Class
```

### Room

A Room is an inventory unit.

A Room must identify its inventory-unit kind:

- **Physical Room**: an actual physical lodging unit.
- **Component / Virtual Room**: a sellable virtual/composite unit made from one or more underlying rooms or components.

A Room is not the same thing as a Room Type.

### Room Type

The sellable accommodation category presented to the guest.

Examples:

- Walden King
- Walden Sunrise Bathing Suite
- Alpine Bathing Suite
- Lodge 3 Bedroom Suite

For the Catskills Mews integration, the durable Room Type ID is the Mews `RoomCategoryId`.

Mews may describe this concept as a Space Category. Inside this application it is always a **Room Type**.

### Room Type Group

A higher-level accommodation grouping used for navigation, storytelling, filtering, merchandising, and recommendation context.

Examples:

- Alpine Haus
- Walden Haus
- The Lodge
- Forest House
- Cabin
- Chalet
- Opa's
- Slide Mountain
- Mountain View

Mews does not provide this layer for the Catskills configuration. The Room Type Group is therefore owned by the Cowboy content/domain model.

A Room Type Group may contain many Room Types or only one.

### Bed Type

The sleeping configuration associated with a Room Type or Room.

Examples:

- King
- Double Queen
- King + Sofa
- Multi-room / mixed configuration

Mews `NormalBedCount` and `ExtraBedCount` are bed counts, not a complete Bed Type model and not authoritative maximum guest occupancy.

### Room Class

The broad lodging classification.

Examples:

- Room
- Suite
- Cabin
- House

Mews `SpaceType` can seed this value at the integration boundary, but the application exposes it as **Room Class**.

## Space

`Space` is reserved in our domain for non-lodging rentable/function inventory, such as:

- meeting rooms
- ballrooms
- private dining rooms
- event lawns
- function areas
- other rentable non-bedroom areas

Do not use `Space` as a synonym for a lodging Room or Room Type in application/domain code.

## Mews terminology translation

| Mews / integration term | Application domain term | Notes |
| --- | --- | --- |
| Room / resource / space representing a lodging unit | Room | Physical or component/virtual inventory unit |
| `RoomCategoryId` / Space Category | Room Type ID / Room Type | Durable integration key |
| No Catskills equivalent | Room Type Group | Custom Cowboy hierarchy |
| `NormalBedCount`, `ExtraBedCount` | Bed-count metadata | Does not fully define Bed Type |
| `SpaceType` | Room Class | Renamed after shaping |
| Non-lodging resource/space | Space | Reserved for function/event inventory |

Raw Mews request and response fields keep their Mews names. For example, API requests still send `roomCategoryId`. Once data crosses into the application domain it uses `roomTypeId`.

## Current Catskills Room Type Groups

The current merchandising registry recognizes:

```text
alpine
walden
lodge
forest-house
cabin
chalet
opas
slide-mountain
mountain-view
```

The relationship is:

```text
Mews RoomCategoryId
        ↓
Room Type
        ↓
Room Type Group
        ├── group story / description
        ├── illustration
        ├── group ordering
        ├── badges / policies
        └── presentation treatment
        ↓
Match Profile
        ├── party scores
        ├── interest scores
        ├── eligibility rules
        └── match reasons
```

The three layers are complementary:

1. **Room Type profile / Mews binding** identifies and enriches the sellable Room Type.
2. **Room Type Group presentation** organizes Room Types into the higher-level guest experience Mews does not provide.
3. **Matching logic** consumes the resolved Room Type data to rank eligible live inventory.

## Source ownership

- **Mews**: Room Type identity, live availability, rates, pricing, Mews name/description/images, occupancy rules.
- **Cowboy/Webflow CMS**: Room Type Group relationship, enhanced content, amenities, reviews, editorial assets, presentation metadata, match-profile configuration.
- **Application code**: joining sources, eligibility/ranking algorithms, UI rendering and booking workflow.
- **Dashboard**: controlled management UI over the CMS/configuration layer, not a second content database.

This terminology is authoritative for new application code and CMS schema design.
