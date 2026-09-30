# Asset Library

This folder is being migrated gradually into a canonical structure. Existing root-level assets remain valid until the component using them is revised.

## Canonical folders

- `brand/logos` — primary logo files and lockups
- `brand/marks` — standalone brand marks
- `photos/rooms` — room photography
- `photos/property` — property and destination photography
- `icons/amenities/simple` — compact amenity icons for filters, cards, and dense UI
- `icons/amenities/detailed` — richer amenity artwork for merchandising and room detail views
- `icons/ui` — interface icons such as search, calendar, arrows, and settings
- `icons/social` — social/platform icons
- `badges/eligibility` — adults-only, family-friendly, dog-friendly, and similar status markers
- `badges/trust` — trust and reassurance badges such as Best Rate Guaranteed
- `illustrations/preferences` — larger selectable preference artwork
- `illustrations/interaction` — stateful interaction artwork such as dog-toggle states
- `illustrations/decorative` — standalone decorative illustrations
- `labels/preferences` — illustrated/text labels paired with preference artwork
- `decoration/backgrounds` — decorative panel and card backgrounds
- `decoration/accents` — lines, flourishes, frames, and small accents
- `decoration/seasonal` — seasonal decorative artwork

## Migration rule

Do not bulk-move the legacy assets. Move or rename an asset only when the component that references it is being revised, and update that component path in the same change.
