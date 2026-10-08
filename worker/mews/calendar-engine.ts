import {
  mewsJson,
  occupancyForProperty,
  propertyByKey,
  propertyDateUtc,
  type Env,
  type Property,
} from "./_lib.ts";

export const CALENDAR_STORAGE_VERSION = "v4";
export const MAX_INFERRED_LOS = 3;
export const CANONICAL_CALENDAR_OCCUPANCY = {
  adults: 2,
  children: 0,
  infants: 0,
} as const;

const ACTIVE_MONTH_TTL_SECONDS = 48 * 60 * 60;
const SNAPSHOT_TTL_SECONDS = 14 * 24 * 60 * 60;
const DAYTIME_REFRESH_MS = 30 * 60 * 1000;
const OVERNIGHT_REFRESH_MS = 60 * 60 * 1000;
const MAX_SCHEDULED_MONTHS_PER_RUN = 4;
const REFRESH_BATCH_SIZE = 8;
const EASTERN_TIME_ZONE = "America/New_York";

export interface CalendarDay {
  amount: number;
  currency: string;
  available: boolean;
  minNights?: number;
  /**
   * Stay lengths which were explicitly tested and found invalid while a longer
   * stay from the same arrival was bookable. This captures stay-through/LOS
   * effects without pretending the arrival date itself has a blanket minimum.
   */
  invalidStayLengths?: number[];
}

interface StoredCalendarDay extends CalendarDay {
  checkedAt: number;
  roomCategoryIds?: string[];
}

interface CalendarMonthSnapshot {
  version: typeof CALENDAR_STORAGE_VERSION;
  propertyConfigId: string;
  currency: string;
  month: string;
  generatedAt: number;
  dates: Record<string, StoredCalendarDay>;
}

export interface CalendarRangeSnapshot {
  dates: Record<string, CalendarDay>;
  hasAny: boolean;
  missing: boolean;
  stale: boolean;
  generatedAt: number | null;
}

interface ProbeEvidence {
  arrival: string;
  nights: number;
  bookable: boolean;
  prices: number[];
  roomCategoryIds: string[];
  explicitMinNights?: number;
}

interface RefreshRequest {
  propertyKey?: string;
  currency?: string;
  startDate: string;
  endDate: string;
}

interface RefreshCoordinator {
  pendingStartDate: string | null;
  pendingEndDate: string | null;
  propertyKey: string;
  currency: string;
  promise: Promise<void>;
}

const monthMemory = new Map<string, CalendarMonthSnapshot>();
const activeMonthMemory = new Map<string, number>();
const refreshCoordinators = new Map<string, RefreshCoordinator>();

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const addCalendarDays = (date: string, days: number) => {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};

const dateDistance = (start: string, end: string) =>
  Math.round(
    (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
      86_400_000,
  );

const easternParts = (timestamp = Date.now()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EASTERN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    hour: Number(value("hour")),
    minute: Number(value("minute")),
  };
};

const monthId = (date: string) => date.slice(0, 7);

const monthBounds = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const startDate = `${year}-${String(monthNumber).padStart(2, "0")}-01`;
  const next = new Date(Date.UTC(year, monthNumber, 1));
  return {
    startDate,
    endDate: next.toISOString().slice(0, 10),
  };
};

const monthsInRange = (startDate: string, endDate: string) => {
  const months: string[] = [];
  let cursor = `${startDate.slice(0, 7)}-01`;
  while (cursor < endDate) {
    months.push(monthId(cursor));
    const [year, month] = cursor.split("-").map(Number);
    cursor = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
  }
  return months;
};

const datesInRange = (startDate: string, endDate: string) => {
  const out: string[] = [];
  for (let date = startDate; date < endDate; date = addCalendarDays(date, 1)) {
    out.push(date);
  }
  return out;
};

const snapshotKey = (property: Property, currency: string, month: string) =>
  `calendar:${CALENDAR_STORAGE_VERSION}:${property.configId}:${currency}:${month}`;

const activeKeyPrefix = (property: Property, currency: string) =>
  `calendar-active:${CALENDAR_STORAGE_VERSION}:${property.configId}:${currency}:`;

const activeKey = (property: Property, currency: string, month: string) =>
  `${activeKeyPrefix(property, currency)}${month}`;

const cacheRequest = (key: string) =>
  new Request(`https://calendar-cache.internal/${encodeURIComponent(key)}`);

