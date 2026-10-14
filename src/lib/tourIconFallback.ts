import type { TourIcon } from "../journey/tour.ts";

/** Final fallback when the CMS references an SVG that is not available. */
export function tourIconForTitle(title: string): TourIcon {
    const text = title.toLowerCase();
    if (text.includes('robe')) return 'robes';
    if (text.includes('marshall') || text.includes('sound')) return 'speaker';
    if (text.includes('shower')) return 'shower';
    if (text.includes('floor')) return 'floors';
    if (text.includes('desk')) return 'desk';
    if (text.includes('stove') || text.includes('fireplace')) return 'stove';
    if (text.includes('cedar') && text.includes('tub')) return 'outdoor-tub';
    if (text.includes('tub')) return 'tub';
    if (text.includes('deck') || text.includes('porch') || text.includes('balcony')) return 'balcony';
    if (text.includes('window') || text.includes('vista') || text.includes('view')) return 'window';
    if (text.includes('bed') || text.includes('headboard')) return 'bed';
    return 'seat';
}
