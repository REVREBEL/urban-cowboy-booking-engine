// COW-105 (W3.3) — Mews is the sole live ARI / quote / reservation / payment
// authority. These tests prove that every authoritative handler egresses to the
// Mews distributor API, never reads D1, and that the D1/content layers and the
// advisory calendar cache cannot silently become an ARI source.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { register } from "node:module";
import test from "node:test";
import type { Env } from "../worker/mews/_lib.ts";

// The Mews handler modules use extensionless relative imports (e.g. "./_lib"),
// which Node's ESM resolver does not accept on its own. Register a resolve hook
// that retries relative specifiers with a .ts suffix so the real handlers can be
// imported and invoked without modifying production source. The loader is a data
// URL so this test file stays self-contained (no extra repo files).
const resolveTsLoader = `
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (err && /^\\.{1,2}\\//.test(specifier) &&
        (err.code === "ERR_MODULE_NOT_FOUND" || err.code === "ERR_UNSUPPORTED_DIR_IMPORT")) {
      return nextResolve(specifier + ".ts", context);
    }
    throw err;
  }
}
`;
register(`data:text/javascript,${encodeURIComponent(resolveTsLoader)}`);

const [
  { onRequestGet: hotelGet },
  { onRequestPost: availability },
  { onRequestPost: pricing },
  { onRequestPost: reservationPrice },
  { onRequestPost: reservation },
  { onRequestPost: reservationStatus },
  { onRequestPost: paymentLink },
  { onRequestPost: voucher },
] = await Promise.all([
  import("../worker/mews/hotel.ts"),
  import("../worker/mews/availability.ts"),
  import("../worker/mews/pricing.ts"),
  import("../worker/mews/reservation-price.ts"),
  import("../worker/mews/reservation.ts"),
  import("../worker/mews/reservation-status.ts"),
  import("../worker/mews/payment-link.ts"),
  import("../worker/mews/voucher.ts"),
]);

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const MEWS_BASE = "https://mews.test";
const expectedUrl = (op: string) => `${MEWS_BASE}/api/distributor/v1/${op}`;
const START = "2026-12-01T00:00:00Z";
const END = "2026-12-03T00:00:00Z";
const originalFetch = globalThis.fetch;

type HandlerCtx = {
  request: Request;
  env: Env;
  waitUntil: (promise: Promise<unknown>) => void;
};
type Handler = (ctx: HandlerCtx) => Promise<Response>;
const invoke = (fn: unknown, ctx: HandlerCtx): Promise<Response> => (fn as Handler)(ctx);

interface RecordedCall {
  url: string;
  method: string;
  body: Record<string, unknown>;
}
let calls: RecordedCall[] = [];

