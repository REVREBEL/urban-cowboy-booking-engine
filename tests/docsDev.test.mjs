// COW-70: a clean checkout must be able to run `docs:dev` without a prior
// production build, and the generated search index must follow MDX edits.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("..", import.meta.url));
const publicDir = join(root, "docs-app", "public");
const generated = [
  "search-index.json",
  "fonts",
  "assets/icons/buildings",
  "assets/icons/icons-simple",
  "assets/icons/ui",
  "assets/illustrations",
  "assets/labels",
];

function removeGenerated() {
  for (const path of generated) rmSync(join(publicDir, path), { recursive: true, force: true });
}

function countMdx(directory) {
  return readdirSync(directory, { withFileTypes: true }).reduce((total, entry) => {
    const path = join(directory, entry.name);
    return total + (entry.isDirectory() ? countMdx(path) : Number(entry.name.endsWith(".mdx")));
  }, 0);
}

test("docs:prepare regenerates assets and search index from a clean checkout", () => {
  removeGenerated();
  const run = spawnSync("npm", ["run", "docs:prepare"], { cwd: root, encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr || run.stdout);

  const indexPath = join(publicDir, "search-index.json");
  assert.ok(existsSync(indexPath), "search index generated");
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  assert.equal(index.docs.count, countMdx(join(root, "docs-app", "content", "docs")));

  for (const asset of [
    "fonts/Brothers/Brothers-Regular.woff2",
    "assets/icons/buildings/lodge.svg",
    "assets/icons/ui/ui-arrow-up.svg",
    "assets/illustrations/interaction/find-your-stay/your_own_hideaway.svg",
    "assets/labels/top_match.svg",
  ]) {
    const path = join(publicDir, asset);
    assert.ok(existsSync(path) && statSync(path).size > 0, `prepared ${asset}`);
  }
});

test("search index refresh changes with MDX content", async () => {
  const page = join(root, "docs-app", "content", "docs", "components", "button.mdx");
  const original = readFileSync(page, "utf8");
  const indexBefore = readFileSync(join(publicDir, "search-index.json"), "utf8");
  try {
    writeFileSync(page, `${original}\n\n<!-- docs-dev regression marker -->\n`);
    const run = spawnSync(process.execPath, ["scripts/fumadocs/build-search-index.mjs"], { cwd: root, encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr || run.stdout);
    assert.notEqual(readFileSync(join(publicDir, "search-index.json"), "utf8"), indexBefore);
  } finally {
    writeFileSync(page, original);
    const run = spawnSync(process.execPath, ["scripts/fumadocs/build-search-index.mjs"], { cwd: root, encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr || run.stdout);
  }
});

test("docs:dev serves search and representative assets without a prior build", async () => {
  removeGenerated();
  const port = 4319;
  const child = spawn("npm", ["run", "docs:dev"], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk.toString(); });
  child.stderr.on("data", (chunk) => { output += chunk.toString(); });

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  try {
    let ready = false;
    for (let attempt = 0; attempt < 90; attempt += 1) {
      if (child.exitCode !== null) break;
      try {
        const response = await fetch(`http://127.0.0.1:${port}/`);
        if (response.ok) { ready = true; break; }
      } catch { /* server not listening yet */ }
      await wait(1000);
    }
    assert.ok(ready, `docs dev server did not start:\n${output.slice(-2000)}`);

    for (const path of [
      "/search-index.json",
      "/assets/icons/buildings/lodge.svg",
      "/fonts/Brothers/Brothers-Regular.woff2",
    ]) {
      const response = await fetch(`http://127.0.0.1:${port}${path}`);
      assert.equal(response.status, 200, `${path} served by docs:dev`);
    }
  } finally {
    if (child.exitCode === null) {
      if (process.platform === "win32") child.kill("SIGTERM");
      else process.kill(-child.pid, "SIGTERM");
    }
  }
});
