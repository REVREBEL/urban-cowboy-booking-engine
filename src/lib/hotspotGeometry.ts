/**
 * COW-34 durable hotspot identity and geometry primitives.
 *
 * Coordinates are normalized 0..1 in the SOURCE image space of the version on
 * which the pin was authored. URLs, Webflow/Squarespace file ids and resize
 * parameters never participate in identity. Every function here is pure so the
 * replacement/crop policy can be unit-tested without D1, the network or a DOM.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CropRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type ExifOrientation = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type ReplacementDecision =
  | "url_only"
  | "exact_reupload"
  | "crop_remap"
  | "crop_review"
  | "replacement_review"
  | "duplicate_exact"
  | "duplicate_candidate";

export interface ReplacementFacts {
  /** Delivery URL, resize parameter or CDN host changed; media + placement did not. */
  urlOnly: boolean;
  /** New version has the same sha256 as the version the pins were authored on. */
  exactFile: boolean;
  orientationBefore: ExifOrientation;
  orientationAfter: ExifOrientation;
  sizeBefore: Size | null;
  sizeAfter: Size | null;
  cropBefore: CropRect | null;
  cropAfter: CropRect | null;
  /** Duplicate facts are supplied only when a binary/hash is actually available. */
  exactDuplicateOnOtherMedia?: boolean;
  phashDistance?: number | null;
}

export const clamp01 = (value: number): number =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;

/**
 * A Webflow CDN URL contains two 24-hex ids: the shared SITE id and the asset's
 * own FILE id. Dropping the first prevents the site-id collision that orphaned
 * hotspots in cowboy-dashboard. Bare ids and Squarespace URLs yield every id.
 */
export function extractWebflowAssetIds(raw: unknown): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  const value = raw.trim();
  const ids = value.match(/[a-f0-9]{24}/gi) ?? [];
  const unique = [...new Set(ids.map((id) => id.toLowerCase()))];
  if (/website-files\.com/i.test(value)) return unique.slice(1);
  return unique;
}

/** Strips query parameters and fragments so a resize variant is not a new image. */
export function normalizeDeliveryUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const url = new URL(raw.trim());
    return `${url.origin}${url.pathname}`.toLowerCase();
  } catch {
    return raw.trim().toLowerCase();
  }
}

/** EXIF display transform on unit coordinates (x, y) in 0..1. */
function displayTransform(point: Point, orientation: ExifOrientation): Point {
  const { x, y } = point;
  switch (orientation) {
    case 1: return { x, y };
    case 2: return { x: 1 - x, y };
    case 3: return { x: 1 - x, y: 1 - y };
    case 4: return { x, y: 1 - y };
    case 5: return { x: y, y: x };
    case 6: return { x: 1 - y, y: x };
    case 7: return { x: 1 - y, y: 1 - x };
    case 8: return { x: y, y: 1 - x };
  }
}

const INVERSE_ORIENTATION: Record<ExifOrientation, ExifOrientation> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 8, 7: 7, 8: 6,
};

/** Converts a point from one display orientation into another. */
export function transformOrientation(
  point: Point,
  from: ExifOrientation,
  to: ExifOrientation,
): Point {
  const stored = displayTransform(point, INVERSE_ORIENTATION[from]);
  return displayTransform(stored, to);
}

export function cropIsValid(crop: CropRect | null, source: Size | null): crop is CropRect {
  if (!crop || !source) return false;
  if (crop.width <= 0 || crop.height <= 0) return false;
  return crop.left >= 0 && crop.top >= 0 &&
    crop.left + crop.width <= source.width + 0.001 &&
    crop.top + crop.height <= source.height + 0.001;
}

/**
 * Remaps a normalized source point into a crop rectangle. Returns null when
 * the crop is unknown or out of bounds so the caller can flag it for review
 * instead of guessing coordinates.
 */
export function remapCrop(
  point: Point,
  source: Size,
  crop: CropRect | null,
): Point | null {
  if (!cropIsValid(crop, source)) return null;
  const x = (point.x * source.width - crop.left) / crop.width;
  const y = (point.y * source.height - crop.top) / crop.height;
  if (x < -0.001 || x > 1.001 || y < -0.001 || y > 1.001) return null;
  return { x: clamp01(x), y: clamp01(y) };
}

/** Crop-adjusted point as a 0..100 percentage for guest rendering. */
export function toDisplayPercent(point: Point): { x: number; y: number } {
  return { x: clamp01(point.x) * 100, y: clamp01(point.y) * 100 };
}

/** SHA-256 over supplied bytes. URL-only imports have no bytes and skip this. */
export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * 64-bit difference hash from a caller-supplied luminance grid. Callers that
 * only have a URL supply no grid; no near-duplicate is then inferred.
 */
export function perceptualHash(luminance: readonly number[], gridSize = 8): string {
  const side = gridSize;
  if (luminance.length !== side * side) {
    throw new Error(`perceptualHash expects ${side * side} luminance samples`);
  }
  const bits: string[] = [];
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side - 1; x++) {
      bits.push(luminance[y * side + x] > luminance[y * side + x + 1] ? "1" : "0");
    }
  }
  let out = "";
  for (let i = 0; i < bits.length; i += 4) {
    out += parseInt(bits.slice(i, i + 4).join(""), 2).toString(16);
  }
  return out.padStart(16, "0");
}

export function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) return Number.POSITIVE_INFINITY;
  let distance = 0;
  for (let i = 0; i < a.length; i++) {
    let xor = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

/** Near-duplicate candidates are flagged, never merged. */
export function classifyDuplicate(
  a: { sha256: string | null; phash: string | null },
  b: { sha256: string | null; phash: string | null },
): "exact" | "candidate" | "none" {
  if (a.sha256 && b.sha256 && a.sha256 === b.sha256) return "exact";
  if (a.phash && b.phash && hammingDistance(a.phash, b.phash) <= 8) return "candidate";
  return "none";
}

/**
 * The replacement policy. Order matters: a URL-only change is a no-op even if
 * stale hash facts are present; a different file with a similar hash is a
 * duplicate candidate rather than a carry-forward.
 */
export function classifyReplacement(facts: ReplacementFacts): ReplacementDecision {
  if (facts.urlOnly) return "url_only";
  if (facts.exactDuplicateOnOtherMedia) return "duplicate_exact";
  if (facts.phashDistance != null && facts.phashDistance <= 8) return "duplicate_candidate";
  if (!facts.exactFile) return "replacement_review";

  const sameSize = facts.sizeBefore && facts.sizeAfter
    ? facts.sizeBefore.width === facts.sizeAfter.width &&
      facts.sizeBefore.height === facts.sizeAfter.height
    : false;
  const orientationChanged = facts.orientationBefore !== facts.orientationAfter;

  if (sameSize && !orientationChanged) {
    const before = facts.cropBefore ?? null;
    const after = facts.cropAfter ?? null;
    const sameCrop = JSON.stringify(before) === JSON.stringify(after);
    if (sameCrop) return "exact_reupload";
    if (cropIsValid(before, facts.sizeBefore) && cropIsValid(after, facts.sizeAfter)) {
      return "crop_remap";
    }
    return "crop_review";
  }
  // Same bytes but different intrinsic geometry: the source-space meaning of
  // stored coordinates changed, so an editor must confirm the remap.
  return "crop_review";
}

/** Decisions that may reach guests without an explicit approval. */
export const AUTO_PUBLISH_DECISIONS: ReadonlySet<ReplacementDecision> = new Set([
  "url_only", "exact_reupload", "crop_remap",
]);
