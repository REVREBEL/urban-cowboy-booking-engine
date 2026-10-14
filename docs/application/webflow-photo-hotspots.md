# Webflow Photo Hotspots and Room Amenities

The Photo booking engine now reads published editorial content from the **Room Types**, **Amenities**, and **Photo Hotspots** Webflow CMS collections. Mews still controls availability, occupancy and rates.

## Existing CMS relationships

- **Room Types** collection `6abc815b36cbcba74b8b01c4`: `mews-room-type-id` connects the collection item to its Mews Room Type. `features-amenities` is a multi-reference to Amenities.
- **Amenities** collection `6abc8175a7bbdc92fa9e6599`: `short-name`, `name`, `short-description`, `long-description`, `image-path`, `image-name` and `active` drive the on-image note, the Little Comforts list and icon artwork. Paths such as `assets/icons/icons-simple/marshall_speaker.svg` resolve to `/assets/icons/icons-simple/marshall_speaker.svg` under `public/`. Raw SVG content from `icon-svg` is never injected into the page.

## New Photo Hotspots collection

Collection ID: `6acfb8250c28159487fb2aaf`. Configure the environment variable `WEBFLOW_PHOTO_HOTSPOT_COLLECTION_ID` (already present in `wrangler.toml`).

Create **one CMS item per marker on a photo**, with:

| Field | Example | Description |
| --- | --- | --- |
| Name | Alpine tub, hero image | Editorial identifier for the CMS record |
| Amenity | Copper Clawfoot Soaking Tub | Reference to the existing Amenity item |
| Photo File ID | `6ac89730346974fa55ed2a44` | Stable Webflow image `fileId`, preferably copied from the Room Type gallery asset; not a room ID |
| Photo URL | `https://cdn.prod.website-files.com/.../photo.jpg` | Alternative when the image does not have a Webflow file ID |
| X Percent | `38` | Horizontal position, 0 = left and 100 = right |
| Y Percent | `58` | Vertical position, 0 = top and 100 = bottom |
| Display Order | `1` | 1-based order for numbered medallions and mobile cards |
| Active | enabled | Only active, published markers are displayed |

Use **Photo File ID or Photo URL**; if both exist, File ID wins. The coordinates are percentages of the displayed source photograph, not browser pixels. Because photos render with their own aspect ratio, the marker stays aligned as the screen resizes.

The marker is displayed **only if** the guest's room type references the same Amenity through `features-amenities`. Reusing a photo in another room therefore never grants that room an unrelated fixture.

## Content lifecycle and behavior

1. Edit the Amenity's short and long descriptions and its local `image-path`.
2. Assign that Amenity to one or more Room Types via their existing `features-amenities` multi-reference field.
3. Add a Photo Hotspot record for each on-image detail, selecting that Amenity, photo and X/Y coordinates.
4. Set Active and **publish** all required CMS items. Draft Amenity, draft Room Type and draft Photo Hotspot records are ignored by the production Worker. Publishing the new collection's schema alone is not enough.
5. Refresh room content. The Worker has a six-hour fresh editorial cache and stale-while-revalidate behavior; a fresh deployment or cache invalidation can make newly published content visible sooner.

When Details opens, the room's published Amenity list populates the Little Comforts panel. Markers are displayed only for photos with published hotspot coordinates. Clicking a marker uses the short name and long description in the editorial detail card; mobile markers reuse the same data with numbered dots. If an icon path is invalid or the SVG file is missing, a built-in icon is used as a fallback.

No automatic coordinate guesses are made, and no Photo Hotspot items are created until their positions have been verified against the exact image.
