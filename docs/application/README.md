# Urban Cowboy Booking Engine — Application Documentation

This folder documents the architecture and operating decisions behind the custom Urban Cowboy booking engine.

The goal is to preserve not only what the application does, but why particular implementation choices were made so future changes do not accidentally reintroduce solved performance, availability, merchandising, or API-design problems.

## Current references

- [Calendar Availability & Rate Snapshot Architecture](./calendar-availability-rate-snapshot.md) — how calendar rates, restrictions, caching, adaptive Mews polling, reservation-triggered refreshes, and the future Connector API migration work.

- [Saved Room Match Email Placeholder](./email-templates/room-match-saved-v1.md) — data contract and implementation TODO for emailing saved matcher results through the cart-recovery/n8n pipeline.
