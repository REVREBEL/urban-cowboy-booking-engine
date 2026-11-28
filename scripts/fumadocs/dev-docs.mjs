#!/usr/bin/env node
// Development entrypoint for the Fumadocs workspace. A clean checkout has no
// generated assets or search index (both are gitignored), so prepare them
// before starting Next and refresh the index whenever MDX files change.
import { spawn } from "node:child_process";
import { readdirSync, watch } from "node:fs";
import { join } from "node:path";
import { prepareDocsAssets } from "./prepare-docs-assets.mjs";
import { buildSearchIndex } from "./build-search-index.mjs";
import { generateDesignTokens } from "./generate-design-tokens.mjs";
import { writeFileSync } from "node:fs";

const root = process.cwd();
const contentRoot = join(root, "docs-app", "content", "docs");
const assetsRoot = join(root, "public", "assets");
// The generator reads declarations from src/styles and missing-token references
// from every source file, so watch the whole tree rather than just the CSS.
const sourceRoot = join(root, "src");
const tokenOutput = join(root, "docs-app", "lib", "design-tokens.generated.json");

function refreshTokens() {
  writeFileSync(tokenOutput, `${JSON.stringify(generateDesignTokens(root), null, 2)}\n`);
}

prepareDocsAssets(root);
refreshTokens();
await buildSearchIndex(root);

const child = spawn("npm", ["run", "dev", "-w", "@urban-cowboy/docs"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

const watchers = new Map();
function watchTree(directory, onChange) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    // A watched directory can disappear while the dev server is running.
    if (error.code === "ENOENT") return;
    throw error;
  }
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) watchTree(path, onChange);
  }
  if (!watchers.has(directory)) {
    const watcher = watch(directory, () => {
      // Re-walk so directories created after startup are watched too.
      watchTree(directory, onChange);
      onChange();
    });
    watcher.on("error", (error) => {
      if (error.code === "ENOENT") {
        watcher.close();
        watchers.delete(directory);
        return;
      }
      console.error(`[docs-dev] watch ${directory} failed:`, error);
    });
    watchers.set(directory, watcher);
  }
}

let timer;
function refresh(kind) {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      if (kind === "assets") prepareDocsAssets(root);
      if (kind === "tokens") refreshTokens();
      await buildSearchIndex(root);
    } catch (error) {
      console.error(`[docs-dev] ${kind} refresh failed:`, error);
    }
  }, 150);
}

watchTree(contentRoot, () => refresh("content"));
watchTree(assetsRoot, () => refresh("assets"));
watchTree(sourceRoot, () => refresh("tokens"));

function shutdown(signal) {
  if (!child.killed) child.kill(signal);
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

child.on("exit", (code, signal) => {
  for (const watcher of watchers.values()) watcher.close();
  process.exit(code ?? (signal ? 1 : 0));
});
