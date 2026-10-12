## 2025-02-16 - Accessible Custom Modal Overlays
**Learning:** Custom overlay modals built with React `<div>` elements without Radix/Dialog primitives often lack `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `Escape` keyboard shortcuts. Thumbnail gallery buttons also frequently lack `aria-current` and explicit `type="button"`.
**Action:** When working on custom modal overlays, always add proper ARIA dialog attributes, `Escape` key event listeners, and proper button attributes to gallery navigation items.