/** Capture every fetch and return a realistic, handler-specific Mews body. */
function stubMews(responseFor: (url: string) => unknown = () => ({})): void {
  calls = [];
  globalThis.fetch = (async (input: unknown, init?: RequestInit) => {
    const url = String(input);
    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(String(init?.body ?? "")) as Record<string, unknown>;
    } catch {
      // A non-JSON body is fine here; the egress assertions inspect only the URL.
    }
    calls.push({ url, method: init?.method ?? "GET", body });
    return new Response(JSON.stringify(responseFor(url)), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
}

function mewsEnv(): Env {
  return {
    MEWS_BASE_URL: MEWS_BASE,
    MEWS_APP_BASE_URL: "https://pay.mews.test",
    MEWS_CLIENT: "unit-test-client",
    MEWS_HOTEL_ID: "hotel-1",
    MEWS_CONFIG_ID: "config-1",
    MEWS_ADULT_AGE_CATEGORY_ID: "adult-cat",
    MEWS_CHILD_AGE_CATEGORY_ID: "child-cat",
  } as Env;
}

function post(path: string, body: Record<string, unknown>): Request {
  return new Request(`https://worker.test${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

interface Case {
  name: string;
  op: string;
  handler: unknown;
  makeRequest: () => Request;
  response: unknown;
  /** Distinctive top-level keys that must appear in the Mews request body. */
  bodyHas: string[];
}

const CASES: Case[] = [
  {
    name: "hotel config",
    op: "configuration/get",
    handler: hotelGet,
    makeRequest: () => new Request("https://worker.test/api/mews/hotel?lang=en"),
    response: { Configurations: [] },
    bodyHas: ["Client", "Ids", "PrimaryId", "LanguageCode"],
  },
  {
    name: "availability",
    op: "hotels/getAvailability",
    handler: availability,
    makeRequest: () => post("/api/mews/availability", {
      startUtc: START,
      endUtc: END,
      adults: 2,
      properties: ["hotel"],
    }),
    response: {
      RoomCategoryAvailabilities: [],
      Rates: [],
      RateGroups: [],
      ViolatedRestrictions: [],
    },
    bodyHas: ["ConfigurationId", "HotelId", "StartUtc", "EndUtc", "OccupancyData"],
  },
  {
    name: "pricing",
    op: "reservations/getPricing",
    handler: pricing,
    makeRequest: () => post("/api/mews/pricing", {
      startUtc: START,
      endUtc: END,
      roomCategoryId: "rc-1",
      adults: 2,
    }),
    response: { OccupancyPrices: [] },
    bodyHas: ["HotelId", "RoomCategoryId", "Occupancies"],
  },
  {
    name: "reservation price",
    op: "reservations/price",
    handler: reservationPrice,
    makeRequest: () => post("/api/mews/reservation-price", {
      startUtc: START,
      endUtc: END,
      roomCategoryId: "rc-1",
      rateId: "rate-1",
      adults: 2,
      property: "hotel",
    }),
    response: {
      ReservationPrice: [{
        TotalAmount: { Currency: "EUR", GrossValue: 100, NetValue: 80 },
        AmountToChargeOnConfirmation: { Currency: "EUR", GrossValue: 20, NetValue: 16 },
        ProductOrderPrices: [],
      }],
    },
    bodyHas: ["ConfigurationId", "CurrencyCode", "Reservations"],
  },
  {
    name: "reservation create",
    op: "reservationGroups/create",
    handler: reservation,
    makeRequest: () => post("/api/mews/reservation", {
      customer: { email: "guest@example.com", firstName: "Ada", lastName: "Lovelace" },
      property: "hotel",
      reservations: [{ roomCategoryId: "rc-1", rateId: "rate-1", startUtc: START, endUtc: END, adults: 2 }],
    }),
    response: { Id: "rg-1", CustomerId: "cust-1", Reservations: [{ Id: "r-1" }] },
    bodyHas: ["ConfigurationId", "HotelId", "Customer", "Reservations"],
  },
  {
    name: "reservation status",
    op: "reservationGroups/get",
    handler: reservationStatus,
    makeRequest: () => post("/api/mews/reservation-status", { reservationGroupId: "rg-1" }),
    response: { Id: "rg-1", PaymentRequests: [], Payments: [], Reservations: [] },
    bodyHas: ["HotelId", "ReservationGroupId", "Extent"],
  },
  {
    name: "payment link",
    op: "reservationGroups/get",
    handler: paymentLink,
    makeRequest: () => post("/api/mews/payment-link", {
      reservationGroupId: "rg-1",
      returnUrl: "https://guest.example/confirm",
    }),
    response: { Id: "rg-1", PaymentRequests: [], Payments: [] },
    bodyHas: ["HotelId", "ReservationGroupId", "Extent"],
  },
  {
    name: "voucher",
    op: "vouchers/validate",
    handler: voucher,
    makeRequest: () => post("/api/mews/voucher", { voucherCode: "SAVE10" }),
    response: { Valid: true },
    bodyHas: ["HotelId", "VoucherCode"],
  },
];

test.after(() => {
  globalThis.fetch = originalFetch;
});

test("each authoritative handler POSTs to its exact Mews distributor operation", async () => {
  for (const c of CASES) {
    stubMews(() => c.response);
    const response = await invoke(c.handler, {
      request: c.makeRequest(),
      env: mewsEnv(),
      waitUntil: () => undefined,
    });
    assert.equal(response.status, 200, `${c.name}: expected a successful handler response`);

    const mewsCalls = calls.filter((call) => call.url.includes("/api/distributor/v1/"));
    assert.equal(mewsCalls.length, 1, `${c.name}: expected exactly one Mews egress call`);
    const call = mewsCalls[0];
    assert.equal(call.url, expectedUrl(c.op), c.name);
    assert.equal(call.method, "POST", `${c.name}: Mews egress must be POST`);
    for (const key of c.bodyHas) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(call.body, key),
        `${c.name}: Mews request body is missing ${key}`,
      );
    }
  }
});

test("no authoritative handler reads D1 (env.DB throws on access)", async () => {
  for (const c of CASES) {
    const env = mewsEnv();
    Object.defineProperty(env, "DB", {
      enumerable: true,
      get() {
        throw new Error(`${c.name}: ARI handler accessed env.DB`);
      },
    });
    stubMews(() => c.response);
    const response = await invoke(c.handler, {
      request: c.makeRequest(),
      env,
      waitUntil: () => undefined,
    });
    assert.equal(response.status, 200, `${c.name}: handler must complete without touching D1`);
  }
});

test("Mews handlers and D1/content layers keep the authority boundary in source", () => {
  const mewsDir = new URL("worker/mews/", root);
  // The calendar engine and the calendar handler own the advisory snapshot and
  // are verified separately below.
  const mewsFiles = readdirSync(mewsDir).filter(
    (file) => file.endsWith(".ts") && !/^calendar(-engine)?\.ts$/.test(file),
  );
  assert.ok(mewsFiles.length >= 10, "expected the full Mews handler module set");

  const runtimeDbAccess =
    /\benv\s*\??\.\s*DB\b|\benv\s*\[\s*["']DB["']\s*\]|\bgetDb\s*\(|\bDB\s*\.\s*prepare\s*\(/;
  for (const file of mewsFiles) {
    const src = read(`worker/mews/${file}`);
    assert.ok(!runtimeDbAccess.test(src), `${file} references a D1 binding at runtime`);
  }
  // The D1Database type belongs only to the shared Env contract, never a handler.
  const d1TypeFiles = mewsFiles.filter((file) => /\bD1Database\b/.test(read(`worker/mews/${file}`)));
  assert.deepEqual(
    d1TypeFiles,
    ["_lib.ts"],
    "D1Database may be declared only in the shared Env interface, not imported by a handler",
  );

  // D1/content layers must not embed Mews ARI operation strings.
  const ariOps = ["hotels/getAvailability", "reservations/price", "reservationGroups/create"];
  for (const path of ["worker/content-adapters.ts", "worker/content-provider.ts", "worker/d1.ts"]) {
    const src = read(path);
    for (const op of ariOps) {
      assert.ok(!src.includes(op), `${path} contains the Mews ARI operation ${op}`);
    }
  }

  // No D1 table models ARI. Match only CREATE TABLE declarations, not comments.
  const ariTable = /availability|inventor(y|ies)|restriction|pric(e|ing)|quote|reservation|booking/i;
  const migrations = readdirSync(new URL("migrations/", root)).filter((file) => file.endsWith(".sql"));
  assert.ok(migrations.length > 0, "expected migration files to scan");
  for (const file of migrations) {
    const src = read(`migrations/${file}`);
    for (const match of src.matchAll(
      /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["'`]?([A-Za-z0-9_]+)["'`]?\s*\(/gi,
    )) {
      const table = match[1];
      assert.ok(!ariTable.test(table), `D1 table "${table}" in ${file} has ARI semantics`);
    }
  }
});

