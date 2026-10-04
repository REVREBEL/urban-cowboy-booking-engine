export type ImageTone = "light" | "dark";

export type ImageContrastRegion =
  | "full"
  | "left-center"
  | "right-center"
  | "bottom-right"
  | {
      x: number;
      y: number;
      width: number;
      height: number;
    };

export type ImageContrastResult = {
  tone: ImageTone;
  luminance: number;
};

export type ImageContrastOptions = {
  threshold?: number;
  sampleSize?: number;
  objectFit?: "cover" | "contain";
};

const REGION_MAP: Record<
  Exclude<ImageContrastRegion, object>,
  { x: number; y: number; width: number; height: number }
> = {
  full: { x: 0, y: 0, width: 1, height: 1 },
  "left-center": { x: 0, y: 0.32, width: 0.22, height: 0.36 },
  "right-center": { x: 0.78, y: 0.32, width: 0.22, height: 0.36 },
  "bottom-right": { x: 0.68, y: 0.72, width: 0.32, height: 0.28 },
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function resolvedRegion(region: ImageContrastRegion) {
  if (typeof region === "string") return REGION_MAP[region];

  const x = clamp01(region.x);
  const y = clamp01(region.y);
  return {
    x,
    y,
    width: Math.max(0.01, Math.min(1 - x, region.width)),
    height: Math.max(0.01, Math.min(1 - y, region.height)),
  };
}

function srgbToLinear(value: number): number {
  const channel = value / 255;
  return channel <= 0.04045
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function pixelLuminance(r: number, g: number, b: number): number {
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

/**
 * Draw the image into a small analysis canvas using the same object-fit geometry
 * as the rendered image. Sampling therefore reflects the pixels actually visible
 * behind overlay controls rather than the uncropped source image.
 */
export function analyzeImageContrast(
  image: HTMLImageElement,
  region: ImageContrastRegion = "full",
  {
    threshold = 0.34,
    sampleSize = 96,
    objectFit = "cover",
  }: ImageContrastOptions = {},
): ImageContrastResult {
  if (!image.naturalWidth || !image.naturalHeight) {
    return { tone: "dark", luminance: 0 };
  }

  const canvas = document.createElement("canvas");
  canvas.width = sampleSize;
  canvas.height = sampleSize;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return { tone: "dark", luminance: 0 };

  const sourceAspect = image.naturalWidth / image.naturalHeight;
  const renderedWidth = image.clientWidth || image.naturalWidth;
  const renderedHeight = image.clientHeight || image.naturalHeight;
  const targetAspect = renderedWidth / renderedHeight;

  let sx = 0;
  let sy = 0;
  let sw = image.naturalWidth;
  let sh = image.naturalHeight;

  if (objectFit === "cover") {
    if (sourceAspect > targetAspect) {
      sw = image.naturalHeight * targetAspect;
      sx = (image.naturalWidth - sw) / 2;
    } else {
      sh = image.naturalWidth / targetAspect;
      sy = (image.naturalHeight - sh) / 2;
    }
  }

  context.drawImage(
    image,
    sx,
    sy,
    sw,
    sh,
    0,
    0,
    sampleSize,
    sampleSize,
  );

  const target = resolvedRegion(region);
  const x = Math.floor(target.x * sampleSize);
  const y = Math.floor(target.y * sampleSize);
  const width = Math.max(1, Math.ceil(target.width * sampleSize));
  const height = Math.max(1, Math.ceil(target.height * sampleSize));

  let data: Uint8ClampedArray;
  try {
    data = context.getImageData(
      x,
      y,
      Math.min(width, sampleSize - x),
      Math.min(height, sampleSize - y),
    ).data;
  } catch {
    // Cross-origin images without canvas permission can still render normally.
    // Fail safe to "dark" so overlay controls use the light design token.
    return { tone: "dark", luminance: 0 };
  }

  let luminanceTotal = 0;
  let samples = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    luminanceTotal += pixelLuminance(data[i], data[i + 1], data[i + 2]);
    samples += 1;
  }

  const luminance = samples ? luminanceTotal / samples : 0;

  return {
    luminance,
    tone: luminance > threshold ? "light" : "dark",
  };
}

export function contrastTokenForTone(tone: ImageTone): string {
  return tone === "dark"
    ? "var(--icon-color-light)"
    : "var(--icon-color-dark)";
}

export function imageContrastColor(
  image: HTMLImageElement,
  region: ImageContrastRegion = "full",
  options?: ImageContrastOptions,
): string {
  return contrastTokenForTone(analyzeImageContrast(image, region, options).tone);
}
