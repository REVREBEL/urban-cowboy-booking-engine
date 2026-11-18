// COW-67: room-gallery feed parsing, room-type resolution and import planning.
//
// The source is https://www.urbancowboy.com/catskills/image-feed, a Squarespace
// page. Verified 2026-11-18:
//
//   GET  /catskills/image-feed            -> 200 text/html, galleries in server HTML
//   GET  /catskills/image-feed?format=json -> 200 application/json, mainContent EMPTY
//   GET  /catskills/image-feed?format=rss  -> 400 "Unknown response format for page type"
//
// So the JSON and RSS paths carry no gallery content at all, and HTML extraction is
// the only method that preserves the room association.
//
// Each gallery section carries an explicit id:
//
//   <section id="image-feed-alpine-bathing-suite" data-sqsp-section="gallery">
//
// That id is the association contract. `parseRoomGalleryFeed` uses it when present
// and falls back to positional pairing (heading section followed by gallery section)
// for older markup that has no id.

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
  /** Every srcset candidate, canonicalised, in source order. */
  srcset: string[];
  /** True when the image carried no usable src, data-src, data-image or srcset. */
  missingSource: boolean;
}

export interface RoomGallery {
  /** Room name exactly as it appears in the heading, or derived from the slug. */
  heading: string;
  /** Section id from data-section-id. */
  sectionId: string;
  /** Room slug from id="image-feed-<slug>", when the markup provides one. */
  slug: string | null;
  /** How the room was identified. */
  extraction: "id" | "positional";
  images: GalleryImage[];
}

export interface ParseResult {
  galleries: RoomGallery[];
  warnings: string[];
}

const SECTION_RE = /<section\b([^>]*)>/gi;
const HEADING_RE = /<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/i;
const FIGURE_RE =
  /<figure\b[^>]*class="[^"]*\bgallery-grid-item\b[^"]*"[^>]*>([\s\S]*?)<\/figure>/g;
const IMG_RE = /<img\b[^>]*>/i;
const ATTR_RE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;

/** Matches the section id convention id="image-feed-<room-slug>". */
const FEED_ID_RE = /^image-feed-(.+)$/;

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
    missingSource: !url || !assetId,
  };
}

function parseFigure(figureBody: string): GalleryImage | null {
  const img = IMG_RE.exec(figureBody);
  if (!img) return null;
  return parseImage(img[0]);
}

