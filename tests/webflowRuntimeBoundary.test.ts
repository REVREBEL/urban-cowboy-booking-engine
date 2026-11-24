// COW-111: Webflow host access stays in legacy handlers, shadow parity and the
// offline importer. No guest path outside those modules may fetch Webflow.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const workerDir = new URL("../worker/", import.meta.url);

function workerFiles(dir: URL, prefix = ""): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...workerFiles(new URL(`${entry.name}/`, dir), rel));
    else if (entry.name.endsWith(".ts")) out.push(rel);
  }
  return out;
}

const files = workerFiles(workerDir);
const readWorker = (path: string) => readFileSync(new URL(`worker/${path}`, root), "utf8");

const HOST_PATTERN = /api(?:-cdn)?\.webflow\.com/i;
const ALLOWED_HOST_FILES = new Set([
  "photo-source-webflow.ts",
  "shadow-read.ts",
  ...files.filter((path) => path.startsWith("webflow/")),
]);

test("Webflow host references are confined to legacy handlers, parity and importer", () => {
  const offenders: string[] = [];
  for (const path of files) {
    if (ALLOWED_HOST_FILES.has(path)) continue;
    if (HOST_PATTERN.test(readWorker(path))) offenders.push(path);
  }
  assert.deepEqual(offenders, [], `Webflow host reference outside allowed modules: ${offenders.join(", ")}`);
});

test("the offline photo importer is not imported by any worker route", () => {
  const offenders = files.filter((path) =>
    path !== "photo-source-webflow.ts" &&
    /photo-source-webflow/.test(readWorker(path)),
  );
  assert.deepEqual(offenders, [], `Importer imported by worker runtime: ${offenders.join(", ")}`);
});

test("every env.WEBFLOW_* access is declared in the Env interface", () => {
  const envSource = readFileSync(new URL("worker/mews/_lib.ts", root), "utf8");
  const envStart = envSource.indexOf("export interface Env");
  const envEnd = envSource.indexOf("\n}", envStart);
  assert.ok(envStart >= 0 && envEnd > envStart, "Env interface must exist");
  const envBlock = envSource.slice(envStart, envEnd);
  const declared = new Set(
    [...envBlock.matchAll(/\b(WEBFLOW_[A-Z0-9_]+)\s*\?/g)].map((match) => match[1]),
  );

  const used = new Set<string>();
  for (const path of files) {
    for (const match of readWorker(path).matchAll(/\benv\.(WEBFLOW_[A-Z0-9_]+)/g)) used.add(match[1]);
  }
  const undeclared = [...used].filter((name) => !declared.has(name));
  assert.deepEqual(undeclared, [], `Undeclared Webflow env access: ${undeclared.join(", ")}`);
});

test("all known Webflow runtime bindings are enumerated in deployment config", () => {
  const config = readFileSync(new URL("wrangler.toml", root), "utf8");
  const exampleEnv = readFileSync(new URL(".dev.vars.example", root), "utf8");
  const envSource = readFileSync(new URL("worker/mews/_lib.ts", root), "utf8");
  const envStart = envSource.indexOf("export interface Env");
  const envEnd = envSource.indexOf("\n}", envStart);
  const declared = [...envSource.slice(envStart, envEnd).matchAll(/\b(WEBFLOW_[A-Z0-9_]+)\s*\?/g)]
    .map((match) => match[1]);
  assert.ok(declared.length > 0);
  const inWrangler = (name: string) =>
    config.includes(`${name} =`) ||
    config.includes(`"${name}"`) ||
    config.includes(`binding = "${name}"`);
  const missing = declared.filter((name) => !inWrangler(name) && !exampleEnv.includes(name));
  assert.deepEqual(missing, [], `Webflow binding not declared in deployment config: ${missing.join(", ")}`);
});
