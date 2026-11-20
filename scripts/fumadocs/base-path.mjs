// Shared Pages base-path resolution for the docs build, smoke check and tests.
export const DEFAULT_DOCS_BASE_PATH = "/urban-cowboy-booking-engine";

/** `DOCS_BASE_PATH=/` is the explicit custom-domain root selection. */
export function resolveDocsBasePath(env = process.env, options = {}) {
  if (options.isDev) return "";
  const configured = env.DOCS_BASE_PATH ?? DEFAULT_DOCS_BASE_PATH;
  if (configured === "/") return "";
  // Strip trailing slashes so concatenating with a root-relative asset path
  // never produces a double slash such as `/docs//assets/...`.
  return configured.replace(/\/+$/, "");
}
