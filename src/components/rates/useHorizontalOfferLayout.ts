import { useLayoutEffect, useRef, useState } from "react";

export const HORIZONTAL_OFFER_BASE_WIDTH = 1475;
export const HORIZONTAL_OFFER_BASE_HEIGHT = 380;

/**
 * The live overlay begins in the right-side transactional zone. While the card
 * narrows, the artwork is cropped from the right and the overlay walks left.
 * Once the overlay reaches 51% of the original 1475px artboard, the cropped
 * composition scales proportionally instead of moving any farther left.
 */
const OVERLAY_BASE_LEFT = HORIZONTAL_OFFER_BASE_WIDTH * 0.66;
const OVERLAY_MIN_LEFT = HORIZONTAL_OFFER_BASE_WIDTH * 0.51;
const MAX_OVERLAY_SHIFT = OVERLAY_BASE_LEFT - OVERLAY_MIN_LEFT;
const MIN_CROPPED_VIEWPORT_WIDTH =
  HORIZONTAL_OFFER_BASE_WIDTH - MAX_OVERLAY_SHIFT;

export interface HorizontalOfferLayout {
  availableWidth: number;
  logicalViewportWidth: number;
  renderedHeight: number;
  scale: number;
  overlayShift: number;
}

export function horizontalOfferLayoutForWidth(
  availableWidth: number,
): HorizontalOfferLayout {
  const width = Math.max(
    1,
    Math.min(HORIZONTAL_OFFER_BASE_WIDTH, availableWidth || HORIZONTAL_OFFER_BASE_WIDTH),
  );

  if (width >= MIN_CROPPED_VIEWPORT_WIDTH) {
    const overlayShift = HORIZONTAL_OFFER_BASE_WIDTH - width;
    return {
      availableWidth: width,
      logicalViewportWidth: width,
      renderedHeight: HORIZONTAL_OFFER_BASE_HEIGHT,
      scale: 1,
      overlayShift,
    };
  }

  const scale = width / MIN_CROPPED_VIEWPORT_WIDTH;
  return {
    availableWidth: width,
    logicalViewportWidth: MIN_CROPPED_VIEWPORT_WIDTH,
    renderedHeight: HORIZONTAL_OFFER_BASE_HEIGHT * scale,
    scale,
    overlayShift: MAX_OVERLAY_SHIFT,
  };
}

export function useHorizontalOfferLayout<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [layout, setLayout] = useState<HorizontalOfferLayout>(() =>
    horizontalOfferLayoutForWidth(HORIZONTAL_OFFER_BASE_WIDTH),
  );

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const nextWidth = Math.min(
        HORIZONTAL_OFFER_BASE_WIDTH,
        element.getBoundingClientRect().width || HORIZONTAL_OFFER_BASE_WIDTH,
      );
      setLayout(horizontalOfferLayoutForWidth(nextWidth));
    };

    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, layout };
}
