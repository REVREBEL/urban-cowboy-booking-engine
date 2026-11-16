// Generates a row-count report from Webflow CMS CSV exports.
// Full SQL generation is not implemented yet; this script validates inputs.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] || "webflow_cms_export";
const files = readdirSync(dir).filter((f) => f.endsWith(".csv"));

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const header = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    const row = {};
    header.forEach((h, i) => {
      row[h] = (cols[i] || "").trim().replace(/^"|"$/g, "");
    });
    return row;
  });
}

for (const f of files) {
  const text = readFileSync(join(dir, f), "utf8");
  const rows = parseCsv(text);
  console.log(`${f}: ${rows.length} rows`);
}
console.log("Seed generation placeholder: map columns per collection in D1 schema.");
EOF