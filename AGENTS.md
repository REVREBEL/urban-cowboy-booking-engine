### Execution Scope and Usage Efficiency

For small, localized changes such as swapping icons, adjusting styling, modifying button labels, or updating a single component:

- Inspect only the directly relevant files and dependencies.
- Reuse existing components and design tokens.
- Make the smallest necessary change.
- Do not run the full test suite unless specifically requested.
- Do not launch a browser or perform visual verification unless explicitly requested.
- Do not run production builds or restart servers for simple UI changes unless required to diagnose a reported problem.
- Avoid repeated searches, redundant file reads, and unnecessary tool calls.
- Run one targeted verification when appropriate.
- Report any additional issues without attempting unrelated fixes.
- If broader investigation becomes necessary, explain why before proceeding.

For larger features, architectural changes, integrations, and critical fixes, use the full verification workflow appropriate to the task.

**Optimize for correctness with proportional effort, not maximum activity.**
### Webflow Room Amenities and FocusAmenity

Before implementing or changing Room Type amenities, FocusAmenity hotspots, amenity icons, CMS descriptions, or photo hotspot mapping, **read [docs/application/webflow-photo-hotspots.md](docs/application/webflow-photo-hotspots.md)**, especially **“Amenity data contract and icon resolution.”**

Webflow Room Types `features-amenities` references and the Amenities collection are the source of truth for amenity membership, names, descriptions, image names and image paths. Render checked-in local SVG assets from validated CMS paths; do not create a separate hardcoded Figma icon catalog or inject CMS SVG markup. The Worker already resolves `image-name` under `assets/icons/icons-simple/` when `image-path` is blank; retrying that filename after a provided path fails is **not yet implemented**. As of this documentation, `RoomPhotoTour` on `main` still renders `FeatureFocus` for desktop pins and an inline mobile button; the `FocusAmenity` replacement is not yet its runtime call site. Distinguish requirements from existing functionality. Preserve published-only filtering, room/amenity eligibility, and photo-specific coordinates.
