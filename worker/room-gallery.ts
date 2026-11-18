// COW-67: room-gallery feed parsing, room-type resolution and import planning.
//
// The source is https://www.urbancowboy.com/catskills/image-feed, a Squarespace
// page. Verified 2026-11-18:
//
//   GET  /catskills/image-feed            -> 200 text/html, galleries in server HTML
//   GET  /catskills/image-feed?format=json -> 200 application/json, mainContent EMPTY
//   GET  /catskills/image-feed?format=rss  -> 400 "Unknown response format for page type"
//
// So the JSON and RSS paths carry no gallery content at all, and DOM extraction is
// the only method that preserves the room association.
//
// The page has no `id="image-gallery-<slug>"` attributes. Association is
// positional: each room is a heading section immediately followed by its gallery
// section. `parseRoomGalleryFeed` records that pairing explicitly so a markup
// regression is visible instead of silently mis-assigning images.

export interface GalleryImage {
  /** 1-based position within the room gallery. */
  position: number;
  /** Canonical source URL: the original CDN URL with any resize query removed. */
  url: string;
  /** Squarespace asset UUID. Durable across resizes; used as squarespace_asset_id. */
  assetId: string;
  /** Original filename from the CDN path. */
  filename: string;
  /** Alt text from the first alt attribute on the img. */
  alt: string | null;
  width: number | null;
  height: number | null;
  /** Every srcset candidate, query intact, in source order. */
  srcset: string[];
  /** True when the image carried no usable src, data-src, data-image or srcset. */
  missingSource: boolean;
}

export interface RoomGallery {
  /** Room name exactly as it appears in the heading. */
  heading: string;
  /** Section id the images came from. */
  sectionId: string;
  images: GalleryImage[];
}

export interface ParseResult {
  galleries: RoomGallery[];
  warnings: string[];
}

const SECTION_RE = /<section\b[^>]*\bdata-section-id="([^"]+)"[^>]*>/g;
const HEADING_RE = /<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/i;
const FIGURE_RE =
  /<figure\b[^>]*class="[^"]*\bgallery-grid-item\b[^"]*"[^>]*>([\s\S]*?)<\/figure>/g;
const IMG_RE = /<img\b[^>]*>/i;
const ATTR_RE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&[a-z#0-9]+;/gi, (entity) => ENTITIES[entity] ?? entity);
}

function stripTags(value: string): string {
  return decodeEntities(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

/** Attribute reader that keeps the FIRST occurrence of a duplicated attribute. */
function readAttrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  ATTR_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ATTR_RE.exec(tag)) !== null) {
    const name = match[1].toLowerCase();
    if (!(name in out)) out[name] = decodeEntities(match[2]).trim();
  }
  return out;
}

/** Drops the resize query so `?format=500w` variants collapse to one asset. */
export function canonicaliseUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const withoutHash = trimmed.split("#")[0];
  const question = withoutHash.indexOf("?");
  return question === -1 ? withoutHash : withoutHash.slice(0, question);
}

function parseSrcset(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((candidate) => canonicaliseUrl(candidate.trim().split(/\s+/)[0] ?? ""))
    .filter(Boolean);
}

/** Pulls the durable asset id and filename out of a Squarespace CDN path. */
export function splitAssetPath(url: string): { assetId: string; filename: string } {
  try {
    const { pathname } = new URL(url);
    const segments = pathname.split("/").filter(Boolean);
    const rawName = segments.at(-1) ?? "";
    let filename = rawName;
    try {
      filename = decodeURIComponent(rawName.replace(/\+/g, " "));
    } catch {
      /* keep the raw name when it is not valid percent-encoding */
    }
    return { assetId: segments.at(-2) ?? "", filename };
  } catch {
    return { assetId: "", filename: "" };
  }
}