async function readMonth(
  env: Env,
  property: Property,
  currency: string,
  month: string,
): Promise<CalendarMonthSnapshot | null> {
  const key = snapshotKey(property, currency, month);

  if (env.CALENDAR_CACHE) {
    const stored = await env.CALENDAR_CACHE.get<CalendarMonthSnapshot>(key, "json");
    if (stored?.version === CALENDAR_STORAGE_VERSION) return stored;
    return null;
  }

  const memory = monthMemory.get(key);
  if (memory) return memory;

  const cached = await caches.default.match(cacheRequest(key));
  if (!cached) return null;
  const stored = (await cached.json()) as CalendarMonthSnapshot;
  if (stored?.version !== CALENDAR_STORAGE_VERSION) return null;
  monthMemory.set(key, stored);
  return stored;
}

async function writeMonth(
  env: Env,
  property: Property,
  currency: string,
  snapshot: CalendarMonthSnapshot,
): Promise<void> {
  const key = snapshotKey(property, currency, snapshot.month);
  monthMemory.set(key, snapshot);

  if (env.CALENDAR_CACHE) {
    await env.CALENDAR_CACHE.put(key, JSON.stringify(snapshot), {
      expirationTtl: SNAPSHOT_TTL_SECONDS,
    });
    return;
  }

  await caches.default.put(
    cacheRequest(key),
    new Response(JSON.stringify(snapshot), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${SNAPSHOT_TTL_SECONDS}`,
      },
    }),
  );
}

export async function markCalendarRangeActive(
  env: Env,
  property: Property,
  currency: string,
  startDate: string,
  endDate: string,
): Promise<void> {
  const now = Date.now();
  const months = monthsInRange(startDate, endDate);

  await Promise.all(
    months.map(async (month) => {
      activeMonthMemory.set(activeKey(property, currency, month), now);
      if (!env.CALENDAR_CACHE) return;
      await env.CALENDAR_CACHE.put(
        activeKey(property, currency, month),
        String(now),
        { expirationTtl: ACTIVE_MONTH_TTL_SECONDS },
      );
    }),
  );
}

async function listActiveMonths(
  env: Env,
  property: Property,
  currency: string,
): Promise<string[]> {
  const prefix = activeKeyPrefix(property, currency);
  const memoryMonths = [...activeMonthMemory.entries()]
    .filter(([key, timestamp]) => key.startsWith(prefix) && timestamp + ACTIVE_MONTH_TTL_SECONDS * 1000 > Date.now())
    .map(([key]) => key.slice(prefix.length));

  if (!env.CALENDAR_CACHE) return [...new Set(memoryMonths)].sort();

  const remote = await env.CALENDAR_CACHE.list({ prefix });
  return [
    ...new Set([
      ...memoryMonths,
      ...remote.keys.map((key) => key.name.slice(prefix.length)),
    ]),
  ].sort();
}

export function calendarFreshnessMs(date: string, timestamp = Date.now()): number {
  const eastern = easternParts(timestamp);
  const distance = dateDistance(eastern.date, date);
  const overnight = eastern.hour >= 20 || eastern.hour < 7;

  if (distance <= 30) return overnight ? OVERNIGHT_REFRESH_MS : DAYTIME_REFRESH_MS;
  if (distance <= 90) return 60 * 60 * 1000;
  if (distance <= 180) return 4 * 60 * 60 * 1000;
  return 12 * 60 * 60 * 1000;
}

function isStoredDayStale(date: string, day: StoredCalendarDay | undefined, timestamp = Date.now()) {
  if (!day) return true;
  return day.checkedAt + calendarFreshnessMs(date, timestamp) <= timestamp;
}

function publicCalendarDay(day: StoredCalendarDay): CalendarDay {
  return {
    amount: day.amount,
    currency: day.currency,
    available: day.available,
    ...(day.minNights ? { minNights: day.minNights } : {}),
    ...(day.invalidStayLengths?.length
      ? { invalidStayLengths: [...day.invalidStayLengths] }
      : {}),
  };
}

export async function readCalendarRange(
  env: Env,
  request: RefreshRequest,
): Promise<CalendarRangeSnapshot> {
  const property = propertyByKey(env, request.propertyKey ?? "hotel");
  if (!property) {
    return { dates: {}, hasAny: false, missing: true, stale: true, generatedAt: null };
  }

  const currency = request.currency ?? "USD";
  const today = easternParts().date;
  const months = monthsInRange(request.startDate, request.endDate);
  const snapshots = await Promise.all(
    months.map((month) => readMonth(env, property, currency, month)),
  );

  const byMonth = new Map(
    months.map((month, index) => [month, snapshots[index]] as const),
  );
  const dates: Record<string, CalendarDay> = {};
  let missing = false;
  let stale = false;
  let generatedAt: number | null = null;

  for (const date of datesInRange(request.startDate, request.endDate)) {
    // Past dates are disabled in the UI and deliberately never consume Mews calls.
    if (date < today) continue;

    const snapshot = byMonth.get(monthId(date));
    const stored = snapshot?.dates[date];
    if (!stored) {
      missing = true;
      continue;
    }

    dates[date] = publicCalendarDay(stored);
    stale ||= isStoredDayStale(date, stored);
    generatedAt =
      generatedAt == null
        ? stored.checkedAt
        : Math.min(generatedAt, stored.checkedAt);
  }

  return {
    dates,
    hasAny: Object.keys(dates).length > 0,
    missing,
    stale,
    generatedAt,
  };
}

function numericMinimums(value: unknown, depth = 0): number[] {
  if (depth > 5 || value == null) return [];
  if (Array.isArray(value)) return value.flatMap((item) => numericMinimums(item, depth + 1));
  if (typeof value !== "object") return [];

  const record = value as Record<string, unknown>;
  const minimumKeys = new Set([
    "MinimumTimeUnits",
    "MinimumNights",
    "MinNights",
    "MinimumLengthOfStay",
  ]);
  const direct = Object.entries(record)
    .filter(([key]) => minimumKeys.has(key))
    .map(([, item]) => (typeof item === "number" ? item : Number(item)))
    .filter((item) => Number.isFinite(item) && item > 1);

  return [
    ...direct,
    ...Object.values(record).flatMap((item) => numericMinimums(item, depth + 1)),
  ];
}

const restrictionMinimum = (restrictions: unknown): number | undefined => {
  const values = numericMinimums(restrictions);
  return values.length ? Math.min(...values) : undefined;
};

const availabilityDetails = (data: any, currency: string) => {
  const prices: number[] = [];
  const roomCategoryIds: string[] = [];

  for (const category of data?.RoomCategoryAvailabilities ?? []) {
    let categoryBookable = false;
    for (const availability of category?.RoomOccupancyAvailabilities ?? []) {
      for (const pricing of availability?.Pricing ?? []) {
        const value =
          pricing?.Price?.TotalAmount?.[currency]?.NetValue ??
          pricing?.Price?.Total?.[currency];
        if (typeof value === "number" && Number.isFinite(value)) {
          prices.push(value);
          categoryBookable = true;
        }
      }
    }
    if (categoryBookable && typeof category?.RoomCategoryId === "string") {
      roomCategoryIds.push(category.RoomCategoryId);
    }
  }

  return {
    prices,
    roomCategoryIds: [...new Set(roomCategoryIds)],
  };
};

class EvidenceLedger {
  private readonly evidence = new Map<string, Promise<ProbeEvidence>>();
  private readonly env: Env;
  private readonly property: Property;
  private readonly currency: string;

  constructor(env: Env, property: Property, currency: string) {
    this.env = env;
    this.property = property;
    this.currency = currency;
  }

  probe(arrival: string, nights: number): Promise<ProbeEvidence> {
    const key = `${arrival}:${nights}`;
    const existing = this.evidence.get(key);
    if (existing) return existing;

    const pending = this.fetchProbe(arrival, nights);
    this.evidence.set(key, pending);
    return pending;
  }

  private async fetchProbe(arrival: string, nights: number): Promise<ProbeEvidence> {
    const result = await mewsJson<any>(this.env, "hotels/getAvailability", {
      ConfigurationId: this.property.configId,
      HotelId: this.env.MEWS_HOTEL_ID,
      StartUtc: propertyDateUtc(arrival),
      EndUtc: propertyDateUtc(addCalendarDays(arrival, nights)),
      CurrencyCode: this.currency,
      LanguageCode: "en-US",
      OccupancyData: occupancyForProperty(
        this.property,
        CANONICAL_CALENDAR_OCCUPANCY.adults,
        CANONICAL_CALENDAR_OCCUPANCY.children,
        CANONICAL_CALENDAR_OCCUPANCY.infants,
      ),
    });
    if (!result.ok) throw new Error(`mews_calendar_${result.status}`);

    const details = availabilityDetails(result.data, this.currency);
    return {
      arrival,
      nights,
      bookable: details.prices.length > 0,
      prices: details.prices,
      roomCategoryIds: details.roomCategoryIds,
      explicitMinNights: restrictionMinimum(result.data?.ViolatedRestrictions),
    };
  }
}

async function resolveExplicitMinimum(
  ledger: EvidenceLedger,
  arrival: string,
  minimum: number,
): Promise<{ minNights: number; confirmation: ProbeEvidence | null }> {
  // An explicit restriction has already answered "why did this fail?". One exact
  // probe at the required LOS answers the only remaining question: is inventory
  // actually bookable when the restriction is satisfied?
  let required = Math.max(2, Math.trunc(minimum));

  for (let attempts = 0; attempts < 3; attempts += 1) {
    const confirmation = await ledger.probe(arrival, required);
    if (confirmation.bookable) return { minNights: required, confirmation };

    if (
      confirmation.explicitMinNights &&
      confirmation.explicitMinNights > required
    ) {
      required = Math.trunc(confirmation.explicitMinNights);
      continue;
    }

    return { minNights: required, confirmation: null };
  }

  return { minNights: required, confirmation: null };
}

async function resolveArrival(
  ledger: EvidenceLedger,
  date: string,
): Promise<StoredCalendarDay> {
  const checkedAt = Date.now();
  const oneNight = await ledger.probe(date, 1);

  if (oneNight.bookable) {
    return {
      amount: Math.min(...oneNight.prices),
      currency: "USD",
      available: true,
      checkedAt,
      roomCategoryIds: oneNight.roomCategoryIds,
    };
  }

  if (oneNight.explicitMinNights && oneNight.explicitMinNights > 1) {
    const resolved = await resolveExplicitMinimum(
      ledger,
      date,
      oneNight.explicitMinNights,
    );
    return {
      amount: 0,
      currency: "USD",
      available: Boolean(resolved.confirmation),
      minNights: resolved.minNights,
      checkedAt,
      roomCategoryIds: resolved.confirmation?.roomCategoryIds ?? [],
    };
  }

  // Ambiguous one-night failure. Probe sequentially and stop the instant a
  // response answers the question. This intentionally replaces the old parallel
  // 2-night + 3-night shotgun request.
  for (let nights = 2; nights <= MAX_INFERRED_LOS; nights += 1) {
    const evidence = await ledger.probe(date, nights);

    if (evidence.bookable) {
      return {
        amount: 0,
        currency: "USD",
        available: true,
        minNights: nights,
        checkedAt,
        roomCategoryIds: evidence.roomCategoryIds,
      };
    }

    if (evidence.explicitMinNights && evidence.explicitMinNights > nights) {
      const resolved = await resolveExplicitMinimum(
        ledger,
        date,
        evidence.explicitMinNights,
      );
      return {
        amount: 0,
        currency: "USD",
        available: Boolean(resolved.confirmation),
        minNights: resolved.minNights,
        checkedAt,
        roomCategoryIds: resolved.confirmation?.roomCategoryIds ?? [],
      };
    }
  }

  return {
    amount: 0,
    currency: "USD",
    available: false,
    checkedAt,
    roomCategoryIds: [],
  };
}

async function addCrossDateEvidence(
  ledger: EvidenceLedger,
  dates: Record<string, StoredCalendarDay>,
  startDate: string,
  endDate: string,
): Promise<void> {
  // A stay-through restriction can make an intermediate LOS invalid even when a
  // one-night stay from the previous arrival is valid. We only probe when a
  // discovered minimum can reveal new information. For Min 2 there is no shorter
  // stay from the prior day that both includes the restricted night and remains
  // below the minimum, so no extra call is useful.
  const restrictedDates = Object.entries(dates).filter(
    ([, day]) => day.available && (day.minNights ?? 0) >= 3,
  );

  for (const [restrictedDate, day] of restrictedDates) {
    const minimum = day.minNights!;
    const priorArrival = addCalendarDays(restrictedDate, -1);
    if (priorArrival < startDate || priorArrival >= endDate || !dates[priorArrival]) continue;

    const maxCandidate = Math.min(minimum - 1, MAX_INFERRED_LOS);
    for (let nights = 2; nights <= maxCandidate; nights += 1) {
      const evidence = await ledger.probe(priorArrival, nights);
      if (evidence.bookable) continue;

      let provenLosConflict =
        Boolean(evidence.explicitMinNights && evidence.explicitMinNights > nights);

      if (!provenLosConflict) {
        const longer = await ledger.probe(priorArrival, nights + 1);
        provenLosConflict = longer.bookable;
      }

      if (provenLosConflict) {
        const invalid = new Set(dates[priorArrival].invalidStayLengths ?? []);
        invalid.add(nights);
        dates[priorArrival].invalidStayLengths = [...invalid].sort((a, b) => a - b);
      }
    }
  }
}

async function resolveRange(
  env: Env,
  property: Property,
  currency: string,
  startDate: string,
  endDate: string,
): Promise<Record<string, StoredCalendarDay>> {
  const today = easternParts().date;
  const requestedDates = datesInRange(startDate, endDate).filter((date) => date >= today);
  const ledger = new EvidenceLedger(env, property, currency);
  const resolved: Record<string, StoredCalendarDay> = {};

  for (let offset = 0; offset < requestedDates.length; offset += REFRESH_BATCH_SIZE) {
    const batch = requestedDates.slice(offset, offset + REFRESH_BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (date) => [date, await resolveArrival(ledger, date)] as const),
    );
    Object.assign(resolved, Object.fromEntries(results));
  }

  await addCrossDateEvidence(ledger, resolved, startDate, endDate);

  // resolveArrival uses USD as a placeholder while building each day. Normalize
  // once here so alternate property currencies remain correct.
  for (const day of Object.values(resolved)) day.currency = currency;

  return resolved;
}

async function mergeRangeIntoMonths(
  env: Env,
  property: Property,
  currency: string,
  dates: Record<string, StoredCalendarDay>,
): Promise<void> {
  const grouped = new Map<string, Record<string, StoredCalendarDay>>();
  for (const [date, value] of Object.entries(dates)) {
    const month = monthId(date);
    const group = grouped.get(month) ?? {};
    group[date] = value;
    grouped.set(month, group);
  }

  await Promise.all(
    [...grouped.entries()].map(async ([month, values]) => {
      const existing = await readMonth(env, property, currency, month);
      await writeMonth(env, property, currency, {
        version: CALENDAR_STORAGE_VERSION,
        propertyConfigId: property.configId,
        currency,
        month,
        generatedAt: Date.now(),
        dates: {
          ...(existing?.dates ?? {}),
          ...values,
        },
      });
    }),
  );
}

export async function refreshCalendarRange(
  env: Env,
  request: RefreshRequest,
): Promise<void> {
  if (!DATE.test(request.startDate) || !DATE.test(request.endDate) || request.endDate <= request.startDate) {
    return;
  }

  const property = propertyByKey(env, request.propertyKey ?? "hotel");
  if (!property) return;
  const currency = request.currency ?? "USD";

  const resolved = await resolveRange(
    env,
    property,
    currency,
    request.startDate,
    request.endDate,
  );
  await mergeRangeIntoMonths(env, property, currency, resolved);
}

const minDate = (a: string, b: string) => (a < b ? a : b);
const maxDate = (a: string, b: string) => (a > b ? a : b);

export function queueCalendarRefresh(
  env: Env,
  request: RefreshRequest,
): Promise<void> {
  const property = propertyByKey(env, request.propertyKey ?? "hotel");
  if (!property) return Promise.resolve();
  const currency = request.currency ?? "USD";
  const coordinatorKey = `${property.configId}:${currency}`;

  const existing = refreshCoordinators.get(coordinatorKey);
  if (existing) {
    existing.pendingStartDate = existing.pendingStartDate
      ? minDate(existing.pendingStartDate, request.startDate)
      : request.startDate;
    existing.pendingEndDate = existing.pendingEndDate
      ? maxDate(existing.pendingEndDate, request.endDate)
      : request.endDate;
    return existing.promise;
  }

  const state = {} as RefreshCoordinator;
  state.pendingStartDate = request.startDate;
  state.pendingEndDate = request.endDate;
  state.propertyKey = property.key;
  state.currency = currency;

  state.promise = (async () => {
    // Briefly coalesce bursts of reservations/calendar requests in the same isolate.
    await new Promise((resolve) => setTimeout(resolve, 200));

    while (state.pendingStartDate && state.pendingEndDate) {
      const startDate = state.pendingStartDate;
      const endDate = state.pendingEndDate;
      state.pendingStartDate = null;
      state.pendingEndDate = null;

      await refreshCalendarRange(env, {
        propertyKey: state.propertyKey,
        currency: state.currency,
        startDate,
        endDate,
      });
    }
  })().finally(() => {
    refreshCoordinators.delete(coordinatorKey);
  });

  refreshCoordinators.set(coordinatorKey, state);
  return state.promise;
}

export function reservationRefreshRange(startDate: string, endDate: string) {
  const shoulder = MAX_INFERRED_LOS - 1;
  return {
    startDate: addCalendarDays(startDate, -shoulder),
    endDate: addCalendarDays(endDate, shoulder),
  };
}

export async function refreshCalendarAfterReservation(
  env: Env,
  request: {
    propertyKey?: string;
    currency?: string;
    startDate: string;
    endDate: string;
  },
): Promise<void> {
  const property = propertyByKey(env, request.propertyKey ?? "hotel");
  if (!property) return;

  const currency = request.currency ?? "USD";
  const range = reservationRefreshRange(request.startDate, request.endDate);

  // A booking is itself strong evidence that this period is commercially active.
  // Keep the affected months in the scheduled-refresh hot set for the next 48 hours.
  await markCalendarRangeActive(
    env,
    property,
    currency,
    range.startDate,
    range.endDate,
  );

  await queueCalendarRefresh(env, {
    propertyKey: property.key,
    currency,
    ...range,
  });
}

async function monthNeedsRefresh(
  env: Env,
  property: Property,
  currency: string,
  month: string,
  timestamp: number,
) {
  const snapshot = await readMonth(env, property, currency, month);
  if (!snapshot) return true;

  const today = easternParts(timestamp).date;
  const bounds = monthBounds(month);
  const startDate = maxDate(bounds.startDate, today);
  if (startDate >= bounds.endDate) return false;

  const expectedDates = datesInRange(startDate, bounds.endDate);
  return expectedDates.some((date) =>
    isStoredDayStale(date, snapshot.dates[date], timestamp),
  );
}

export async function runScheduledCalendarRefresh(
  env: Env,
  timestamp = Date.now(),
): Promise<void> {
  // Scheduled warming is only worthwhile with the shared KV binding. Without it,
  // a cron would warm one edge cache while still spending Booking Engine API calls.
  if (!env.CALENDAR_CACHE) return;

  const property = propertyByKey(env, "hotel");
  if (!property) return;

  const eastern = easternParts(timestamp);
  const overnight = eastern.hour >= 20 || eastern.hour < 7;

  // The Worker cron ticks every 15 minutes. During the 8 PM–7 AM revenue-management
  // quiet window, only the top-of-hour tick is allowed to touch Mews. During the
  // day, near-term active calendars are refreshed at most every 30 minutes.
  if (overnight && eastern.minute !== 0) return;
  if (!overnight && eastern.minute % 30 !== 0) return;

  const currency = "USD";
  const active = new Set(await listActiveMonths(env, property, currency));

  // Daily safety seed: preserve an instant current/next-month snapshot even when
  // traffic has been quiet and the active-month marker has expired.
  if ((eastern.hour === 7 || eastern.hour === 20) && eastern.minute === 0) {
    active.add(monthId(eastern.date));
    active.add(monthId(addCalendarDays(`${monthId(eastern.date)}-01`, 35)));
  }

  const ordered = [...active]
    .filter((month) => /^\d{4}-\d{2}$/.test(month))
    .sort((a, b) => Math.abs(dateDistance(eastern.date, `${a}-01`)) - Math.abs(dateDistance(eastern.date, `${b}-01`)))
    .slice(0, MAX_SCHEDULED_MONTHS_PER_RUN);

  for (const month of ordered) {
    if (!(await monthNeedsRefresh(env, property, currency, month, timestamp))) continue;
    const bounds = monthBounds(month);
    const startDate = maxDate(bounds.startDate, eastern.date);
    if (startDate >= bounds.endDate) continue;

    await refreshCalendarRange(env, {
      propertyKey: property.key,
      currency,
      startDate,
      endDate: bounds.endDate,
    });
  }
}
