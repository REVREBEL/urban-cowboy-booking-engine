#!/usr/bin/env bash
set -euo pipefail

DEV_VARS="${DEV_VARS:-.dev.vars}"

if [[ -f "$DEV_VARS" ]]; then
  # .dev.vars is a shell-compatible KEY=VALUE file in this project.
  set -a
  # shellcheck disable=SC1090
  source "$DEV_VARS"
  set +a
fi

: "${MEWS_CLIENT:?ERROR: MEWS_CLIENT is not set. Add it to .dev.vars or export it first.}"

MEWS_BASE_URL="${MEWS_BASE_URL:-https://api.mews.com}"
MEWS_CONFIG_ID="${MEWS_CONFIG_ID:-4725ace3-6b93-439f-a549-b4bc00ae1d10}"
MEWS_HOTEL_ID="${MEWS_HOTEL_ID:-8bd38131-c371-4625-9c29-b10600705d34}"
MEWS_ADULT_AGE_CATEGORY_ID="${MEWS_ADULT_AGE_CATEGORY_ID:-8f3ceb39-5c40-417a-b9a5-b106007064f8}"

echo "Testing Mews production Booking Engine API"
echo "Base URL:         $MEWS_BASE_URL"
echo "Configuration ID: $MEWS_CONFIG_ID"
echo "Hotel ID:         $MEWS_HOTEL_ID"
echo

CONFIG_BODY=$(cat <<JSON
{
  "Client": "$MEWS_CLIENT",
  "Ids": ["$MEWS_CONFIG_ID"],
  "PrimaryId": "$MEWS_CONFIG_ID",
  "LanguageCode": "en-US"
}
JSON
)

TMP_CONFIG=$(mktemp)
TMP_AVAIL=$(mktemp)
trap 'rm -f "$TMP_CONFIG" "$TMP_AVAIL"' EXIT

CONFIG_STATUS=$(curl -sS   -o "$TMP_CONFIG"   -w "%{http_code}"   -X POST "$MEWS_BASE_URL/api/distributor/v1/configuration/get"   -H "Content-Type: application/json"   --data "$CONFIG_BODY")

echo "configuration/get HTTP $CONFIG_STATUS"

if [[ "$CONFIG_STATUS" != "200" ]]; then
  cat "$TMP_CONFIG"
  echo
  exit 1
fi

node - "$TMP_CONFIG" "$MEWS_CONFIG_ID" <<'NODE'
const fs = require("fs");
const [file, expectedId] = process.argv.slice(2);
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const configs = Array.isArray(data.Configurations) ? data.Configurations : [];
const config = configs.find((x) => x?.Id === expectedId) ?? configs[0];

if (!config) {
  console.error("FAIL: HTTP 200 but no configuration was returned.");
  process.exit(1);
}

console.log("PASS: production configuration is accessible.");
console.log("Returned configuration:", config.Id ?? "(missing Id)");
console.log("Enterprise:", config.Enterprise?.Name?.["en-US"] ?? config.Enterprise?.Name?.["en-GB"] ?? "(name unavailable)");

const cats = config.Enterprise?.Categories;
console.log("Room categories:", Array.isArray(cats) ? cats.length : 0);

if (Array.isArray(cats)) {
  for (const cat of cats) {
    const name =
      cat?.Name?.["en-US"] ??
      cat?.Name?.["en-GB"] ??
      Object.values(cat?.Name ?? {}).find(Boolean) ??
      "(unnamed)";
    console.log(`  ${name}: ${cat.Id}`);
  }
}
NODE

# Test a small future availability window. This confirms that the config/hotel/age
# identifiers work together, not merely that configuration/get is readable.
START_UTC="${MEWS_TEST_START_UTC:-2026-10-15T20:00:00Z}"
END_UTC="${MEWS_TEST_END_UTC:-2026-10-16T15:00:00Z}"

AVAIL_BODY=$(cat <<JSON
{
  "Client": "$MEWS_CLIENT",
  "ConfigurationId": "$MEWS_CONFIG_ID",
  "HotelId": "$MEWS_HOTEL_ID",
  "StartUtc": "$START_UTC",
  "EndUtc": "$END_UTC",
  "CurrencyCode": "USD",
  "LanguageCode": "en-US",
  "OccupancyData": [
    {
      "AgeCategoryId": "$MEWS_ADULT_AGE_CATEGORY_ID",
      "PersonCount": 2
    }
  ]
}
JSON
)

AVAIL_STATUS=$(curl -sS   -o "$TMP_AVAIL"   -w "%{http_code}"   -X POST "$MEWS_BASE_URL/api/distributor/v1/hotels/getAvailability"   -H "Content-Type: application/json"   --data "$AVAIL_BODY")

echo
echo "hotels/getAvailability HTTP $AVAIL_STATUS"

if [[ "$AVAIL_STATUS" != "200" ]]; then
  cat "$TMP_AVAIL"
  echo
  exit 1
fi

node - "$TMP_AVAIL" <<'NODE'
const fs = require("fs");
const file = process.argv[2];
const data = JSON.parse(fs.readFileSync(file, "utf8"));

const rooms = Array.isArray(data.RoomCategoryAvailabilities)
  ? data.RoomCategoryAvailabilities
  : [];
const rates = Array.isArray(data.Rates) ? data.Rates : [];
const groups = Array.isArray(data.RateGroups) ? data.RateGroups : [];

console.log("PASS: production availability endpoint is accessible.");
console.log("Available room categories returned:", rooms.length);
console.log("Rates returned:", rates.length);
console.log("Rate groups returned:", groups.length);

for (const row of rooms) {
  console.log(
    `  ${row.RoomCategoryId}: available=${row.AvailableRoomCount ?? "?"}`
  );
}
NODE
