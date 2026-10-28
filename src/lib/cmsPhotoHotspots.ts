/** Only site-local SVG paths in our checked-in public icon library are accepted. */
export function cmsIconUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const path = raw.trim().replace(/^\/+/, "").replace(/^public\//i, "");
  if (!/^assets\/icons\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\.svg$/i.test(path)) return null;
  return `/${path}`;
}

const photoKeyCache = new Map<string, string | null>();
const photoKeysCache = new Map<string, readonly string[]>();
const MAX_CACHE_SIZE = 500;

/**
 * Webflow may wrap an existing gallery asset in a newly uploaded filename,
 * leaving both the wrapper ID and the original file ID in the URL. Return all
 * embedded IDs so gallery photos can still join to hotspot records keyed by
 * the original asset.
 */
export function cmsPhotoKeys(raw: unknown): readonly string[] {
  if (typeof raw !== "string") return [];
  const value = raw.trim();
  if (!value) return [];

  const cached = photoKeysCache.get(value);
  if (cached !== undefined) return cached;

  let keys: string[] = [];
  if (/^[a-f0-9]{24}$/i.test(value)) {
    keys = [`file:${value.toLowerCase()}`];
  } else {
    try {
      const url = new URL(value, "https://local-photo.invalid");
      if (url.origin !== "https://local-photo.invalid" || value.startsWith("/")) {
        const fileName = decodeURIComponent(url.pathname.split("/").pop() || "");
        const fileIds = fileName.match(/[a-f0-9]{24}(?=_|$)/gi) ?? [];
        keys = [...new Set(fileIds.map((fileId) => `file:${fileId.toLowerCase()}`))];
        if (keys.length === 0 && ["https:", "http:"].includes(url.protocol)) {
          keys = [`url:${url.origin}${url.pathname}`];
        }
      }
    } catch {
      keys = [];
    }
  }

  if (photoKeysCache.size >= MAX_CACHE_SIZE) {
    const firstKey = photoKeysCache.keys().next().value;
    if (firstKey !== undefined) photoKeysCache.delete(firstKey);
  }
  photoKeysCache.set(value, keys);
  return keys;
}

/** Stable Webflow CDN file IDs survive URL query changes and reused photos. */
export function cmsPhotoKey(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;

  const cached = photoKeyCache.get(value);
  if (cached !== undefined) return cached;

  const key = cmsPhotoKeys(value)[0] ?? null;

  if (photoKeyCache.size >= MAX_CACHE_SIZE) {
    const firstKey = photoKeyCache.keys().next().value;
    if (firstKey !== undefined) photoKeyCache.delete(firstKey);
  }
  photoKeyCache.set(value, key);
  return key;
}
