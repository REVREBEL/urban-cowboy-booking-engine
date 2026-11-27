# Database decision log

Working record for the Urban Cowboy database redesign. Add a dated entry whenever a decision is made, including the current structure (OLD), the agreed direction (NEW), and implementation or review status. Keep open questions separate from decisions. Update the migration and validation references as work progresses.

**Current status:** first additive lookup/property-assignment migration is prepared on `draft/amenity-schema-foundation` and applied to the local review copy on the Mac. Production has not been migrated. A local-only unified amenities preview is also applied to the Mac review copy. A production-ready consolidation, global behavior and existing assignment backfill remain pending. Baseline: main at `e54b19ae50f661c9a08ee6080443b9a1dc3d8394`; live D1 amenity schema and counts were inspected on 2026-11-26. Database and source data may change.

## Decisions — 2026-11-26

### AM-01: One primary amenity record
**OLD:** `amenities` stores identity, name, icon fields and sort order; `amenity_editorial` stores the associated short name, descriptions and active status.
**NEW:** Plan one `amenities` record for the shared fields currently split across both tables. Preserve existing amenity IDs and editorial information through migration. Draft/revision and publication behavior must be accounted for in the implementation design.
**Status:** agreed direction; not implemented.

### AM-02: Preserve amenity content and identify source mappings
**OLD:** The current tables do not contain dedicated selling-point headline/body, type, category or slug columns. Image name and path columns exist on `amenities`; the audited export lacked those columns. The Webflow collection contains additional fields and behavior requiring a complete crosswalk.
**NEW:** Support key-benefit/selling-point headline and body, Type and Category. Preserve an optional slug and image name/path pending decisions about amenity pages and the current media/fallback strategy. Audit the live source, export and import paths field by field before mapping or migration; distinguish absent, empty and unmapped values.
**Status:** agreed direction; image/slug use and exact mappings open.

### AM-03: Configurable amenity types and categories
**OLD:** There are no dedicated type or category lookup tables on the current amenity schema.
**NEW:** Use separate tenant-wide type and category lookup tables, intended to feed a future Settings screen. Each amenity has one type and one category; a type/category may be shared by many amenities. Choices should have stable IDs, name, help description, sort order and active status; type help supports examples. Property-specific availability of choices remains an option.
**Initial type choices:** Feature, Amenity, Accessibility, Wellness, Nature / Environment.
**Initial categories:** Property, Rooms, Outlet, Location, Other.
**Type help:** Feature means a physical detail or built-in specification of a unit or room (examples include radiant bathroom floors and a copper clawfoot tub). Amenity means a shared facility, lifestyle perk or guest service provided by the property (examples include an outdoor soaking tub and concierge).
**Status:** agreed direction; exact placement of some themes and lookup property scoping remain open.

### AM-04: Property assignments and overrides
**OLD:** Amenities are tenant scoped; no direct amenity-to-location association exists in the current tables. A location can sometimes be inferred through a room assignment, but this does not represent property availability independently of rooms.
**NEW:** Add a many-to-many property-to-amenity assignment. Support optional property overrides of shared amenity copy and images; fields without an override inherit the shared values. Decide exact override and clearing semantics during schema design.
**Status:** agreed direction; not implemented.

### AM-05: Global amenity and room exceptions
**OLD:** `room_type_amenities` stores selected room/amenity assignments, display order and an exclusion flag. The audited importer handles restrictions associated with selected amenities; it does not establish the newly agreed global behavior.
**NEW:** Retain room-level assignment and ordering. When Global Amenity is enabled, include the amenity automatically for every room type at its assigned properties, unless that room explicitly excludes it. Ensure an exclusion can exist even when the amenity was not individually selected.
**Status:** agreed behavior; exact columns and resolution of default order remain to be designed and tested.

### AM-06: Policy and activity content
**OLD:** The legacy amenity Type list also included Policy and Activity.
**NEW:** Explore dedicated policy and activity models with structures appropriate to each domain and consistent property assignments. Their exact fields, relationships and shared taxonomy are not yet approved.
**Status:** direction discussed; design open.

### AUTH-01: Global and property-level permissions
**OLD:** The inspected authorization code provides tenant-scoped viewer/admin roles; property grants are not represented in that principal. Some data tables have location scope, but that alone does not enforce permissions.
**NEW:** Plan tenant-wide and property-specific user access, enforced by application authorization. Decide who may edit shared amenity records versus property overrides.
**Status:** requirement identified; detailed authorization design open.

### WORK-01: Incremental migrations and review
**OLD:** A complete database design and its historical decisions are not yet captured in a single running OLD/NEW log.
**NEW:** Maintain this log and save numbered migration files in the repository as work progresses. Build a local working copy for DbGate review, test the migration sequence with the project's D1 migration process, and retain migration and validation evidence. Production can be updated incrementally or at the end, coordinated with compatible application changes. Applied production migrations are not rewritten; subsequent changes use new migrations.
**Status:** local copy established at `~/Documents/Urban-Cowboy-Database-Review/urban-cowboy-review.sqlite`; first additive migration `0013_amenity_foundation.sql` applied locally via SQLite, not the Wrangler migration ledger. Production release timing remains open.

## Open questions
- Which source values populate every proposed field, including type/category, location, global flag, benefit copy and slug?
- Are Type and Category mandatory for every amenity? What are the exact migrated source choices and any mappings to the proposed vocabulary?
- How should a property explicitly clear an inherited optional value, and which individual fields can be overridden?
- Are image name/path still needed alongside the media registry, and are amenity-specific pages and slugs required?
- Should any lookup choices be restricted to particular properties, and should themes such as Wellness be shared across content domains?
- What permissions allow edits to shared records and property overrides?
- What is the deployment cadence and the compatible application rollout for each migration?

