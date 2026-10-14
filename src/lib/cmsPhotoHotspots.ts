/** Only site-local SVG paths in our checked-in public icon library are accepted. */
export function cmsIconUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const path = raw.trim().replace(/^\/+/, "").replace(/^public\//i, "");
  if (!/^assets\/icons\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\.svg$/i.test(path)) return null;
  return `/${path}`;
}

/** Stable Webflow CDN file IDs survive URL query changes and reused photos. */
export function cmsPhotoKey(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;
  if (/^[a-f0-9]{24}$/i.test(value)) return `file:${value.toLowerCase()}`;
  try {
    const url = new URL(value, "https://local-photo.invalid");
    if (url.origin === "https://local-photo.invalid" && !value.startsWith("/")) return null;
    const fileName = decodeURIComponent(url.pathname.split("/").pop() || "");
    const fileId = fileName.match(/^([a-f0-9]{24})_/i)?.[1];
    if (fileId) return `file:${fileId.toLowerCase()}`;
    if (!["https:", "http:"].includes(url.protocol)) return null;
    return `url:${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}
