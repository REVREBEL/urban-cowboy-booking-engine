import { mewsJson, propertyDateUtc, type Env, type Property } from "./_lib.ts";

/**
 * Advisories derived from Mews service ApplicableRestrictions.
 * Restrictions are scoped to a category/rate, not necessarily the whole hotel.
 * They never prevent a guest from selecting dates or replace a live search.
 */
import type { RestrictionAdvisory, RestrictionType } from "../../src/types/calendar-restrictions.ts";

interface MewsRestriction {
  Conditions?: {
    Type?: unknown;
    ResourceCategoryId?: unknown;
    ExactRateId?: unknown;
    BaseRateId?: unknown;
    RateGroupId?: unknown;
    StartUtc?: unknown;
    EndUtc?: unknown;
    Days?: unknown;
  };
  Exceptions?: Record<string, unknown>;
}

type ServiceIdentity = { enterpriseId: string; serviceId: string };
const serviceCache = new Map<string, { expires: number; pending: Promise<ServiceIdentity | null> }>();
const SERVICE_CACHE_MS = 30 * 60 * 1000;
const MAX_SERVICE_WINDOW_DAYS = 14;
const TYPES: RestrictionType[] = ["ClosedToArrival", "ClosedToDeparture", "ClosedToStay"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const text = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const dateAfter = (date: string, days: number): string => {
  const next = new Date(`${date}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
};

const durationDays = (value: unknown): number | undefined => {
  if (typeof value !== "string") return undefined;
  // Service durations may include calendar months, which are not fixed nights.
  const matched = /^P(\d+)M(\d+)DT(\d+)H(\d+)M(\d+)S$/.exec(value);
  if (!matched || Number(matched[1]) !== 0) return undefined;
  const days = Number(matched[2]) + Number(matched[3]) / 24 +
    Number(matched[4]) / 1440 + Number(matched[5]) / 86400;
  return Number.isInteger(days) && days > 0 ? days : undefined;
};

function appliesToDate(rule: MewsRestriction, date: string): boolean {
  const conditions = rule.Conditions;
  if (!conditions) return false;
  // Mews timestamps may omit milliseconds while our timezone conversion includes
  // ".000Z". Compare instants, not lexicographically different ISO formats.
  const midnight = Date.parse(propertyDateUtc(date));
  if (typeof conditions.StartUtc === "string") {
    const start = Date.parse(conditions.StartUtc);
    if (!Number.isFinite(start) || midnight < start) return false;
  }
  if (typeof conditions.EndUtc === "string") {
    const end = Date.parse(conditions.EndUtc);
    if (!Number.isFinite(end) || midnight >= end) return false;
  }
  if (Array.isArray(conditions.Days) && conditions.Days.length) {
    const weekday = WEEKDAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];
    if (!conditions.Days.includes(weekday)) return false;
  }
  return true;
}

/** Map arrival, departure, and stay closures to their matching calendar dates. */
export function mapApplicableRestrictions(
  raw: unknown,
  startDate: string,
  endDate: string,
): Record<string, RestrictionAdvisory[]> {
  if (!Array.isArray(raw)) return {};
  const days: Record<string, RestrictionAdvisory[]> = {};

  // Include endDate so a ClosedToDeparture rule on the checkout boundary
  // can be annotated even though that date is not an occupied night.
  for (let date = startDate; date <= endDate; date = dateAfter(date, 1)) {
    for (const item of raw as MewsRestriction[]) {
      const conditions = item?.Conditions;
      const type = conditions?.Type;
      if (!TYPES.includes(type as RestrictionType) || !appliesToDate(item, date)) continue;
      const exceptions = item.Exceptions ?? {};
      const hasOtherExceptions = [
        "MinAdvance", "MaxAdvance", "MinPrice", "MaxPrice",
        "MaxReservationCount",
      ].some((field) => exceptions[field] != null);
      const minLength = durationDays(exceptions.MinLength);
      const maxLength = durationDays(exceptions.MaxLength);
      const advisory: RestrictionAdvisory = {
        type: type as RestrictionType,
        categoryId: text(conditions?.ResourceCategoryId),
        exactRateId: text(conditions?.ExactRateId),
        baseRateId: text(conditions?.BaseRateId),
        rateGroupId: text(conditions?.RateGroupId),
        ...(minLength ? { exceptionMinNights: minLength } : {}),
        ...(maxLength ? { exceptionMaxNights: maxLength } : {}),
        hasOtherExceptions,
      };
      const list = days[date] ?? (days[date] = []);
      if (!list.some((existing) => JSON.stringify(existing) === JSON.stringify(advisory))) {
        list.push(advisory);
      }
    }
  }
  return days;
}

async function configuredService(env: Env, property: Property): Promise<ServiceIdentity | null> {
  const key = `${env.MEWS_BASE_URL}:${property.configId}`;
  const cached = serviceCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.pending;

  const pending = (async (): Promise<ServiceIdentity | null> => {
    const result = await mewsJson<any>(env, "configuration/get", {
      Ids: [property.configId],
      PrimaryId: property.configId,
      LanguageCode: "en-US",
    });
    if (!result.ok) return null;
    const configuration = result.data?.Configurations?.find(
      (c: any) => c.Id === property.configId,
    );
    const serviceId = text(configuration?.ServiceId);
    const enterpriseId = text(configuration?.Enterprise?.Id) ??
      text(configuration?.EnterpriseId);
    if (!serviceId || !enterpriseId) return null;
    const matchingService = result.data?.Services?.find(
      (service: any) => service.Id === serviceId && service.EnterpriseId === enterpriseId &&
        service.IsActive !== false,
    );
    if (!matchingService) return null;
    return { enterpriseId, serviceId };
  })();

  serviceCache.set(key, { expires: Date.now() + SERVICE_CACHE_MS, pending });
  const identity = await pending;
  if (!identity) serviceCache.delete(key);
  return identity;
}

/**
 * Reads real Mews service restrictions in bounded windows. Failure returns null
 * (unknown), not an empty set of restrictions or false "sold out" status.
 */
export async function fetchServiceRestrictionGuidance(
  env: Env,
  property: Property,
  startDate: string,
  endDate: string,
): Promise<Record<string, RestrictionAdvisory[]> | null> {
  const identity = await configuredService(env, property);
  if (!identity) return null;

  const combined: Record<string, RestrictionAdvisory[]> = {};
  for (let cursor = startDate; cursor < endDate;) {
    const end = dateAfter(cursor, MAX_SERVICE_WINDOW_DAYS);
    const windowEnd = end < endDate ? end : endDate;
    const response = await mewsJson<any>(env, "services/getAvailability", {
      EnterpriseId: identity.enterpriseId,
      ServiceId: identity.serviceId,
      StartUtc: propertyDateUtc(cursor),
      EndUtc: propertyDateUtc(windowEnd),
      LanguageCode: "en-US",
    });
    if (!response.ok || !Array.isArray(response.data?.ApplicableRestrictions)) return null;
    const byDate = mapApplicableRestrictions(
      response.data.ApplicableRestrictions, cursor, windowEnd,
    );
    for (const [date, entries] of Object.entries(byDate)) {
      const list = combined[date] ?? (combined[date] = []);
      for (const entry of entries) {
        if (!list.some((prev) => JSON.stringify(prev) === JSON.stringify(entry))) list.push(entry);
      }
    }
    cursor = windowEnd;
  }
  return combined;
}
