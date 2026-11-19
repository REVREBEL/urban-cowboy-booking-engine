#!/usr/bin/env node
// Root-relative component asset URLs must resolve under the Pages base path.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { resolveDocsBasePath } from "./base-path.mjs";

const out = process.argv[2] ?? "docs-app/out";
const basePath = resolveDocsBasePath();
let files = 0;
let replacements = 0;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

for (const path of walk(out).filter((file) => file.endsWith(".html"))) {
  const html = readFileSync(path, "utf8");
  const next = html.replace(/(src|href)="\/assets\//g, `$1="${basePath}/assets/`);
  if (next !== html) {
    writeFileSync(path, next);
    replacements += 1;
  }
  files += 1;
}
console.log(`finalized ${files} pages, rewrote assets on ${replacements} pages (base ${basePath || "/"})`);
