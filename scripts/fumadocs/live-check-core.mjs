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
