import assert from "node:assert/strict";
import test from "node:test";
import { mergeVerifiedPublishedFields, onRequestStudioConfig } from "../worker/webflow/locations.ts";
import type { Env } from "../worker/mews/_lib.ts";

const collectionId = "6abc812fd98b325b281d6301";
const itemId = "6abc9142d98b325b2821ca23";
const env = {
  MEWS_CONFIG_ID: "test-config",
  WEBFLOW_LOCATION_COLLECTION_ID: collectionId,
  WEBFLOW_LOCATION_ITEM_ID: itemId,
  WEBFLOW_CMS_API_TOKEN: "test-token",
} as unknown as Env;

test("Studio checks the specific live CMS item through the Data API", async () => {
  const originalFetch = globalThis.fetch;
  const called: string[] = [];
  globalThis.fetch = async (input) => {
    called.push(String(input));
    return new Response(JSON.stringify({
      id: itemId,
      isDraft: false,
      isArchived: false,
      fieldData: {
        "enable-demo-engine": true,
        "production-layout": "97075d405111e533c78daa0afa48bef5",
        "demo-layout": "2142905a00c88401810632b026107cf2",
      },
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  try {
    const result = await onRequestStudioConfig({
      env,
      request: new Request("http://localhost:8787/api/studio/config?property=hotel"),
    });
    assert.deepEqual(await result.json(), {
      enabled: true, property: "hotel", demoLayout: "photo",
    });
    assert.deepEqual(called, [
      `https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}/live`,
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Studio remains disabled when live Webflow switch is off", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    id: itemId,
    fieldData: { "enable-demo-engine": false, "production-layout": "97075d405111e533c78daa0afa48bef5", "demo-layout": "b5074dbc31924c6f9feb79f1a6bdfd2c" },
  }), { status: 200 });

  try {
    const result = await onRequestStudioConfig({
      env,
      request: new Request("http://localhost:8787/api/studio/config?property=hotel"),
    });
    assert.equal((await result.json()).enabled, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("local denied response reveals only safe diagnostic; public denied response does not", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    id: itemId,
    fieldData: { "enable-demo-engine": false, "production-layout": "97075d405111e533c78daa0afa48bef5", "demo-layout": "b5074dbc31924c6f9feb79f1a6bdfd2c" },
  }), { status: 200 });
  try {
    const local = await onRequestStudioConfig({
      env,
      request: new Request("http://127.0.0.1:8787/api/studio/config?property=hotel"),
    });
    const localData = await local.json() as Record<string, unknown>;
    assert.equal(localData.enabled, false);
    assert.equal(localData.diagnostic, "cms_switch_off");

    const publicResponse = await onRequestStudioConfig({
      env,
      request: new Request("https://booking.example.com/api/studio/config?property=hotel"),
    });
    const publicData = await publicResponse.json() as Record<string, unknown>;
    assert.equal(publicData.enabled, false);
    assert.equal("diagnostic" in publicData, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("published fields missing from live response are recovered only from the same publication", async () => {
  const published = "2026-10-14T06:13:23.572Z";
  const live = {
    id: itemId,
    lastPublished: published,
    lastUpdated: published,
    isDraft: false,
    isArchived: false,
    fieldData: { name: "Catskills" },
  };
  const staged = {
    id: itemId,
    lastPublished: published,
    lastUpdated: published,
    isDraft: false,
    isArchived: false,
    fieldData: {
      "enable-demo-engine": true,
      "production-layout": "f4859a16a8556038b0f026679aaa6a02",
      "demo-layout": "2142905a00c88401810632b026107cf2",
    },
  };
  const recovered = mergeVerifiedPublishedFields(live, staged);
  assert.equal(recovered.fieldData?.["enable-demo-engine"], true);
  const originalFetch = globalThis.fetch;
  const called: string[] = [];
  globalThis.fetch = async (input) => {
    called.push(String(input));
    return new Response(JSON.stringify(String(input).endsWith("/live") ? live : staged), { status: 200 });
  };
  try {
    const response = await onRequestStudioConfig({
      env,
      request: new Request("http://localhost:8787/api/studio/config?property=hotel"),
    });
    assert.deepEqual(await response.json(), { enabled: true, property: "hotel", demoLayout: "photo" });
    assert.equal(called.length, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("unpublished edits cannot enable Studio when the live switch is missing", () => {
  const live = {
    id: itemId, lastPublished: "2026-10-14T06:13:23.572Z",
    isDraft: false, fieldData: {},
  };
  const staged = {
    id: itemId, lastPublished: "2026-10-14T06:13:23.572Z",
    lastUpdated: "2026-10-14T06:14:23.572Z",
    isDraft: false, fieldData: { "enable-demo-engine": true },
  };
  const merged = mergeVerifiedPublishedFields(live, staged);
  assert.equal(merged.fieldData?.["enable-demo-engine"], undefined);
  assert.equal(
    mergeVerifiedPublishedFields({ ...live, fieldData: { "enable-demo-engine": false } }, {
      ...staged, lastUpdated: staged.lastPublished,
    }).fieldData?.["enable-demo-engine"],
    false,
  );
});
