import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] || "webflow_cms_export";
const files = readdirSync(dir).filter((f) => f.endsWith(".csv"));

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") {}
      else field += c;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift() || [];
  return rows.filter((r) => r.length === header.length).map((r) => {
    const o = {};
    header.forEach((h, i) => (o[h] = r[i]));
    return o;
  });
}

function esc(v) {
  if (v === null || v === undefined || v === "") return "NULL";
  return "'" + String(v).replace(/'/g, "''") + "'";
}

for (const f of files) {
  const rows = parseCsv(readFileSync(join(dir, f), "utf8"));
  console.log(`-- ${f}: ${rows.length} rows`);
}

const eventsFile = files.find((f) => /events/i.test(f));
if (eventsFile) {
  const rows = parseCsv(readFileSync(join(dir, eventsFile), "utf8"));
  console.log("-- BEGIN EVENTS SEED");
  for (const r of rows) {
    const id = r.id || r.slug;
    console.log(
      `INSERT OR IGNORE INTO events (id, tenant_id, title, description, starts_at, ends_at, display_flag) VALUES (${esc(id)}, 'urban-cowboy', ${esc(r.name)}, ${esc(r["short-description"])}, ${esc(r.datetime)}, ${esc(r["datetime-end"])}, ${r.isDraft === "true" ? 0 : 1});`,
    );
  }
  console.log("-- END EVENTS SEED");
}