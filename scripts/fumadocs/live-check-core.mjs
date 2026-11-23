// COW-85 M4: small pure helpers shared by the live verifier and its tests.
// Every promised check must be able to fail — silence is never success.

export function recordCheck(failures, section, ok, detail) {
  const result = { ok, detail };
  if (!ok) failures.push(`${section}: ${detail}`);
  return result;
}

/** An image that completed but has no natural width is broken, even if it did not 404. */
export function brokenImages(images) {
  return images.filter((image) => !image.ok).map((image) => image.src ?? "(no src)");
}

/** A demo whose control is missing must be reported, not skipped. */
export function requireControl(count, name) {
  return count > 0
    ? { ok: true, detail: `${name} present` }
    : { ok: false, detail: `${name} control missing` };
}

/** Hosts the docs are allowed to redirect to. Anything else fails the check. */
export const ALLOWED_DOCS_HOSTS = Object.freeze(["cowboy-components.revrebel.io", "revrebel.github.io"]);

/**
 * A deep link must keep its path, stay on an approved host and (by default)
 * stay on HTTPS. A path-only comparison would accept an HTTP downgrade or a
 * redirect to an unrelated host.
 */
export function checkFinalUrl(finalUrl, expectedPath, { requireHttps = true } = {}) {
  let url;
  try { url = new URL(finalUrl); }
  catch { return { ok: false, detail: `invalid final URL: ${finalUrl}` }; }
  if (!ALLOWED_DOCS_HOSTS.includes(url.hostname)) {
    return { ok: false, detail: `unexpected host: ${url.hostname}` };
  }
  if (url.pathname !== expectedPath) {
    return { ok: false, detail: `path changed: ${url.pathname} (expected ${expectedPath})` };
  }
  if (requireHttps && url.protocol !== "https:") {
    return { ok: false, detail: `HTTPS downgrade: ${url.protocol}//${url.hostname}` };
  }
  return { ok: true, detail: `${url.protocol}//${url.hostname}${url.pathname}` };
}
