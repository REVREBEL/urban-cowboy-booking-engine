// Pure geometry for the hotspot canvas. The image is rendered with
// object-fit: contain, so pins must be mapped against the actual displayed
// rectangle, not the container or a fixed aspect ratio.
export interface Size {
  width: number;
  height: number;
}

export interface ImageRect extends Size {
  left: number;
  top: number;
}

export function containedRect(container: Size, natural: Size): ImageRect {
  if (container.width <= 0 || container.height <= 0 || natural.width <= 0 || natural.height <= 0) {
    return { left: 0, top: 0, width: container.width, height: container.height };
  }
  const scale = Math.min(container.width / natural.width, container.height / natural.height);
  const width = natural.width * scale;
  const height = natural.height * scale;
  return {
    left: (container.width - width) / 2,
    top: (container.height - height) / 2,
    width,
    height,
  };
}

/** Keyboard nudging for the placement crosshair in normalized source space. */
export function nudgePoint(
  point: { x: number; y: number },
  key: string,
  step = 0.01,
): { x: number; y: number } | null {
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  switch (key) {
    case "ArrowLeft": return { x: clamp(point.x - step), y: point.y };
    case "ArrowRight": return { x: clamp(point.x + step), y: point.y };
    case "ArrowUp": return { x: point.x, y: clamp(point.y - step) };
    case "ArrowDown": return { x: point.x, y: clamp(point.y + step) };
    default: return null;
  }
}

/** Converts a click inside the container to normalized source-space coordinates. */
export function pointToSource(point: { x: number; y: number }, rect: ImageRect): { x: number; y: number } | null {
  if (rect.width <= 0 || rect.height <= 0) return null;
  const x = (point.x - rect.left) / rect.width;
  const y = (point.y - rect.top) / rect.height;
  if (x < 0 || x > 1 || y < 0 || y > 1) return null;
  return { x, y };
}
