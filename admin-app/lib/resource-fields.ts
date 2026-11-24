/**
 * Pure envelope/field mapping for the read-only D1 admin sections.
 * Kept separate from React so representative worker responses can be tested
 * directly without a browser.
 */
export interface ResourceField {
  key: string;
  label: string;
}

export interface ResourceSectionConfig {
  path: string;
  label: string;
  /** Some endpoints wrap their payload (e.g. policy language). */
  unwrap?: string;
  fields: readonly ResourceField[];
}

export const RESOURCE_SECTIONS: Readonly<Record<string, ResourceSectionConfig>> = {
  media: {
    path: "/api/admin/media",
    label: "media assets",
    fields: [
      { key: "filename", label: "File" },
      { key: "sourceUrl", label: "Source URL" },
      { key: "altText", label: "Alt text" },
      { key: "width", label: "Width" },
      { key: "height", label: "Height" },
      { key: "id", label: "ID" },
    ],
  },
  rates: {
    path: "/api/content/offers",
    label: "rate offers",
    fields: [
      { key: "name", label: "Name" },
      { key: "headline", label: "Headline" },
      { key: "status", label: "Status" },
      { key: "rateProductId", label: "Mews rate" },
      { key: "id", label: "ID" },
    ],
  },
  policies: {
    path: "/api/content/policy-language",
    label: "policy language",
    unwrap: "language",
    fields: [
      { key: "refundableLanguage", label: "Refundable" },
      { key: "refundableLanguageSubTitle", label: "Refundable detail" },
      { key: "partiallyRefundableLanguage", label: "Partially refundable" },
      { key: "partiallyRefundableLanguageSubTitle", label: "Partially refundable detail" },
      { key: "nonRefundableLanguage", label: "Non-refundable" },
      { key: "nonRefundableLanguageSubTitle", label: "Non-refundable detail" },
      { key: "atTimeOfBooking", label: "At booking" },
      { key: "atTimeOfBookingSubTitle", label: "At booking detail" },
      { key: "nextDueDate", label: "Next due" },
      { key: "nextDueDateSubTitle", label: "Next due detail" },
    ],
  },
  "add-ons": {
    path: "/api/d1/add-ons",
    label: "add-ons",
    fields: [
      { key: "name", label: "Name" },
      { key: "description", label: "Description" },
      { key: "status", label: "Status" },
      { key: "mewsProductId", label: "Mews product" },
      { key: "id", label: "ID" },
    ],
  },
  upgrades: {
    path: "/api/content/upgrades",
    label: "upgrades",
    fields: [
      { key: "name", label: "Name" },
      { key: "description", label: "Description" },
      { key: "status", label: "Status" },
      { key: "id", label: "ID" },
    ],
  },
  recovery: {
    path: "/api/recovery",
    label: "recovery records",
    fields: [
      { key: "cart_id", label: "Cart" },
      { key: "cartId", label: "Cart" },
      { key: "status", label: "Status" },
      { key: "created_at", label: "Created" },
      { key: "createdAt", label: "Created" },
      { key: "id", label: "ID" },
    ],
  },
  analytics: {
    path: "/api/analytics/summary",
    label: "analytics",
    fields: [
      { key: "day", label: "Day" },
      { key: "metric", label: "Metric" },
      { key: "value", label: "Value" },
      { key: "tenant_id", label: "Tenant" },
      { key: "tenantId", label: "Tenant" },
    ],
  },
};

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

/** Normalise the endpoint envelopes ({items}, wrapped payload, object) to rows. */
export function recordsFromResponse(value: unknown, config: ResourceSectionConfig): RecordValue[] {
  const payload =
    config.unwrap && isRecord(value) && config.unwrap in value
      ? (value as RecordValue)[config.unwrap]
      : value;
  const source = isRecord(payload) && Array.isArray(payload.items) ? payload.items : payload;
  if (Array.isArray(source)) return source.filter(isRecord);
  return isRecord(source) ? [source] : [];
}

export interface DisplayField {
  label: string;
  value: string;
}

/** Render the fields the endpoint actually returns, not an opaque id. */
export function displayFields(record: RecordValue, config: ResourceSectionConfig): DisplayField[] {
  const result: DisplayField[] = [];
  for (const field of config.fields) {
    const raw =
      record[field.key] ??
      record[camelToSnake(field.key)] ??
      record[snakeToCamel(field.key)];
    if (raw === null || raw === undefined || raw === "") continue;
    const text = typeof raw === "object" ? JSON.stringify(raw) : String(raw);
    result.push({ label: field.label, value: text.length > 240 ? `${text.slice(0, 240)}…` : text });
  }
  return result;
}

export function recordLabel(record: RecordValue, config: ResourceSectionConfig): string {
  const first = displayFields(record, config)[0]?.value;
  if (first) return first;
  if (typeof record.id === "string") return record.id;
  return config.label;
}