function parseImage(imgTag: string): GalleryImage | null {
  const attrs = readAttrs(imgTag);

  const source =
    attrs["data-image"] || attrs["data-src"] || attrs["src"] || parseSrcset(attrs["srcset"])[0] || "";
  const url = canonicaliseUrl(source);
  const { assetId, filename } = splitAssetPath(url);

  if (!url || !assetId) {
    return {
      position: 0,
      url,
      assetId,
      filename,
      alt: attrs["alt"] || null,
      width: null,
      height: null,
      srcset: parseSrcset(attrs["srcset"]),
      missingSource: true,
    };
  }

  const dimensions = /^(\d+)x(\d+)$/.exec(attrs["data-image-dimensions"] ?? "");
  const width = dimensions ? Number(dimensions[1]) : Number(attrs["width"]) || null;
  const height = dimensions ? Number(dimensions[2]) : Number(attrs["height"]) || null;

  return {
    position: 0,
    url,
    assetId,
    filename,
    alt: attrs["alt"] ? attrs["alt"] : null,
    width: Number.isFinite(width) ? width : null,
    height: Number.isFinite(height) ? height : null,
    srcset: parseSrcset(attrs["srcset"]),
    missingSource: false,
  };
}

function parseFigure(figureBody: string): GalleryImage | null {
  const img = IMG_RE.exec(figureBody);
  if (!img) return null;
  return parseImage(img[0]);
}

/**
 * Pairs heading sections with the gallery section that follows them.
 *
 * Squarespace renders each room as a text block section followed by a gallery
 * block section. The pairing is by document order, which is stable for this page
 * but is NOT an id contract: a heading added without a gallery, or two galleries
 * in a row, is reported as a warning rather than silently mis-assigned.
 */
export function parseRoomGalleryFeed(html: string): ParseResult {
  const sections: { id: string; start: number; end: number }[] = [];
  SECTION_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SECTION_RE.exec(html)) !== null) {
    sections.push({ id: match[1], start: match.index, end: match.index + match[0].length });
  }
  sections.forEach((section, index) => {
    section.end = index + 1 < sections.length ? sections[index + 1].start : html.length;
  });

  const warnings: string[] = [];
  const galleries: RoomGallery[] = [];
  let pendingHeading: { text: string; sectionId: string } | null = null;

  for (const section of sections) {
    const body = html.slice(section.start, section.end);

    FIGURE_RE.lastIndex = 0;
    const figures: string[] = [];
    let figure: RegExpExecArray | null;
    while ((figure = FIGURE_RE.exec(body)) !== null) figures.push(figure[1]);

    if (figures.length === 0) {
      const heading = HEADING_RE.exec(body);
      if (heading) {
        const text = stripTags(heading[1]);
        if (text) {
          if (pendingHeading) {
            warnings.push(
              `section ${pendingHeading.sectionId} has heading "${pendingHeading.text}" but no gallery before "${text}"`,
            );
          }
          pendingHeading = { text, sectionId: section.id };
        }
      }
      continue;
    }

    const images: GalleryImage[] = [];
    for (const figureBody of figures) {
      const image = parseFigure(figureBody);
      if (!image) {
        warnings.push(`section ${section.id} has a gallery figure with no img element`);
        continue;
      }
      image.position = images.length + 1;
      images.push(image);
    }

    if (images.length === 0) {
      warnings.push(`section ${section.id} has ${figures.length} figures but no usable image`);
      continue;
    }

    const heading = pendingHeading?.text ?? "";
    if (!heading) {
      warnings.push(`section ${section.id} has ${images.length} images but no preceding heading`);
    }
    pendingHeading = null;

    galleries.push({ heading, sectionId: section.id, images });
  }

  if (pendingHeading) {
    warnings.push(`section ${pendingHeading.sectionId} has heading "${pendingHeading.text}" but no gallery follows`);
  }

  return { galleries, warnings };
}

export interface RoomTypeRecord {
  id: string;
  name: string;
  slug: string | null;
}

