## 2025-05-18 - sRGB Lookup Table and Canvas Context Reuse for Image Contrast Analysis
**Learning:** Image overlay contrast analysis sampled thousands of pixels per room card, executing `Math.pow(..., 2.4)` tens of thousands of times per image and allocating new canvas elements on every call. Precomputing sRGB-to-linear conversion in a 256-entry lookup table and reusing a shared canvas context eliminates exponential math and DOM creation overhead.
**Action:** When working with 8-bit color channels (0-255) in canvas pixel data, use a 256-element lookup table for non-linear operations like sRGB conversions and reuse shared canvas context instances.

## 2025-05-19 - Precomputed Month Cell Metadata in Date Range Pickers
**Learning:** High-frequency mouse hover events in the inline calendar picker caused re-renders that parsed ISO strings into `Date` objects (`new Date(date)`) and ran `parseInt()` string slicing for up to 84 grid cells on every frame. Precomputing structured `{ date, time, dayNum }` objects in `monthCellsCache` eliminates Date allocations and string parsing overhead during hover interactions.
**Action:** When caching calendar month grids, store pre-parsed UTC timestamps (`time`) and numeric day labels (`dayNum`) alongside ISO date strings.
