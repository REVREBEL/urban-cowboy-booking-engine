// COW-85 M4: the live verifier must record navigation/reload failures, write a
// report and exit nonzero instead of crashing before the report is written.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(new URL("../package.json", import.meta.url))));
const script = join(root, "scripts", "fumadocs", "verify-live-site.mjs");
const markers = [
  "Urban Cowboy Component Library", "SearchBar", "Search dropdowns", "Booking chrome",
  "Conversion badges", "Extras upsell", "Room list card", "Focus amenity family",
  "Rate offers", "Booking summary", "Booking details",
].join(" ");

function run(baseUrl) {
  const report = join(mkdtempSync(join(tmpdir(), "docs-live-")), "report.json");
  const result = spawnSync(process.execPath, [script], {
    cwd: root,
    encoding: "utf8",
    timeout: 120_000,
    env: {
      ...process.env,
      DOCS_LIVE_URL: baseUrl,
      DOCS_LIVE_REPORT: report,
      DOCS_LIVE_ONLY: "/",
      DOCS_LIVE_SKIP_INTERACTIONS: "1",
      DOCS_ALLOW_HTTP: "1",
    },
  });
  return { result, report: JSON.parse(readFileSync(report, "utf8")) };
}

test("unreachable host is reported as a navigation failure with nonzero exit", () => {
  const { result, report } = run("http://127.0.0.1:1/");
  assert.equal(result.status, 1);
  assert.ok(report.failures.some((failure) => failure.includes("navigation")), report.failures.join("\n"));
});

test("a failed reload is recorded instead of crashing before the report", async () => {
  let hits = 0;
  const server = createServer((_request, response) => {
    hits += 1;
    if (hits > 1) {
      // Force an abrupt failure so reload cannot complete normally.
      response.socket?.destroy();
      return;
    }
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(`<html><body>${markers}</body></html>`);
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const { result, report } = run(`http://127.0.0.1:${address.port}/`);
    assert.equal(result.status, 1);
    // The server fails after the first response, so at least one of the
    // navigation/refresh checks must be recorded rather than crashing.
    assert.ok(report.failures.some((failure) => failure.includes("navigation") ||
      failure.includes("refresh")), report.failures.join("\n"));
    assert.equal(result.error, undefined);
  } finally {
    await new Promise((done) => server.close(done));
  }
});