test("D1 contracts expose only an explicit allowlist of Mews reference fields", () => {
  // The six stable cross-references permitted in D1. Mews stays authoritative;
  // these never resolve to price or availability.
  const allowedReferenceFields = [
    "locations.mews_hotel_id",
    "room_types.mews_room_category_id",
    "add_ons.mews_product_id",
    "offers.rate_product_id",
    "rate_merchandising.rate_product_id",
    "media_aliases.alias_type='mews_asset_id'",
  ];
  // Column names (snake_case + their camelCase transforms) plus the two enum
  // values that legitimately mention Mews: media alias type and provenance source.
  const allowedTokens = new Set(
    [
      "mews_hotel_id", "mewsHotelId",
      "mews_room_category_id", "mewsRoomCategoryId",
      "mews_product_id", "mewsProductId",
      "rate_product_id", "rateProductId",
      "mews_asset_id", "mews",
      // W2 selective reference-sync contract (COW-100): stable IDs plus
      // provenance only. Verified below to exclude ARI reference types.
      "mewsReferenceTypeSchema", "mewsReferenceType",
      "mewsReferenceSyncRowSchema", "mewsReferenceSyncContract",
    ].map((token) => token.toLowerCase()),
  );

  const src = read("src/types/d1-contracts.ts");
  const tokens = new Set(
    [...src.matchAll(/[A-Za-z0-9_]*mews[A-Za-z0-9_]*/gi)].map((match) => match[0].toLowerCase()),
  );
  const unexpected = [...tokens].filter((token) => !allowedTokens.has(token));
  assert.deepEqual(
    unexpected,
    [],
    `Unexpected Mews-named field(s) in d1-contracts.ts: ${unexpected.join(", ")}. ` +
      `Permitted references: ${allowedReferenceFields.join(", ")}`,
  );

  // The W2 reference-sync allowlist may hold IDs and provenance only. Its type
  // enum must never include availability, inventory, restriction or live rate.
  const referenceEnum = /mewsReferenceTypeSchema\s*=\s*z\.enum\(\[([\s\S]*?)\]\)/.exec(src);
  assert.ok(referenceEnum, "mewsReferenceTypeSchema enum must exist");
  const referenceTypes = [...referenceEnum[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(referenceTypes, ["hotel", "rate_group", "product", "room_category", "age_category"]);
  for (const banned of ["availability", "inventory", "restriction", "price", "quote", "reservation", "daily_rate"]) {
    assert.ok(!referenceTypes.some((type) => type.includes(banned)), `ARI reference type leaked into D1: ${banned}`);
  }

  // Every allowed reference concept must actually be present in the contract.
  for (const token of [
    "mews_hotel_id",
    "mews_room_category_id",
    "mews_product_id",
    "rate_product_id",
    "mews_asset_id",
  ]) {
    assert.ok(tokens.has(token) || src.includes(token), `Missing allowed reference token: ${token}`);
  }
});

test("the advisory calendar snapshot is KV/Cache-backed, never D1-backed", () => {
  const src = read("worker/mews/calendar-engine.ts");
  assert.ok(
    /\bCALENDAR_CACHE\b/.test(src),
    "calendar engine must use the CALENDAR_CACHE KV binding for its advisory snapshot",
  );
  assert.ok(
    /\bcaches\.default\b/.test(src),
    "calendar engine must use the Worker Cache API fallback",
  );
  const d1Access = /\benv\s*\??\.\s*DB\b|\bgetDb\s*\(|\bD1Database\b|\bDB\s*\.\s*prepare\s*\(/;
  assert.ok(!d1Access.test(src), "calendar snapshot must never be read from or written to D1");
});
