import fs from "node:fs";
import path from "node:path";

const WEBFLOW_API = "https://api.webflow.com/v2";
const DEFAULT_MEWS_API = "https://api.mews.com";
const DEFAULT_WIDTH = 1600;
const REQUEST_TIMEOUT_MS = 20_000;

function loadDevVars(file = ".dev.vars") {
  const fullPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return;

  for (const rawLine of fs.readFileSync(fullPath, "utf8").split(/\r?\n/)) {
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

    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDevVars();

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const CLEAR_EMPTY = args.includes("--clear-empty");

const widthArg = args.find((arg) => arg.startsWith("--width="));
const IMAGE_WIDTH = widthArg
  ? Math.max(400, Math.min(3000, Number(widthArg.split("=")[1]) || DEFAULT_WIDTH))
  : DEFAULT_WIDTH;

const onlyArgIndex = args.indexOf("--only");
const ONLY = onlyArgIndex >= 0 ? args[onlyArgIndex + 1]?.trim() || null : null;

const MEWS_BASE_URL = (process.env.MEWS_BASE_URL || DEFAULT_MEWS_API).replace(/\/$/, "");
const MEWS_CLIENT = process.env.MEWS_CLIENT;
const MEWS_CONFIG_ID = process.env.MEWS_CONFIG_ID;
const WEBFLOW_TOKEN = process.env.WEBFLOW_CMS_API_TOKEN;
const WEBFLOW_COLLECTION_ID = process.env.WEBFLOW_ROOM_TYPE_COLLECTION_ID;

function required(name, value) {
  if (!value || String(value).startsWith("<")) {
    console.error(`ERROR: ${name} is not configured in .dev.vars or the shell environment.`);
    process.exit(1);
  }
  return value;
}

required("MEWS_CLIENT", MEWS_CLIENT);
required("MEWS_CONFIG_ID", MEWS_CONFIG_ID);
required("WEBFLOW_CMS_API_TOKEN", WEBFLOW_TOKEN);
required("WEBFLOW_ROOM_TYPE_COLLECTION_ID", WEBFLOW_COLLECTION_ID);

function normalizeName(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[’]/g, "'");
}

function localizedName(value) {
  if (!value || typeof value !== "object") return "";
  return (
    value["en-US"] ||
    value["en-GB"] ||
    value.en ||
    Object.values(value).find((entry) => typeof entry === "string" && entry.trim()) ||
    ""
  );
}

function orderedCategoryImageIds(categoryId, assignments, legacyImageIds) {
  const assigned = (assignments || [])
    .map((assignment, sourceIndex) => ({ assignment, sourceIndex }))
    .filter(
      ({ assignment }) =>
        assignment?.CategoryId === categoryId &&
        typeof assignment?.ImageId === "string" &&
        assignment.ImageId.length > 0,
    )
    .sort(
      (a, b) =>
        (a.assignment.Ordering ?? Number.MAX_SAFE_INTEGER) -
          (b.assignment.Ordering ?? Number.MAX_SAFE_INTEGER) ||
        a.sourceIndex - b.sourceIndex,
    )
    .map(({ assignment }) => assignment.ImageId);

  return [...new Set(assigned.length ? assigned : legacyImageIds || [])];
}

function imageUrl(baseUrl, imageId) {
  return `${String(baseUrl).replace(/\/$/, "")}/${imageId}?width=${IMAGE_WIDTH}`;
}

async function fetchJson(url, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const bodyText = await response.text();
    let data = null;

    try {
      data = bodyText ? JSON.parse(bodyText) : null;
    } catch {
      data = { raw: bodyText };
    }

    if (!response.ok) {
      const detail =
        typeof data?.message === "string"
          ? data.message
          : typeof data?.raw === "string"
            ? data.raw.slice(0, 500)
            : JSON.stringify(data).slice(0, 500);
      throw new Error(`${response.status} ${response.statusText}: ${detail}`);
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchMewsRoomTypes() {
  const payload = {
    Client: MEWS_CLIENT,
    Ids: [MEWS_CONFIG_ID],
    PrimaryId: MEWS_CONFIG_ID,
    LanguageCode: "en-GB",
  };

  const data = await fetchJson(
    `${MEWS_BASE_URL}/api/distributor/v1/configuration/get`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  const configuration = Array.isArray(data?.Configurations)
    ? data.Configurations.find((item) => item?.Id === MEWS_CONFIG_ID) ??
      data.Configurations[0]
    : null;

  if (!configuration?.Enterprise) {
    throw new Error("Mews configuration/get returned no matching Enterprise.");
  }

  const enterprise = configuration.Enterprise;
  const assignments = Array.isArray(enterprise.CategoryImageAssignments)
    ? enterprise.CategoryImageAssignments
    : [];
  const categories = Array.isArray(enterprise.Categories)
    ? enterprise.Categories
    : [];

  const baseUrl = data.ImageBaseUrl;
  if (!baseUrl) throw new Error("Mews configuration/get returned no ImageBaseUrl.");

  return categories.map((category) => {
    const imageIds = orderedCategoryImageIds(
      category.Id,
      assignments,
      Array.isArray(category.ImageIds) ? category.ImageIds : [],
    );

    return {
      id: category.Id,
      name: localizedName(category.Name),
      imageIds,
      images: imageIds.map((id) => ({
        url: imageUrl(baseUrl, id),
        alt: localizedName(category.Name) || "Urban Cowboy Lodge Catskills",
      })),
    };
  });
}

async function fetchAllWebflowRoomTypes() {
  const items = [];
  let offset = 0;

  while (true) {
    const page = await fetchJson(
      `${WEBFLOW_API}/collections/${encodeURIComponent(WEBFLOW_COLLECTION_ID)}/items?limit=100&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${WEBFLOW_TOKEN}`,
          Accept: "application/json",
        },
      },
    );

    const pageItems = Array.isArray(page?.items) ? page.items : [];
    items.push(...pageItems);

    const total = Number(page?.pagination?.total ?? items.length);
    if (items.length >= total || pageItems.length === 0) break;
    offset += pageItems.length;
  }

  return items;
}

function parseStoredImageIds(value) {
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((id) => typeof id === "string");
  } catch {
    // Compatibility with a manually-entered comma-separated value.
  }

  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function sameIds(a, b) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

function matchesOnly(room) {
  if (!ONLY) return true;
  const needle = normalizeName(ONLY);
  return (
    room.id.toLowerCase() === needle ||
    normalizeName(room.name).includes(needle) ||
    normalizeName(room.slug).includes(needle)
  );
}

async function updateWebflowItem(item, mewsRoom) {
  const fieldData = {
    "mews-image-ids": JSON.stringify(mewsRoom.imageIds),
    images: mewsRoom.images,
  };

  return fetchJson(
    `${WEBFLOW_API}/collections/${encodeURIComponent(WEBFLOW_COLLECTION_ID)}/items/${encodeURIComponent(item.id)}?skipInvalidFiles=false`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${WEBFLOW_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ fieldData }),
    },
  );
}

