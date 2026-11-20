#!/usr/bin/env node
// COW-70 stage 6: build a Fumadocs-compatible static search index from the
// checked-in MDX pages. No API route, network call or credential is needed.
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { createSearchAPI } from "fumadocs-core/search/server";

const root = process.cwd();
const docsRoot = join(root, "docs-app", "content", "docs");

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function parsePage(path) {
  const text = readFileSync(path, "utf8");
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? "";
  const field = (name) => new RegExp(`^${name}:\\s*["']?(.+?)["']?\\s*$`, "m")
    .exec(frontmatter)?.[1] ?? "";
  const body = text.replace(/^---\n[\s\S]*?\n---/, "")
    // Drop imports, JSX component usage and fenced code blocks; keep prose,
    // headings and table rows so the index covers the meaningful text.
    .replace(/^import[\s\S]*?;\s*$/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/^\|.*$/gm, (line) => line.replace(/\|/g, " "))
    .replace(/^#{1,6}\s*/gm, "")
    // Strip inline-code delimiters (but leave stray literal backticks alone)
    // so component names are indexed as plain tokens.
    .replace(/`([^`\n]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  const rel = relative(docsRoot, path).replace(/\.mdx$/, "").replaceAll("\\", "/");
  const segments = rel.split("/");
  const url = rel === "index" ? "/" : `/${segments.join("/")}/`;
  return {
    title: field("title") || segments.at(-1) || "Documentation",
    description: field("description"),
    content: body,
    url,
  };
}

const indexes = walk(docsRoot)
  .filter((path) => path.endsWith(".mdx"))
  .map(parsePage)
  .filter((page) => page.title && page.content.length > 0);

const api = createSearchAPI("simple", { indexes });
const target = join(root, "docs-app", "public", "search-index.json");
const response = await api.staticGET();
const data = await response.json();
writeFileSync(target, `${JSON.stringify(data)}\n`);
console.log(`built static search index (${indexes.length} pages) -> ${relative(root, target)}`);
