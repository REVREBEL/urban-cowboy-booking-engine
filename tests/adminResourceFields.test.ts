// COW-94: representative worker responses must render useful fields, not opaque ids.
import assert from "node:assert/strict";
import test from "node:test";
import {
  RESOURCE_SECTIONS,
  displayFields,
  recordLabel,
  recordsFromResponse,
} from "../admin-app/lib/resource-fields.ts";

const section = (id: string) => {
  const config = RESOURCE_SECTIONS[id];
  assert.ok(config, `${id} has a section config`);
  return config;
};

test("media catalog renders filename, source URL and alt text", () => {
  const config = section("media");
  const rows = recordsFromResponse(
    {
      items: [
        {
          id: "media-1",
          filename: "Cowboy.svg",
          sourceUrl: "https://cdn.example/Cowboy.svg",
          altText: "Cowboy logo",
          width: 240,
          height: 80,
        },
      ],
    },
    config,
  );
  assert.equal(rows.length, 1);
  assert.equal(recordLabel(rows[0], config), "Cowboy.svg");
  const fields = Object.fromEntries(displayFields(rows[0], config).map((f) => [f.label, f.value]));
  assert.equal(fields["Source URL"], "https://cdn.example/Cowboy.svg");
  assert.equal(fields["Alt text"], "Cowboy logo");
  assert.equal(fields.Width, "240");
});

test("policy language unwraps the envelope and shows the editorial copy", () => {
  const config = section("policies");
  const rows = recordsFromResponse(
    {
      language: {
        refundableLanguage: "Full refund",
        refundableLanguageSubTitle: "Cancel and get your deposit back",
        nonRefundableLanguage: "Nothing back",
      },
    },
    config,
  );
  assert.equal(rows.length, 1);
  assert.equal(recordLabel(rows[0], config), "Full refund");
  const labels = displayFields(rows[0], config).map((f) => f.label);
  assert.ok(labels.includes("Refundable detail"));
  assert.ok(labels.includes("Non-refundable"));
  assert.ok(!labels.some((label) => label === "Record"));
});

test("analytics rows show day, metric and value", () => {
  const config = section("analytics");
  const rows = recordsFromResponse(
    {
      items: [
        { tenant_id: "urban-cowboy", day: "2026-11-23", metric: "sessions", value: 42 },
      ],
    },
    config,
  );
  assert.equal(rows.length, 1);
  const fields = Object.fromEntries(displayFields(rows[0], config).map((f) => [f.label, f.value]));
  assert.equal(fields.Day, "2026-11-23");
  assert.equal(fields.Metric, "sessions");
  assert.equal(fields.Value, "42");
  assert.equal(fields.Tenant, "urban-cowboy");
});

test("recovery accepts snake_case cart rows without exposing an opaque label", () => {
  const config = section("recovery");
  const rows = recordsFromResponse(
    { items: [{ id: "r1", cart_id: "cart-9", created_at: "2026-11-23T00:00:00Z" }] },
    config,
  );
  const fields = Object.fromEntries(displayFields(rows[0], config).map((f) => [f.label, f.value]));
  assert.equal(fields.Cart, "cart-9");
  assert.equal(fields.Created, "2026-11-23T00:00:00Z");
  assert.notEqual(recordLabel(rows[0], config), "Record");
});

test("empty, missing and malformed payloads produce no rows", () => {
  for (const value of [{ items: [] }, [], null, undefined, "oops"]) {
    assert.deepEqual(recordsFromResponse(value, section("media")), []);
  }
});

test("long values are bounded for display", () => {
  const config = section("media");
  const long = "x".repeat(500);
  const fields = displayFields({ id: "m1", filename: long }, config);
  const filename = fields.find((field) => field.label === "File");
  assert.ok(filename);
  assert.ok(filename.value.endsWith("…"));
  assert.ok(filename.value.length <= 241);
});
