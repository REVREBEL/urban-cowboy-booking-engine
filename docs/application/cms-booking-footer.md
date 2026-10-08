# CMS-Driven Booking Footer

## The Brief

The booking engine footer uses the booking-specific chrome component at:

```text
src/components/booking/chrome/footer.tsx
```

The legacy footer previously embedded directly in `App.tsx` has been removed.

Footer property content is owned by the Webflow **Locations** CMS collection. The booking engine does not hardcode a Catskills, Nashville, Denver, or other location name into the footer.

## Webflow Source

Collection:

```text
Locations
Collection ID: 6abc812fd98b325b281d6301
```

Fields used by the footer:

| CMS field | Slug | Footer use |
| --- | --- | --- |
| Full Location Name | `full-location-name` | Location identity and copyright |
| City | `city` | Location line |
| State | `state` | Location line |
| Privacy Policy | `privacy-policy` | Optional legal link |
| Terms & Conditions | `terms-conditions` | Optional legal link |
| Accessibility | `accessibility` | Optional legal link |

Blank legal URL fields are normalized to `null`. The corresponding label and separator are not rendered.

## Mews Property to Webflow Location Binding

The booking engine already identifies inventory by a Mews property key such as:

```text
hotel
```

Each configured Mews property also carries a Webflow Location CMS item ID on the server.

For the current Catskills configuration:

```text
WEBFLOW_LOCATION_ITEM_ID = 6abc9142d98b325b2821ca23
```

This ID points at the **Catskills** item in the Locations collection.

The relationship lives in the server property configuration, not the footer component. When another Mews property/location is introduced, its property configuration should point to that location's Webflow CMS item.

## Runtime Location Resolution

The footer resolves the location in this order:

1. the property of the room actually selected for booking;
2. the currently active search property keys;
3. configured Mews property keys;
4. the only configured CMS location, if exactly one exists.

This allows the footer to follow the booking when multiple locations are supported later.

## Data Flow

```text
Mews property configuration
        |
        | property key + Webflow Location item ID
        v
Published Webflow Locations collection
        |
        | Content Delivery API
        v
/api/content/locations
        |
        | map keyed by Mews property key
        v
BookingFooter
```

Example normalized response:

```json
{
  "hotel": {
    "id": "6abc9142d98b325b2821ca23",
    "fullLocationName": "Urban Cowboy Lodge & Resort",
    "city": "Big Indian",
    "state": "NY",
    "privacyPolicyUrl": null,
    "termsConditionsUrl": null,
    "accessibilityUrl": null
  }
}
```

## Footer Rules

The location block displays:

```text
Urban Cowboy Lodge & Resort
Big Indian, NY
```

The copyright line is generated at runtime:

```text
© {CURRENT YEAR} {FULL LOCATION NAME}. All rights reserved.
```

No annual code edit is required.

Legal links render independently. For example, if only Privacy Policy and Accessibility contain URLs:

```text
Privacy Policy · Accessibility
```

Terms & Conditions is omitted entirely, including its separator.

## Cache

Locations are slow-changing editorial content and use the shared `WEBFLOW_CONTENT_CACHE` Webflow Cloud KV binding when available.

- fresh period: 6 hours;
- stale cache retention: up to 24 hours;
- stale content can be served immediately while the CMS refresh runs in the background;
- local development can operate without the KV binding using module-memory fallback and Webflow's Content Delivery CDN.

A CMS/cache failure never blocks the booking flow. The footer falls back to generic Urban Cowboy copyright copy if no bound location record is available.

## Relevant Files

```text
src/components/booking/chrome/footer.tsx
src/types/location-cms.ts
src/lib/api.ts
worker/webflow/locations.ts
worker/mews/_lib.ts
worker/index.ts
wrangler.toml
tests/locationCms.test.ts
```