function slugToHeading(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Extracts galleries from the feed.
 *
 * Primary path: each gallery is a `<section id="image-feed-<slug>">`. The slug in
 * that id is the room identity, so no positional guessing is needed.
 *
 * Fallback: when a section has no feed id, the heading-then-gallery pairing is used
 * and reported as `positional` so callers can tell which contract was in play.
 */
export function parseRoomGalleryFeed(html: string): ParseResult {
  const sections: { attrs: Record<string, string>; start: number; bodyStart: number; bodyEnd: number }[] = [];
  SECTION_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SECTION_RE.exec(html)) !== null) {
    sections.push({
      attrs: readAttrs(match[0]),
      start: match.index,
      bodyStart: match.index + match[0].length,
      // Filled in below once every start offset is known.
      bodyEnd: 0,
    });
  }
  sections.forEach((section, index) => {
    section.bodyEnd = index + 1 < sections.length ? sections[index + 1].start : html.length;
  });

  const warnings: string[] = [];
  const galleries: RoomGallery[] = [];
  let pendingHeading: { text: string } | null = null;

  for (const section of sections) {
    const body = html.slice(section.bodyStart, section.bodyEnd);

    FIGURE_RE.lastIndex = 0;
    const figures: string[] = [];
    let figure: RegExpExecArray | null;
    while ((figure = FIGURE_RE.exec(body)) !== null) figures.push(figure[1]);

    const feedId = section.attrs["id"] ?? "";
    const feedMatch = FEED_ID_RE.exec(feedId);
    const headingMatch = HEADING_RE.exec(body);
    const heading = headingMatch ? stripTags(headingMatch[1]) : "";

    if (figures.length === 0) {
      if (heading && !feedMatch) {
        if (pendingHeading) {
          warnings.push(
            `heading "${pendingHeading.text}" has no gallery before "${heading}"`,
          );
        }
        pendingHeading = { text: heading };
      }
      continue;
    }

    const images: GalleryImage[] = [];
    for (const figureBody of figures) {
      const image = parseFigure(figureBody);
      if (!image) {
        warnings.push(`section ${feedId || section.attrs["data-section-id"] || "?"} has a gallery figure with no img element`);
        continue;
      }
      image.position = images.length + 1;
      images.push(image);
    }

    if (images.length === 0) {
      warnings.push(`section ${feedId} has ${figures.length} figures but no usable image`);
      continue;
    }

    if (feedMatch) {
      const slug = feedMatch[1];
      galleries.push({
        heading: heading || slugToHeading(slug),
        sectionId: section.attrs["data-section-id"] ?? feedId,
        slug,
        extraction: "id",
        images,
      });
      pendingHeading = null;
      continue;
    }

    if (!heading) {
      warnings.push(`section ${section.attrs["data-section-id"] ?? "?"} has ${images.length} images but no preceding heading`);
    }
    galleries.push({
      heading: heading || pendingHeading?.text || "",
      sectionId: section.attrs["data-section-id"] ?? "",
      slug: null,
      extraction: "positional",
      images,
    });
    pendingHeading = null;
  }

  if (pendingHeading) {
    warnings.push(`heading "${pendingHeading.text}" has no gallery following it`);
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

/**
 * Aliases for gallery id slugs that do not match a room-type slug.
 *
 * The feed uses `image-feed-walden-bathing-suite-den` while the catalog room type
 * is `walden-forest-bathing-suite-with-den`. The publisher's id is shorter than the
 * catalog name, so the mapping is explicit rather than guessed.
 */
export const ROOM_SLUG_ALIASES: Record<string, string> = {
  "walden-bathing-suite-den": "walden-forest-bathing-suite-with-den",
};

function normalise(value: string): string {
  return decodeEntities(value)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type RoomResolution =
  | { status: "matched"; roomType: RoomTypeRecord; matchedBy: "id" | "name" | "slug" | "alias" }
  | { status: "unmatched"; reason: string };

/**
 * Resolves a feed gallery to exactly one room type.
 *
 * An explicit ``slug`` (from ``id="image-feed-<slug>"``) wins, because it is the
 * publisher's own identity for the gallery. Otherwise the heading is matched by
 * name, then slug, then an explicit alias. Zero or several candidates both fail:
 * this function never creates a room and never fuzzy-matches.
 */
export function resolveRoomType(
  heading: string,
  roomTypes: readonly RoomTypeRecord[],
  slug?: string | null,
): RoomResolution {
  if (slug) {
    const bySlug = roomTypes.filter((room) => room.slug === slug);
    if (bySlug.length === 1) return { status: "matched", roomType: bySlug[0], matchedBy: "id" };
    if (bySlug.length > 1) {
      return { status: "unmatched", reason: `${bySlug.length} room types share the slug "${slug}"` };
    }

    const aliasTarget = ROOM_SLUG_ALIASES[slug];
    if (aliasTarget) {
      const aliased = roomTypes.filter((room) => room.slug === aliasTarget);
      if (aliased.length === 1) return { status: "matched", roomType: aliased[0], matchedBy: "alias" };
      if (aliased.length === 0) {
        return { status: "unmatched", reason: `slug alias "${aliasTarget}" matches no room type` };
      }
      return { status: "unmatched", reason: `${aliased.length} room types match slug alias "${aliasTarget}"` };
    }

    // An id that matches no room type is not rescued by the heading: the publisher
    // named the gallery after something the catalog does not have.
    return { status: "unmatched", reason: `no room type matches gallery id slug "${slug}"` };
  }

  const normalised = normalise(heading);
  if (!normalised) return { status: "unmatched", reason: "empty heading" };

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

  const aliasTarget = ROOM_HEADING_ALIASES[heading.trim().toLowerCase()];
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
  slug: string | null;
  extraction: "id" | "positional";
  roomTypeId: string | null;
  roomTypeName: string | null;
  matchedBy: "id" | "name" | "slug" | "alias" | null;
  unresolvedReason: string | null;
  images: PlannedImage[];
}

export interface ImportPlan {
  rooms: PlannedRoom[];
  warnings: string[];
}

/**
 * Turns a parse result into a room-by-room plan. A room that does not resolve to
 * exactly one room type yields no images, so an unknown id can never create or
 * reassign a room.
 */
export function buildImportPlan(
  parsed: ParseResult,
  roomTypes: readonly RoomTypeRecord[],
): ImportPlan {
  const warnings = [...parsed.warnings];
  const rooms: PlannedRoom[] = parsed.galleries.map((gallery) => {
    const resolution = resolveRoomType(gallery.heading, roomTypes, gallery.slug);
    if (resolution.status !== "matched") {
      warnings.push(`room "${gallery.heading}" unresolved: ${resolution.reason}`);
      return {
        heading: gallery.heading,
        sectionId: gallery.sectionId,
        slug: gallery.slug,
        extraction: gallery.extraction,
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
      slug: gallery.slug,
      extraction: gallery.extraction,
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