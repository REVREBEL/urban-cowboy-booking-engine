import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] || "webflow_cms_export";
const files = readdirSync(dir).filter((f) => f.endsWith(".csv"));

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return { header: [], rows: [] };
  const header = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    const row = {};
    header.forEach((h, i) => {
      row[h] = (cols[i] || "").trim().replace(/^"|"$/g, "");
    });
    return row;
  });
  return { header, rows };
}

function esc(v) {
  if (v === null || v === undefined || v === "") return "NULL";
  return "'" + String(v).replace(/'/g, "''") + "'";
}

for (const f of files) {
  const { header, rows } = parseCsv(readFileSync(join(dir, f), "utf8"));
  console.log(`-- ${f}: ${rows.length} rows; columns: ${header.join(", ")}`);
}

// Example seed for Events collection if present.
const eventsFile = files.find((f) => /events/i.test(f));
if (eventsFile) {
  const { rows } = parseCsv(readFileSync(join(dir, eventsFile), "utf8"));
  console.log("-- BEGIN EVENTS SEED");
  for (const r of rows) {
    const id = r["ID"] || r["Slug"] || Math.random().toString(36).slice(2);
    console.log(
      `INSERT OR IGNORE INTO events (id, tenant_id, title, description, starts_at, display_flag) VALUES (${esc(id)}, 'urban-cowboy', ${esc(r["Name"] || r["Title"])}, ${esc(r["Description"])}, ${esc(r["Start"] || r["Date"])}, 1);`,
    );
  }
  console.log("-- END EVENTS SEED");
}