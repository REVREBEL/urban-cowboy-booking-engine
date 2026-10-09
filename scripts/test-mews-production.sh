#!/usr/bin/env bash
set -euo pipefail

# Production Mews Booking Engine API smoke test.
# Uses the registered MEWS_CLIENT from the environment or local .dev.vars.
# It never prints the client value.

if [[ -z "${MEWS_CLIENT:-}" && -f ".dev.vars" ]]; then
  set -a
  # shellcheck disable=SC1091
  source .dev.vars
  set +a
fi

if [[ -z "${MEWS_CLIENT:-}" ]]; then
  echo "ERROR: MEWS_CLIENT is not set."
  echo "Set it in .dev.vars or export it before running this script."
  exit 2
fi

API_BASE="${MEWS_BASE_URL:-https://api.mews.com}"
LIVE_CONFIG_ID="af94d1f9-0d56-469f-8b15-b10600706974"
REPO_CONFIG_ID="4725ace3-6b93-439f-a549-b4bc00ae1d10"
REPO_HOTEL_ID="8bd38131-c371-4625-9c29-b10600705d34"

if [[ "$API_BASE" != "https://api.mews.com" ]]; then
  echo "WARNING: MEWS_BASE_URL is '$API_BASE'."
  echo "This test is intended for the production Booking Engine API."
fi

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

post_json() {
  local url="$1"
  local payload="$2"
  local outfile="$3"

  curl -sS     -o "$outfile"     -w "%{http_code}"     -X POST "$url"     -H "content-type: application/json"     --data-binary "$payload"
}

summarize_config() {
  python3 - "$1" <<'PY'
import json, sys
p=sys.argv[1]
with open(p) as f:
    data=json.load(f)
configs=data.get("Configurations") or []
for c in configs:
    e=c.get("Enterprise") or {}
    names=e.get("Name") or {}
    name=names.get("en-US") or names.get("en-GB") or next(iter(names.values()), "")
    cats=e.get("Categories") or []
    print(f"  ConfigurationId: {c.get('Id')}")
    print(f"  EnterpriseId:    {e.get('Id')}")
    print(f"  Property:        {name}")
    print(f"  Room categories: {len(cats)}")
PY
}

enterprise_id_from_config() {
  python3 - "$1" <<'PY'
import json, sys
with open(sys.argv[1]) as f:
    data=json.load(f)
configs=data.get("Configurations") or []
if configs:
    print((configs[0].get("Enterprise") or {}).get("Id") or "")
PY
}

summarize_hotel() {
  python3 - "$1" <<'PY'
import json, sys
with open(sys.argv[1]) as f:
    data=json.load(f)
names=data.get("Name") or {}
name=names.get("en-US") or names.get("en-GB") or next(iter(names.values()), "")
print(f"  HotelId:         {data.get('Id')}")
print(f"  Property:        {name}")
print(f"  Currency:        {data.get('DefaultCurrencyCode')}")
print(f"  Room categories: {len(data.get('RoomCategories') or [])}")
print(f"  Products:        {len(data.get('Products') or [])}")
PY
}

test_config() {
  local label="$1"
  local id="$2"
  local outfile="$tmpdir/config-$label.json"
  local payload
  payload="$(printf '{"Client":"%s","Ids":["%s"],"PrimaryId":"%s","LanguageCode":"en-US","CultureCode":"en-US"}' "$MEWS_CLIENT" "$id" "$id")"

  local status
  status="$(post_json "$API_BASE/api/distributor/v1/configuration/get" "$payload" "$outfile")"

  echo
  echo "[$label] configuration/get -> HTTP $status"
  if [[ "$status" =~ ^2 ]]; then
    summarize_config "$outfile"
  else
    python3 -m json.tool "$outfile" 2>/dev/null || cat "$outfile"
  fi

  printf '%s' "$status"
}

echo "Mews production Booking Engine API smoke test"
echo "API: $API_BASE"
echo "Client: configured (value hidden)"

