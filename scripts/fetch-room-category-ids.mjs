import fs from "node:fs";
import path from "node:path";

function loadDevVars(file = ".dev.vars") {
  const fullPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return;

  const lines = fs.readFileSync(fullPath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equals = line.indexOf("=");
    if (equals <= 0) continue;

    const key = line.slice(0, equals).trim();
    let value = line.slice(equals + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Explicit shell environment wins over .dev.vars.
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDevVars();

const CONFIGURATION_ID =
  process.env.MEWS_CATSKILLS_CONFIG_ID ||
  process.env.MEWS_CONFIG_ID ||
  "4725ace3-6b93-439f-a549-b4bc00ae1d10";

const CLIENT = process.env.MEWS_CLIENT;

if (!CLIENT || CLIENT.startsWith("<")) {
  console.error(
    "ERROR: MEWS_CLIENT is not set to a real registered Mews Booking Engine client.\n" +
      "Add it to .dev.vars as:\n" +
      'MEWS_CLIENT="Your Registered Client 1.0.0"\n' +
      "or export MEWS_CLIENT before running this script.",
  );
  process.exit(1);
}

console.log(`Testing Mews Booking Engine configuration: ${CONFIGURATION_ID}`);
console.log(`Client: ${CLIENT}`);

const payload = {
  Client: CLIENT,
  Ids: [CONFIGURATION_ID],
  PrimaryId: CONFIGURATION_ID,
  LanguageCode: "en-US",
  CultureCode: "en-US",
};

const response = await fetch("https://api.mews.com/api/distributor/v1/configuration/get", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
});

const bodyText = await response.text();

if (!response.ok) {
  console.error(`Mews configuration/get failed (${response.status})`);
  console.error(bodyText);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(bodyText);
} catch {
  console.error("Mews returned HTTP 200 but the body was not valid JSON:");
  console.error(bodyText);
  process.exit(1);
}

const configuration = Array.isArray(data.Configurations)
  ? data.Configurations.find((item) => item?.Id === CONFIGURATION_ID) ?? data.Configurations[0]
  : null;

if (!configuration) {
  console.error("Mews returned HTTP 200 but no matching configuration was present.");
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log("\nSUCCESS: production Booking Engine configuration is accessible.");
console.log(`Configuration ID: ${configuration.Id ?? CONFIGURATION_ID}`);
console.log(
  `Enterprise: ${configuration.Enterprise?.Name?.["en-US"] ?? configuration.Enterprise?.Name?.["en-GB"] ?? "(name unavailable)"}`,
);

const categories = configuration?.Enterprise?.Categories;

if (!Array.isArray(categories)) {
  console.error("\nConfiguration was accessible, but no Enterprise.Categories array was returned.");
  process.exit(1);
}

const rows = categories
  .map((category) => ({
    id: category.Id,
    name:
      category.Name?.["en-US"] ??
      category.Name?.["en-GB"] ??
      Object.values(category.Name ?? {}).find(Boolean) ??
      "",
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

console.table(rows);

console.log("\nCopy these UUIDs into src/lib/roomMerchandising.ts categoryIds:");
for (const row of rows) {
  console.log(`${row.name}\n  ${row.id}`);
}
