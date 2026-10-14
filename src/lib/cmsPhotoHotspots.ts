/** Only site-local SVG paths in our checked-in public icon library are accepted. */
export function cmsIconUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const path = raw.trim().replace(/^\/+/, "").replace(/^public\//i, "");
  if (!/^assets\/icons\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\.svg$/i.test(path)) return null;
  return `/${path}`;
}

const photoKeyCache = new Map<string, string | null>();
const MAX_CACHE_SIZE = 500;

/** Stable Webflow CDN file IDs survive URL query changes and reused photos. */
export function cmsPhotoKey(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;

  const cached = photoKeyCache.get(value);
  if (cached !== undefined) return cached;

  let key: string | null = null;
  if (/^[a-f0-9]{24}$/i.test(value)) {
    key = `file:${value.toLowerCase()}`;
  } else {
    try {
      const url = new URL(value, "https://local-photo.invalid");
      if (url.origin === "https://local-photo.invalid" && !value.startsWith("/")) {
        key = null;
      } else {
        const fileName = decodeURIComponent(url.pathname.split("/").pop() || "");
        const fileId = fileName.match(/^([a-f0-9]{24})_/i)?.[1];
        if (fileId) {
          key = `file:${fileId.toLowerCase()}`;
        } else if (["https:", "http:"].includes(url.protocol)) {
          key = `url:${url.origin}${url.pathname}`;
        }
      }
    } catch {
      key = null;
    }
  }

  if (photoKeyCache.size >= MAX_CACHE_SIZE) {
    const firstKey = photoKeyCache.keys().next().value;
    if (firstKey !== undefined) photoKeyCache.delete(firstKey);
  }
  photoKeyCache.set(value, key);
  return key;
}