live_out="$tmpdir/config-live.json"
live_payload="$(printf '{"Client":"%s","Ids":["%s"],"PrimaryId":"%s","LanguageCode":"en-US","CultureCode":"en-US"}' "$MEWS_CLIENT" "$LIVE_CONFIG_ID" "$LIVE_CONFIG_ID")"
live_status="$(post_json "$API_BASE/api/distributor/v1/configuration/get" "$live_payload" "$live_out")"
echo
echo "[live-site config] $LIVE_CONFIG_ID -> HTTP $live_status"
if [[ "$live_status" =~ ^2 ]]; then
  summarize_config "$live_out"
else
  python3 -m json.tool "$live_out" 2>/dev/null || cat "$live_out"
fi

repo_out="$tmpdir/config-repo.json"
repo_payload="$(printf '{"Client":"%s","Ids":["%s"],"PrimaryId":"%s","LanguageCode":"en-US","CultureCode":"en-US"}' "$MEWS_CLIENT" "$REPO_CONFIG_ID" "$REPO_CONFIG_ID")"
repo_status="$(post_json "$API_BASE/api/distributor/v1/configuration/get" "$repo_payload" "$repo_out")"
echo
echo "[repo config] $REPO_CONFIG_ID -> HTTP $repo_status"
if [[ "$repo_status" =~ ^2 ]]; then
  summarize_config "$repo_out"
else
  python3 -m json.tool "$repo_out" 2>/dev/null || cat "$repo_out"
fi

resolved_hotel_id=""
if [[ "$live_status" =~ ^2 ]]; then
  resolved_hotel_id="$(enterprise_id_from_config "$live_out")"
fi

hotel_id="${resolved_hotel_id:-$REPO_HOTEL_ID}"
hotel_out="$tmpdir/hotel.json"
hotel_payload="$(printf '{"Client":"%s","HotelId":"%s","LanguageCode":"en-US","CultureCode":"en-US"}' "$MEWS_CLIENT" "$hotel_id")"
hotel_status="$(post_json "$API_BASE/api/distributor/v1/hotels/get" "$hotel_payload" "$hotel_out")"
echo
echo "[hotel] $hotel_id -> HTTP $hotel_status"
if [[ "$hotel_status" =~ ^2 ]]; then
  summarize_hotel "$hotel_out"
else
  python3 -m json.tool "$hotel_out" 2>/dev/null || cat "$hotel_out"
fi

read -r START_UTC END_UTC < <(python3 - <<'PY'
from datetime import datetime, timedelta, timezone
start=(datetime.now(timezone.utc)+timedelta(days=30)).date()
end=start+timedelta(days=1)
print(f"{start.isoformat()}T00:00:00Z {end.isoformat()}T00:00:00Z")
PY
)

availability_out="$tmpdir/availability.json"
availability_payload="$(printf '{"Client":"%s","ConfigurationId":"%s","HotelId":"%s","StartUtc":"%s","EndUtc":"%s"}' "$MEWS_CLIENT" "$LIVE_CONFIG_ID" "$hotel_id" "$START_UTC" "$END_UTC")"
availability_status="$(post_json "$API_BASE/api/distributor/v1/hotels/getAvailability" "$availability_payload" "$availability_out")"
echo
echo "[availability] $START_UTC -> $END_UTC -> HTTP $availability_status"
if [[ "$availability_status" =~ ^2 ]]; then
  python3 - "$availability_out" <<'PY'
import json, sys
with open(sys.argv[1]) as f:
    data=json.load(f)
print("  Response keys:    " + ", ".join(sorted(data.keys())))
for key in ("RoomCategoryAvailabilities", "RoomCategoryAvailabilities", "RateGroups", "Rates"):
    value=data.get(key)
    if isinstance(value, list):
        print(f"  {key}: {len(value)}")
PY
else
  python3 -m json.tool "$availability_out" 2>/dev/null || cat "$availability_out"
fi

echo
echo "RESULT"
echo "  live-site configuration: HTTP $live_status"
echo "  repo configuration:      HTTP $repo_status"
echo "  hotel:                   HTTP $hotel_status"
echo "  availability:            HTTP $availability_status"

if [[ "$live_status" =~ ^2 && "$hotel_status" =~ ^2 && "$availability_status" =~ ^2 ]]; then
  echo "PASS: production Booking Engine API access is working for the live Catskills configuration."
  exit 0
fi

echo "FAIL: one or more production Booking Engine API calls did not succeed."
exit 1
