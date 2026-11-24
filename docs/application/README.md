# Urban Cowboy Booking Engine — Application Documentation

This folder documents the architecture and operating decisions behind the custom Urban Cowboy booking engine.

The goal is to preserve not only what the application does, but why particular implementation choices were made so future changes do not accidentally reintroduce solved performance, availability, merchandising, or API-design problems.

## Current references

- [Cloudflare Next.js Admin Portal foundation](./admin-portal-nextjs-foundation.md) — COW-90 W1.2 application boundary, runtime choices, environment contract and deployment steps.
- [Admin Portal parity matrix](../application/admin-portal-parity-matrix.md) — COW-89 W1.1 capability-by-capability source → destination matrix and migration sequence.
- [Admin Portal auth, sessions and RBAC](./admin-portal-auth-rbac.md) — COW-91 W1.3 Access verifier reuse, capability matrix, protected layout and CSRF.
- [Admin Portal route and workflow port](./admin-portal-route-port.md) — COW-92 W1.4 route parity, panel reuse, capability gates and legacy defect fix.
- [W1.5 Sync Gate 1 readiness](./admin-portal-gate1-readiness.md) — COW-93 evidence, route/API/auth contract, and open cross-workstream decisions.
- [W1.6 parity closeout](./admin-portal-parity-closeout.md) — COW-94 incremental D1-backed sections, role fix, direct admin routes and remaining gaps.

- [Calendar Availability & Rate Snapshot Architecture](./calendar-availability-rate-snapshot.md) — how calendar rates, restrictions, caching, adaptive Mews polling, reservation-triggered refreshes, and the future Connector API migration work.

- [Saved Room Match Email Placeholder](./email-templates/room-match-saved-v1.md) — data contract and implementation TODO for emailing saved matcher results through the cart-recovery/n8n pipeline.
- [Room Discovery & Matcher Flow](./discovery-room-matcher.md) — how the signboard landing screen, full matcher, room-list modal, matched results, sharing, and saved-match tracking fit together.
- [Webflow Room Type Reviews](./webflow-room-type-reviews.md) — published Room Type review fields, Mews ID matching, blank-review behavior, and Webflow Cloud KV caching.
- [Booking Runtime Webflow Dependency Inventory (COW-103)](./booking-runtime-webflow-dependency-inventory.md) — route/consumer/source ownership map, Webflow runtime dependencies and required D1 replacements, Mews ARI authority proof, and wire-up gaps for W3.
- [Mews ARI Authority Matrix (COW-105)](./mews-authority-matrix.md) — authoritative operations, prohibited sources, D1 reference-data allowlist, guardrails shared with W1/W2, and the tests enforcing each boundary.
- [Gate 1 Integration Contract v1.0 (COW-107)](./gate1-integration-contract.md) — proposed shared W1/W2/W3 contract: authority matrix, guest envelopes, publication semantics, media identity, acceptance checklist and open decisions.
- [CMS-Driven Booking Footer](./cms-booking-footer.md) — Mews-property-to-Webflow-Location binding, dynamic location/copyright copy, optional legal links, and footer cache behavior.

- [Catskills Mews Identifiers](../catskills-mews-ids.md#deferred-add-on-delivery-tasks) — includes the deferred Connector API task-creation plan for scheduled add-ons and the certification prerequisite.
