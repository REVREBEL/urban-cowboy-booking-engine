## 2025-05-18 - sRGB Lookup Table and Canvas Context Reuse for Image Contrast Analysis
**Learning:** Image overlay contrast analysis sampled thousands of pixels per room card, executing `Math.pow(..., 2.4)` tens of thousands of times per image and allocating new canvas elements on every call. Precomputing sRGB-to-linear conversion in a 256-entry lookup table and reusing a shared canvas context eliminates exponential math and DOM creation overhead.
**Action:** When working with 8-bit color channels (0-255) in canvas pixel data, use a 256-element lookup table for non-linear operations like sRGB conversions and reuse shared canvas context instances.

## 2025-05-19 - Precomputed Month Cell Metadata in Date Range Pickers
**Learning:** High-frequency mouse hover events in the inline calendar picker caused re-renders that parsed ISO strings into `Date` objects (`new Date(date)`) and ran `parseInt()` string slicing for up to 84 grid cells on every frame. Precomputing structured `{ date, time, dayNum }` objects in `monthCellsCache` eliminates Date allocations and string parsing overhead during hover interactions.
**Action:** When caching calendar month grids, store pre-parsed UTC timestamps (`time`) and numeric day labels (`dayNum`) alongside ISO date strings.

## 2025-05-20 - O(1) ISO Date String Range Comparisons for Night Coverage Checks
**Learning:** Checking whether a stay covers a specific calendar night (e.g. mandatory holiday events) previously instantiated `Date` objects and iterated up to 400 times with `.setDate(+1)`. Because ISO date strings (`YYYY-MM-DD`) sort lexicographically, target night coverage across candidate stay years can be checked in $O(1)$ string comparisons with zero loop allocations.
**Action:** Avoid allocating `Date` objects in loops when evaluating date boundaries; leverage lexicographical ISO 8601 string comparisons (`targetIso >= checkIn && targetIso < checkOut`).

## 2025-10-17 - Memoizing Calendar Service Restriction Checks on Date Cell Hover
**Learning:** High-frequency mouse cursor movements in the date picker trigger component re-renders via `hoveredDate` state changes. Unmemoized full-year restriction checks (`Object.entries(dailyRates)`) created ~1,100 tuple arrays and template string allocations per frame. Memoizing the restriction check on `[dailyRates, view.year, view.month]` and pre-computing visible month prefixes eliminates garbage collection pressure during date hover interactions.
**Action:** When component re-renders are triggered by mouseover or hover state updates, ensure secondary collection scans (like full-year rate or restriction dictionaries) are memoized on view parameters.
