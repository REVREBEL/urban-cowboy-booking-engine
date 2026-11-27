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
