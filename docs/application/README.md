# Urban Cowboy Booking Engine — Application Documentation

This folder documents the architecture and operating decisions behind the custom Urban Cowboy booking engine.

The goal is to preserve not only what the application does, but why particular implementation choices were made so future changes do not accidentally reintroduce solved performance, availability, merchandising, or API-design problems.

## Current references

- [Calendar Availability & Rate Snapshot Architecture](./calendar-availability-rate-snapshot.md) — how calendar rates, restrictions, caching, adaptive Mews polling, reservation-triggered refreshes, and the future Connector API migration work.

- [Saved Room Match Email Placeholder](./email-templates/room-match-saved-v1.md) — data contract and implementation TODO for emailing saved matcher results through the cart-recovery/n8n pipeline.
- [Room Discovery & Matcher Flow](./discovery-room-matcher.md) — how the signboard landing screen, full matcher, room-list modal, matched results, sharing, and saved-match tracking fit together.
- [Webflow Room Type Reviews](./webflow-room-type-reviews.md) — published Room Type review fields, Mews ID matching, blank-review behavior, and Webflow Cloud KV caching.
- [CMS-Driven Booking Footer](./cms-booking-footer.md) — Mews-property-to-Webflow-Location binding, dynamic location/copyright copy, optional legal links, and footer cache behavior.

- [Catskills Mews Identifiers](../catskills-mews-ids.md#deferred-add-on-delivery-tasks) — includes the deferred Connector API task-creation plan for scheduled add-ons and the certification prerequisite.
