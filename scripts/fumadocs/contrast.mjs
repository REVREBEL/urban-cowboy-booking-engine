// WCAG contrast helpers for docs theme tokens.
export function oklchToRgb(lightness, chroma, hueDegrees) {
  const hue = (hueDegrees * Math.PI) / 180;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l_ = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = lightness - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return linear.map((value) => {
    const encoded = value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
    return Math.max(0, Math.min(1, encoded));
  });
}

function relativeLuminance([r, g, b]) {
  const channel = (value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function wcagContrast(foreground, background) {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

export function parseOklch(value) {
  const match = /^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(value.trim());
  if (!match) throw new Error(`Unsupported OKLCH color: ${value}`);
  return oklchToRgb(Number(match[1]) / 100, Number(match[2]), Number(match[3]));
}

/** Resolve a CSS custom property chain such as var(--lake-forest-200) to a concrete value. */
export function resolveCssToken(css, token, depth = 0) {
  if (depth > 8) throw new Error(`Cyclic CSS token: ${token}`);
  const match = new RegExp(`--${token}\\s*:\\s*([^;]+);`).exec(css);
  if (!match) throw new Error(`Missing CSS token: --${token}`);
  const value = match[1].trim();
  const nested = /^var\(\s*--([a-z0-9-]+)\s*\)$/.exec(value);
  return nested ? resolveCssToken(css, nested[1], depth + 1) : value;
}

export function contrastForTokens(css, foregroundToken, backgroundToken) {
  return wcagContrast(
    parseOklch(resolveCssToken(css, foregroundToken)),
    parseOklch(resolveCssToken(css, backgroundToken)),
  );
}
