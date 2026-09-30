import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const ROOT = new URL("../public/assets/", import.meta.url);
const mode = process.argv.includes("--write") ? "write" : "check";

function svgIdFromFilename(filePath) {
  return basename(filePath, extname(filePath))
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9_.:-]/g, "-")
    .replace(/-+/g, "-");
}

function normalizePaintValue(value) {
  const normalized = value.trim().toLowerCase();
  if (
    normalized === "none" ||
    normalized === "currentcolor" ||
    normalized === "inherit"
  ) {
    return value;
  }
  return "currentColor";
}

function setRootSvgId(svg, id) {
  return svg.replace(/<svg\b([^>]*)>/i, (tag, attrs) => {
    if (/\bid\s*=\s*["'][^"']*["']/i.test(attrs)) {
      return tag.replace(
        /\bid\s*=\s*(["'])[^"']*\1/i,
        `id="${id}"`,
      );
    }
    return `<svg id="${id}"${attrs}>`;
  });
}

function normalizeSvg(svg, filePath) {
  const hadExplicitPaint =
    /\b(?:fill|stroke)\s*=\s*["']/i.test(svg) ||
    /\b(?:fill|stroke)\s*:/i.test(svg);

  let next = svg;

  next = next.replace(
    /\b(fill|stroke)\s*=\s*(["'])(.*?)\2/gi,
    (_match, prop, quote, value) =>
      `${prop}=${quote}${normalizePaintValue(value)}${quote}`,
  );

  next = next.replace(
    /\b(fill|stroke)\s*:\s*([^;}"']+)/gi,
    (_match, prop, value) =>
      `${prop}: ${normalizePaintValue(value)}`,
  );

  next = setRootSvgId(next, svgIdFromFilename(filePath));

  // SVG defaults to black fill when no paint is declared at all.
  // Make that implicit monochrome fill inherit currentColor too.
  if (!hadExplicitPaint) {
    next = next.replace(/<svg\b([^>]*)>/i, (tag, attrs) => {
      if (/\bfill\s*=/.test(attrs)) return tag;
      return `<svg fill="currentColor"${attrs}>`;
    });
  }

  return next;
}

async function walk(dirUrl) {
  const entries = await readdir(dirUrl, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const child = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dirUrl);
    if (entry.isDirectory()) {
      files.push(...(await walk(child)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) {
      files.push(child);
    }
  }

  return files;
}

const svgFiles = await walk(ROOT);
let changed = 0;

for (const fileUrl of svgFiles) {
  const current = await readFile(fileUrl, "utf8");
  const filePath = fileUrl.pathname;
  const next = normalizeSvg(current, filePath);

  if (next !== current) {
    changed += 1;
    const relative = fileUrl.pathname.split("/public/assets/")[1];

    if (mode === "write") {
      await writeFile(fileUrl, next, "utf8");
      console.log(`updated  public/assets/${relative}`);
    } else {
      console.log(`would update  public/assets/${relative}`);
    }
  }
}

console.log(
  `${mode === "write" ? "Updated" : "Would update"} ${changed} of ${svgFiles.length} SVG files.`,
);

if (mode === "check" && changed > 0) {
  process.exitCode = 1;
}
