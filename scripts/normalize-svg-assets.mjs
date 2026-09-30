import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname } from "node:path";

const ROOT = new URL("../public/assets/", import.meta.url);
const writeMode = process.argv.includes("--write");

function svgIdFromFilename(fileUrl) {
  return basename(fileUrl.pathname, extname(fileUrl.pathname))
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9_.:-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizePaint(value) {
  const v = value.trim();
  const lower = v.toLowerCase();

  if (lower === "none" || lower === "currentcolor") {
    return v;
  }

  return "currentColor";
}

function setRootSvgId(svg, id) {
  return svg.replace(/<svg\b([^>]*)>/i, (tag, attrs) => {
    const withId = /\bid\s*=\s*(["'])[^"']*\1/i.test(attrs)
      ? attrs.replace(/\bid\s*=\s*(["'])[^"']*\1/i, ` id="${id}"`)
      : ` id="${id}"${attrs}`;

    return `<svg${withId}>`;
  });
}

function normalizeAttributes(svg) {
  return svg.replace(
    /\b(fill|stroke)\s*=\s*(["'])(.*?)\2/gi,
    (_match, prop, quote, value) =>
      `${prop}=${quote}${normalizePaint(value)}${quote}`,
  );
}

function normalizeInlineStyles(svg) {
  return svg.replace(
    /\b(fill|stroke)\s*:\s*([^;}"']+)/gi,
    (_match, prop, value) => `${prop}: ${normalizePaint(value)}`,
  );
}

function addInheritedFillIfNeeded(svg) {
  const hasPaint = /\b(?:fill|stroke)\s*=\s*["']/i.test(svg)
    || /\b(?:fill|stroke)\s*:/i.test(svg);

  if (hasPaint) return svg;

  return svg.replace(/<svg\b([^>]*)>/i, (_tag, attrs) => {
    return `<svg fill="currentColor"${attrs}>`;
  });
}

function normalizeSvg(svg, fileUrl) {
  let next = svg;
  next = normalizeAttributes(next);
  next = normalizeInlineStyles(next);
  next = addInheritedFillIfNeeded(next);
  next = setRootSvgId(next, svgIdFromFilename(fileUrl));
  return next;
}

async function walk(directoryUrl) {
  const entries = await readdir(directoryUrl, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const child = new URL(
      entry.name + (entry.isDirectory() ? "/" : ""),
      directoryUrl,
    );

    if (entry.isDirectory()) {
      files.push(...(await walk(child)));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) {
      files.push(child);
    }
  }

  return files;
}

const files = await walk(ROOT);
let changed = 0;

for (const fileUrl of files) {
  const original = await readFile(fileUrl, "utf8");
  const normalized = normalizeSvg(original, fileUrl);

  if (normalized === original) continue;

  changed += 1;
  const relative = decodeURIComponent(
    fileUrl.pathname.split("/public/assets/")[1],
  );

  if (writeMode) {
    await writeFile(fileUrl, normalized, "utf8");
    console.log(`updated       public/assets/${relative}`);
  } else {
    console.log(`would update  public/assets/${relative}`);
  }
}

console.log(
  `${writeMode ? "Updated" : "Would update"} ${changed} of ${files.length} SVG files.`,
);

if (!writeMode && changed > 0) {
  process.exitCode = 1;
}