## Evidence and implementation tracking
- [Existing D1 schema contracts](d1-schema-contracts.md)
- [Source-to-target assessment](w2-1-source-schema-authority-assessment.md)
- [Webflow photo hotspots and amenity contract](webflow-photo-hotspots.md)
- [Current migrations](../../migrations/)
- First migration: `0013_amenity_foundation.sql` on `draft/amenity-schema-foundation`, for local review. Initial lookup and property-assignment tables only; it does not consolidate existing amenity tables, assign existing amenities to locations, or implement global/exception behavior.\n- Local review copy created from the live D1 export on 2026-11-26 and opened with DbGate. The migration was applied directly to this SQLite copy; it is not marked in a Wrangler ledger. Rebuild the local copy or reconcile the ledger before using a migration runner on it.\n- Production application: not scheduled.

## Local unified amenity preview — 2026-11-27

`scripts/schema-review/amenity_review_preview.sql` on `draft/amenity-schema-foundation` is a **local review preview, not a production D1 migration**. It rebuilds `amenities` with the agreed proposed fields, copies `amenity_editorial` values into it, and removes the separate editorial table from the review copy. Type/category, selling points, slug and global values remain NULL pending verified source mapping; NULL global is unknown rather than disabled. SQLite integrity and foreign-key checks passed; all 76 editorial rows and 253 room assignments were preserved and field comparisons returned zero differences. A pre-preview local backup is `~/Documents/Urban-Cowboy-Database-Review/urban-cowboy-before-amenity-unification.sqlite`. Application compatibility, idempotent production migration and remaining data mappings are still pending.

## Policy design — 2026-11-27

### POL-01: One type per policy
**OLD:** Policy and Activity were among the legacy amenity Type choices; a separate policy classification model is still being designed.
**NEW:** Each policy has one Type defining its assignment level: Property, Room Type, or Rate. A policy belongs to only one of these levels. Whether a separate classification (such as Pets or Age) is needed remains open. The number of properties, rooms, or rates to which a policy can be assigned within its selected level is also open.
**Status:** one-level Type requirement confirmed. A local-only policy preview has been created; no production migration has been applied.

### POL-02: Local policy table preview — 2026-11-27
**OLD:** Policy content is represented in versioned content, while some policy-like labels were part of the legacy Amenities collection. There was no dedicated set of policy assignment tables in the local redesign.
**NEW:** Local review tables `policies`, `policy_types`, `location_policies`, `room_type_policies`, and `rate_policies`. One policy Type selects one level (Property, Room Type, Rate), and the preview enforces that assignment tables match the selected Type. The proposed mapping allows a policy to be associated with multiple items at its chosen level; this cardinality is still for review. Each policy includes shared name, descriptions, and icon path/name. The rate link uses a placeholder external reference: the authoritative rate identity and any property association have not been determined.
**Status:** preview only on the Mac's local review database. SQL is stored at `scripts/schema-review/policy_preview.sql` on `draft/amenity-schema-foundation`; it is not a production migration. Type defaults, integrity, foreign keys, and rejecting a room policy assigned to a rate were checked. Backup: `~/Documents/Urban-Cowboy-Database-Review/urban-cowboy-before-policy-preview.sqlite`. No policy content was imported.

## Room type design — 2026-11-27

### ROOM-01: Preserve Room Types export fields for review
**OLD:** `room_types` held identity, tenant/location, Mews category ID, name, slug and sort order. Publication and room-amenity assignments were stored separately. The 2026-11-15 Webflow export contained additional names, descriptions, benefits, building, room specifications, policies, reviews and CMS metadata.
**NEW:** Gary requested adding all missing fields. A local-only preview adds 28 columns to `room_types` and imports values for all 22 exported room types. Room size is text to preserve values such as ranges and comma formatting; bed type remains a Webflow source option ID. Source policy references are retained as `webflow_policy_ids`; the new `room_type_policies` table has not been populated from these legacy references. Existing room-amenity mappings and publication records remain separate. Source timestamps and flags are preserved with `webflow_` prefixes. Blank source values remain NULL.
**Status:** local preview only, not a production D1 migration. Saved as `scripts/schema-review/room_type_local_preview.py` on `draft/amenity-schema-foundation`. A separate validation copy matched all 28 fields for every source record, kept all 253 amenity assignments, and passed foreign-key/integrity checks. The preview was then applied to the Mac local review database. Backup: `~/Documents/Urban-Cowboy-Database-Review/urban-cowboy-before-room-type-preview.sqlite`.
**Open:** confirm authoritative sources for bed counts, unit counts and room specifications; resolve Webflow bed-type option IDs; map legacy policy references to the new policy records; review room publication, image and review models before production migration.

### ROOM-02: Separate reviews and source metadata — 2026-11-27
**OLD:** The local room type preview stored a single set of review fields and Webflow-specific metadata directly on `room_types`.
**NEW:** Gary approved a separate room review table and removal of source-specific metadata from `room_types`. The local preview creates `room_type_reviews`, allowing multiple reviews per room, and moves source timestamps, locale and flags to `room_type_source_metadata` pending the final retention decision. Existing policy IDs stay temporarily on `room_types` until the new policy mappings are verified. Review publication status remains NULL because the source does not establish a separate review status.
**Status:** local-only preview applied using `scripts/schema-review/room_review_local_preview.sql` on `draft/amenity-schema-foundation`. Eleven records containing review text or metadata were transferred with zero field mismatches, 22 source metadata records retained, and foreign-key/integrity checks passed. Seventeen source policy reference fields remain pending mapping. Local backup: `~/Documents/Urban-Cowboy-Database-Review/urban-cowboy-before-review-normalization.sqlite`. Production migration and application integration are not implemented.
