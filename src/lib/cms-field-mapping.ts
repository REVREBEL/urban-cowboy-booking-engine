/**
 * COW-98: field-level source -> D1 mapping used by the Webflow CMS importer to
 * generate docs/generated/cms-field-mapping.json.
 *
 * This is a documentation contract, not a second importer. It explains where
 * each exported field goes and, just as importantly, which fields are
 * deliberately not stored. Every field not listed under `fieldTargets` or
 * `metadataFields` is reported as unmapped with the collection's explicit
 * reason, so a missing field can never be mistaken for a silent mapping.
 */

export interface CollectionFieldMapping {
  sourceCollection: string;
  d1Targets: string[];
  /** Source field to one or more D1 targets (`table.column`). */
  fieldTargets: Record<string, string[]>;
  /** Fields read by the importer but not stored as their own column. */
  metadataFields: string[];
  /** Versioned collections keep the whole source row in one JSON payload. */
  allFieldsToPayload?: string;
  /** Reason applied to every field with no mapping. */
  unmappedReason: string;
}

const SYSTEM_FIELDS = ["cmsLocaleId", "createdOn", "lastUpdated", "lastPublished", "isArchived", "isDraft"];

export const CMS_FIELD_MAPS: readonly CollectionFieldMapping[] = [
  {
    sourceCollection: "locations",
    d1Targets: ["locations", "location_publication", "content_items", "content_revisions", "content_provenance"],
    fieldTargets: {
      id: ["locations.id", "content_provenance.source_id"],
      slug: ["locations.slug"],
      name: ["locations.name"],
      // Only these five controls are actually written to the site_settings
      // revision payload, under their camelCase SiteSettings keys.
      "enable-demo-engine": ["content_revisions.payload_json (site_settings.enableDemoEngine)"],
      "production-layout": ["content_revisions.payload_json (site_settings.productionLayout)"],
      "demo-layout": ["content_revisions.payload_json (site_settings.demoLayout)"],
      "enable-feature-section": ["content_revisions.payload_json (site_settings.enableFeatureSection)"],
      "enable-event-dates-quick-selection": ["content_revisions.payload_json (site_settings.enableEventDatesQuickSelection)"],
    },
    metadataFields: SYSTEM_FIELDS,
    unmappedReason: "Public business contact, address, social, policy and feature-story copy: Webflow remains the source until a publication workflow is agreed (COW-29 §7 A). Not stored, never inferred.",
  },
  {
    sourceCollection: "buildings",
    d1Targets: ["buildings", "content_provenance"],
    fieldTargets: {
      id: ["buildings.id"], name: ["buildings.name"], slug: ["buildings.slug"],
      sort: ["buildings.sort_order"], location: ["buildings.location_id"],
    },
    metadataFields: SYSTEM_FIELDS,
    unmappedReason: "No D1 column; editorial copy stays in Webflow.",
  },
  {
    sourceCollection: "roomTypes",
    d1Targets: ["room_types", "room_type_amenities", "room_type_publication", "content_provenance"],
    fieldTargets: {
      id: ["room_types.id"],
      name: ["room_types.name"],
      "short-name": ["room_types.name (fallback)"],
      slug: ["room_types.slug"],
      sort: ["room_types.sort_order"],
      "property-location": ["room_types.location_id"],
      "mews-room-type-id": ["room_types.mews_room_category_id"],
      "features-amenities": ["room_type_amenities.amenity_id"],
      "amenity-display-order": ["room_type_amenities.display_order"],
      "restricted-amenity-ids": ["room_type_amenities.excluded"],
    },
    metadataFields: [...SYSTEM_FIELDS, "room-type-publication-state"],
    unmappedReason: "Room prose, review copy and bed/suite metadata have no typed D1 column yet; Webflow remains the source. Not inferred from names.",
  },
  {
    sourceCollection: "amenities",
    d1Targets: ["amenities", "amenity_editorial", "content_provenance"],
    fieldTargets: {
      id: ["amenities.id", "amenity_editorial.amenity_id"],
      name: ["amenities.name"],
      "short-name": ["amenity_editorial.short_name", "amenities.name (fallback)"],
      "short-description": ["amenity_editorial.short_description"],
      "long-description": ["amenity_editorial.long_description"],
      active: ["amenity_editorial.active"],
    },
    metadataFields: SYSTEM_FIELDS,
    unmappedReason: "The export has no image-name/image-path columns; icons are admin-authored from checked-in SVGs. Other marketing fields stay in Webflow.",
  },
  {
    sourceCollection: "events",
    d1Targets: ["events", "content_provenance"],
    fieldTargets: {
      id: ["events.id"], name: ["events.title"],
      "short-description": ["events.description"], "long-description": ["events.description (fallback)"],
      "property-location": ["events.location_id"],
      datetime: ["events.starts_at"],
      "recurring-start": ["events.starts_at (fallback)"],
      "datetime-end": ["events.ends_at"],
      "recurrence-type": ["events.recurrence_rule"],
      "repeat-every": ["events.recurrence_rule"],
      "repeat-on": ["events.recurrence_rule"],
      "recurring-end": ["events.recurrence_rule"],
      onsite: ["events.venue"], "onsite-custom-location": ["events.venue"],
      "onsite-event-location": ["events.venue"], "offsite-event": ["events.venue"],
      "offsite-event-location": ["events.venue"],
    },
    metadataFields: SYSTEM_FIELDS,
    unmappedReason: "No dedicated column; not required for the displayed event contract.",
  },
  {
    sourceCollection: "offers",
    d1Targets: ["offers", "rate_merchandising", "content_provenance"],
    fieldTargets: {
      id: ["offers.id", "rate_merchandising.id"],
      name: ["offers.name"], headline: ["offers.headline"],
      description: ["offers.description"], "long-description": ["offers.description (fallback)"],
      "mews-rate-id": ["offers.rate_product_id", "rate_merchandising.rate_product_id"],
      "sort-order": ["rate_merchandising.position"],
      "call-to-action": ["offers.cta_label"],
      active: ["offers.status"], location: ["offers.location_id"],
    },
    metadataFields: SYSTEM_FIELDS,
    unmappedReason: "Rate-card artwork, overlay positions, styling, geo-fencing and cancellation-window fields are editorial presentation or Mews-owned rules; no D1 column yet.",
  },
  {
    sourceCollection: "addOns",
    d1Targets: ["add_ons", "content_provenance"],
    fieldTargets: {
      id: ["add_ons.id"], name: ["add_ons.name"],
      "long-description": ["add_ons.description"],
      "short-description": ["add_ons.description (fallback only)"],
      "mews-product-id": ["add_ons.mews_product_id"],
      "enable-quantity": ["add_ons.quantity_cap"],
      "max-quantity-per-stay": ["add_ons.quantity_cap"],
      sort: ["add_ons.sort_order"],
    },
    metadataFields: SYSTEM_FIELDS,
    unmappedReason: "No dedicated column; Mews owns product identity and price.",
  },
  {
    sourceCollection: "instagrams",
    d1Targets: ["content_items", "content_revisions", "content_provenance"],
    fieldTargets: {},
    metadataFields: SYSTEM_FIELDS,
    allFieldsToPayload: "content_revisions.payload_json (kind=instagram)",
    unmappedReason: "Stored verbatim in the versioned payload; no dedicated table.",
  },
  {
    sourceCollection: "outlets",
    d1Targets: ["content_items", "content_revisions", "content_provenance"],
    fieldTargets: {
      location: ["content_items.location_id"],
    },
    metadataFields: SYSTEM_FIELDS,
    allFieldsToPayload: "content_revisions.payload_json (kind=outlet)",
    unmappedReason: "Stored verbatim in the versioned payload; no dedicated table.",
  },
  {
    sourceCollection: "contentSettings",
    d1Targets: ["content_items", "content_revisions", "content_provenance"],
    fieldTargets: {
      location: ["content_items.location_id"],
    },
    metadataFields: SYSTEM_FIELDS,
    allFieldsToPayload: "content_revisions.payload_json (kind=policy)",
    unmappedReason: "Stored verbatim in the versioned payload; source item is a draft.",
  },
  {
    sourceCollection: "photoHotspots",
    d1Targets: [],
    fieldTargets: {},
    metadataFields: SYSTEM_FIELDS,
    unmappedReason: "Excluded: export has no photo-file-id/photo-url, so there is no stable media ID. W2.4 resolves identity through a source adapter.",
  },
  {
    sourceCollection: "menuItems",
    d1Targets: [],
    fieldTargets: {},
    metadataFields: SYSTEM_FIELDS,
    unmappedReason: "Excluded: source collection is empty.",
  },
];

export function fieldMappingFor(sourceCollection: string): CollectionFieldMapping | undefined {
  return CMS_FIELD_MAPS.find((map) => map.sourceCollection === sourceCollection);
}
