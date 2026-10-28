## 2025-05-18 - Modal Dialog Accessibility and Gallery Thumbnails
**Learning:** Custom modal dialogs without `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `Escape` key listeners present major barriers for screen reader and keyboard users. Additionally, image gallery thumbnail controls require explicit `type="button"`, `aria-label`, and `aria-current` attributes to properly communicate selection state to assistive technology.
**Action:** When implementing or editing modal dialogs or image galleries, always include dialog ARIA semantics, keyboard `Escape` dismissability, focus-visible outlines, and descriptive `aria-label` / `aria-current` attributes on thumbnail buttons.

## 2025-05-19 - Inline Form Action Triggers and Dynamic ARIA Feedback
**Learning:** Search popovers and inline inputs that rely solely on keypress events (like 'Enter') omit visible affordances for mouse and touch users. Furthermore, dynamic feedback messages (such as promo code application or errors) require `aria-live="polite"` containers to ensure screen readers announce status updates immediately without disrupting focus.
**Action:** When building inline input popovers, always provide an explicit, visible trigger button (e.g. 'Apply') alongside keyboard shortcuts, and ensure status feedback areas are wrapped with `aria-live="polite"`.

## 2025-05-20 - Focus Ring Visibility on Custom Option Cards and Peer Toggles
**Learning:** Custom interactive option cards and peer-checked input toggles in complex modal dialogs often omit default focus rings, creating invisible focus traps during keyboard navigation.
**Action:** Always apply explicit `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cowboy-umber focus-visible:ring-offset-2` to option card buttons and `peer-focus-visible:ring-2` to peer-checked custom toggle switches.