/** Explicit aliases for feed headings that are not a verbatim room-type name. */
export const ROOM_HEADING_ALIASES: Record<string, string> = {
  "walden bathing suite with den": "walden-forest-bathing-suite-with-den",
};

function normalise(value: string): string {
  return decodeEntities(value)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type RoomResolution =
  | { status: "matched"; roomType: RoomTypeRecord; matchedBy: "name" | "slug" | "alias" }
  | { status: "unmatched"; reason: string };

/**
 * Resolves a feed heading to exactly one room type. Never creates a room type
 * and never fuzzy-matches: zero or several candidates are both failures.
 */
export function resolveRoomType(
  heading: string,
  roomTypes: readonly RoomTypeRecord[],
): RoomResolution {
  const normalised = normalise(heading);
  if (!normalised) return { status: "unmatched", reason: "empty heading" };

  const aliasTarget = ROOM_HEADING_ALIASES[heading.trim().toLowerCase()];

  const byName = roomTypes.filter((room) => normalise(room.name) === normalised);
  if (byName.length === 1) return { status: "matched", roomType: byName[0], matchedBy: "name" };
  if (byName.length > 1) {
    return { status: "unmatched", reason: `${byName.length} room types share the name "${heading}"` };
  }

  const bySlug = roomTypes.filter((room) => room.slug === normalised);
  if (bySlug.length === 1) return { status: "matched", roomType: bySlug[0], matchedBy: "slug" };
  if (bySlug.length > 1) {
    return { status: "unmatched", reason: `${bySlug.length} room types share the slug "${normalised}"` };
  }

  if (aliasTarget) {
    const aliased = roomTypes.filter((room) => room.slug === aliasTarget);
    if (aliased.length === 1) return { status: "matched", roomType: aliased[0], matchedBy: "alias" };
    if (aliased.length === 0) {
      return { status: "unmatched", reason: `alias "${aliasTarget}" matches no room type` };
    }
    return { status: "unmatched", reason: `${aliased.length} room types match alias "${aliasTarget}"` };
  }

  return { status: "unmatched", reason: `no room type matches "${heading}"` };
}

export interface PlannedImage {
  position: number;
  url: string;
  assetId: string;
  filename: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export interface PlannedRoom {
  heading: string;
  sectionId: string;
  roomTypeId: string | null;
  roomTypeName: string | null;
  matchedBy: "name" | "slug" | "alias" | null;
  unresolvedReason: string | null;
  images: PlannedImage[];
}

export interface ImportPlan {
  rooms: PlannedRoom[];
  warnings: string[];
}

/**
 * Turns a parse result into a room-by-room plan. A room that does not resolve to
 * exactly one room type yields no images, so an unknown slug can never create or
 * reassign a room.
 */
export function buildImportPlan(
  parsed: ParseResult,
  roomTypes: readonly RoomTypeRecord[],
): ImportPlan {
  const warnings = [...parsed.warnings];
  const rooms: PlannedRoom[] = parsed.galleries.map((gallery) => {
    const resolution = resolveRoomType(gallery.heading, roomTypes);
    if (resolution.status !== "matched") {
      warnings.push(`room "${gallery.heading}" unresolved: ${resolution.reason}`);
      return {
        heading: gallery.heading,
        sectionId: gallery.sectionId,
        roomTypeId: null,
        roomTypeName: null,
        matchedBy: null,
        unresolvedReason: resolution.reason,
        images: [],
      };
    }
    return {
      heading: gallery.heading,
      sectionId: gallery.sectionId,
      roomTypeId: resolution.roomType.id,
      roomTypeName: resolution.roomType.name,
      matchedBy: resolution.matchedBy,
      unresolvedReason: null,
      images: gallery.images.map((image) => ({
        position: image.position,
        url: image.url,
        assetId: image.assetId,
        filename: image.filename,
        alt: image.alt,
        width: image.width,
        height: image.height,
      })),
    };
  });
  return { rooms, warnings };
}