const mewsRooms = await fetchMewsRoomTypes();
const webflowItems = await fetchAllWebflowRoomTypes();

const webflowByMewsId = new Map();
const duplicateMewsIds = new Set();

for (const item of webflowItems) {
  const mewsId = item?.fieldData?.["mews-room-type-id"];
  if (typeof mewsId !== "string" || !mewsId.trim()) continue;

  if (webflowByMewsId.has(mewsId)) duplicateMewsIds.add(mewsId);
  webflowByMewsId.set(mewsId, item);
}

if (duplicateMewsIds.size) {
  console.error("ERROR: Duplicate Mews Room Type IDs exist in Webflow:");
  for (const id of duplicateMewsIds) console.error(`  - ${id}`);
  process.exit(1);
}

const rows = [];
let changed = 0;
let unchanged = 0;
let skippedEmpty = 0;
let missingWebflow = 0;
let failed = 0;

for (const mewsRoom of mewsRooms) {
  const item = webflowByMewsId.get(mewsRoom.id);

  if (!item) {
    if (!ONLY || matchesOnly({ id: mewsRoom.id, name: mewsRoom.name, slug: "" })) {
      rows.push({
        room: mewsRoom.name || mewsRoom.id,
        mewsImages: mewsRoom.imageIds.length,
        action: "MISSING WEBFLOW ITEM",
      });
      missingWebflow += 1;
    }
    continue;
  }

  const room = {
    id: mewsRoom.id,
    name: item.fieldData?.name || mewsRoom.name,
    slug: item.fieldData?.slug || "",
  };
  if (!matchesOnly(room)) continue;

  const currentIds = parseStoredImageIds(item.fieldData?.["mews-image-ids"]);
  const hasChanged = !sameIds(currentIds, mewsRoom.imageIds);

  if (!mewsRoom.imageIds.length && !CLEAR_EMPTY) {
    rows.push({
      room: room.name,
      mewsImages: 0,
      currentImages: Array.isArray(item.fieldData?.images) ? item.fieldData.images.length : 0,
      action: "SKIP EMPTY (use --clear-empty)",
    });
    skippedEmpty += 1;
    continue;
  }

  if (!hasChanged) {
    rows.push({
      room: room.name,
      mewsImages: mewsRoom.imageIds.length,
      currentImages: Array.isArray(item.fieldData?.images) ? item.fieldData.images.length : 0,
      action: "UNCHANGED",
    });
    unchanged += 1;
    continue;
  }

  changed += 1;

  if (!WRITE) {
    rows.push({
      room: room.name,
      mewsImages: mewsRoom.imageIds.length,
      currentImages: Array.isArray(item.fieldData?.images) ? item.fieldData.images.length : 0,
      action: "WOULD SYNC",
    });
    continue;
  }

  try {
    await updateWebflowItem(item, mewsRoom);
    rows.push({
      room: room.name,
      mewsImages: mewsRoom.imageIds.length,
      currentImages: Array.isArray(item.fieldData?.images) ? item.fieldData.images.length : 0,
      action: "SYNCED",
    });

    // Keep the API cadence deliberately gentle and make per-room failures easier
    // to identify if Webflow rejects a remote image.
    await new Promise((resolve) => setTimeout(resolve, 250));
  } catch (error) {
    failed += 1;
    rows.push({
      room: room.name,
      mewsImages: mewsRoom.imageIds.length,
      currentImages: Array.isArray(item.fieldData?.images) ? item.fieldData.images.length : 0,
      action: "FAILED",
    });
    console.error(`\nFAILED ${room.name}: ${error instanceof Error ? error.message : error}`);
  }
}

console.log("");
console.log(WRITE ? "ROOM PHOTO SYNC" : "ROOM PHOTO SYNC — DRY RUN");
console.log(`Mews configuration: ${MEWS_CONFIG_ID}`);
console.log(`Webflow collection: ${WEBFLOW_COLLECTION_ID}`);
console.log(`Image width: ${IMAGE_WIDTH}px`);
if (ONLY) console.log(`Filter: ${ONLY}`);
console.log("");
console.table(rows);
console.log(
  [
    `changed=${changed}`,
    `unchanged=${unchanged}`,
    `skippedEmpty=${skippedEmpty}`,
    `missingWebflow=${missingWebflow}`,
    `failed=${failed}`,
  ].join("  "),
);

if (!WRITE && changed > 0) {
  console.log("");
  console.log("Dry run only. Apply the changes with:");
  console.log("  npm run sync:room-photos -- --write");
}

if (WRITE) {
  console.log("");
  console.log(
    "Webflow items were updated in staged CMS content only. This script does not publish the site.",
  );
}

if (failed > 0 || missingWebflow > 0) process.exitCode = 1;
