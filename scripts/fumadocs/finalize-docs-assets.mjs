#!/usr/bin/env node
// Root-relative component asset URLs must resolve under the Pages base path.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { resolveDocsBasePath } from "./base-path.mjs";
import { prefixFontUrls } from "./prefix-font-urls.mjs";

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
  let next = html.replace(/(src|href)="\/assets\//g, `$1="${basePath}/assets/`);
  // Production components emit root-relative mask/background URLs inside
  // inline styles. HTML escapes the quotes as &quot;; prefix those too so the
  // images resolve under the Pages subpath instead of the domain root.
  next = next
    .replace(/(url\(&quot;)\/assets\//g, `$1${basePath}/assets/`)
    .replace(/(url\(&#39;)\/assets\//g, `$1${basePath}/assets/`)
    .replace(/(url\(")\/assets\//g, `$1${basePath}/assets/`)
    .replace(/(url\(')\/assets\//g, `$1${basePath}/assets/`);
  if (next !== html) {
    writeFileSync(path, next);
    replacements += 1;
  }
  files += 1;
}
if (basePath) {
  // Brand fonts are loaded from root-relative @font-face URLs in the imported
  // CSS. Prefix them so they resolve from the deployed Pages subpath too.
  for (const path of walk(out).filter((file) => file.endsWith(".css"))) {
    const css = readFileSync(path, "utf8");
    const next = prefixFontUrls(css, basePath);
    if (next !== css) {
      writeFileSync(path, next);
      replacements += 1;
    }
  }
}
console.log(`finalized ${files} pages, rewrote assets on ${replacements} pages (base ${basePath || "/"})`);
