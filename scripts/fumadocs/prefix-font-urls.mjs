// Prefix root-relative @font-face URLs with the deployed Pages base path.
// Handles quoted and unquoted url() forms with optional whitespace.
export function prefixFontUrls(css, basePath = "") {
  if (!basePath) return css;
  return css.replace(/url\(\s*(['"]?)\/fonts\//g, (_match, quote) =>
    `url(${quote}${basePath}/fonts/`);
}
