const CONFIGURATION_ID =
  process.env.MEWS_CATSKILLS_CONFIG_ID || "4725ace3-6b93-439f-a549-b4bc00ae1d10";
const CLIENT = process.env.MEWS_CLIENT;

if (!CLIENT) {
  console.error(
    "Missing MEWS_CLIENT. Run with your registered production Booking Engine client, for example:\n" +
      "MEWS_CLIENT='Your Registered Client 1.0.0' npm run room-ids",
  );
  process.exit(1);
}

const response = await fetch("https://api.mews.com/api/distributor/v1/configuration/get", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    Client: CLIENT,
    Ids: [CONFIGURATION_ID],
    PrimaryId: CONFIGURATION_ID,
    LanguageCode: "en-US",
    CultureCode: "en-US",
  }),
});

if (!response.ok) {
  const body = await response.text();
  console.error(`Mews configuration/get failed (${response.status}): ${body}`);
  process.exit(1);
}

const data = await response.json();
const configuration = Array.isArray(data.Configurations)
  ? data.Configurations.find((item) => item?.Id === CONFIGURATION_ID) ?? data.Configurations[0]
  : null;
const categories = configuration?.Enterprise?.Categories;

if (!Array.isArray(categories)) {
  console.error("No Enterprise.Categories array found in the Mews response.");
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
