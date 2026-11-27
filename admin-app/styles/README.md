# Admin Portal Styles (`admin-portal/styles/`)
## Overview & Purpose

This folder houses the scoped styling foundation for the **Admin Portal** (`src/styles/admin-portal/`), mirroring the structure of `src/styles/` while keeping admin-specific design tokens, motion primitives, and variant utilities isolated from public/marketing views (such as pricing or landing pages).

Instead of rewriting styles from scratch per screen, components built for the Admin Portal pair **component-level structure/layout** (in a component's own stylesheet or CSS Module) with **scoped CSS custom properties (`--ap-*`)** and **reusable variant utility classes (`ap-*`)** defined here.

### Folder Layout

```text
src/styles/admin-portal/
├── colors.css
├── index.css
├── keyframes.css
├── README.md
├── theme.css
├── typography.css
└── utilities.css

```

---

## Naming & Scoping Convention: `.ap` & `--ap-*`

* **`.ap` selector (DOM scope):** `.ap` refers to a wrapper class on the Admin Portal root container (e.g., `<div className="ap" data-portal="ap">`), **not** the `src/styles/admin-portal/` directory name. Rule selectors like `.ap .ap-btn--primary` target `.ap-btn--primary` elements rendered *inside* an `.ap` ancestor.
* **`--ap-*` custom properties:** All CSS variables in this folder use the `--ap-` prefix so they remain clearly grouped and distinct from root `src/styles/` variables.
* **`[data-portal="ap"]` hook:** Included alongside `.ap` in scoped rules so portal containers or dynamically mounted elements can target the same styles consistently.

---

## File-by-File Guide

### `src/styles/admin-portal/colors.css`

Defines scoped color custom properties (`--ap-bg-*`, `--ap-text-*`, `--ap-border-*`, `--ap-accent-*`, `--ap-status-*`) under `.ap` and `[data-portal="ap"]` inside `@layer base`. Use these tokens rather than hardcoding raw hex values inside Admin Portal components.

### `src/styles/admin-portal/typography.css`

Defines scoped font families (`--ap-font-sans`, `--ap-font-display`, `--ap-font-mono`), type scale sizes (`--ap-text-*`), line heights (`--ap-leading-*`), and letter-spacing (`--ap-tracking-*`) under `.ap` and `[data-portal="ap"]` inside `@layer base`, along with default text styling for the Admin Portal scope.

### `src/styles/admin-portal/keyframes.css`

Defines keyframe animations for Admin Portal transitions and micro-interactions (such as `@keyframes ap-fade-in`, `@keyframes ap-slide-up-sm`, and `@keyframes ap-pulse-subtle`).

### `src/styles/admin-portal/theme.css`

Defines layout, spacing (`--ap-space-*`), container sizing (`--ap-container-max`, `--ap-gutter`), border radii (`--ap-radius-*`), border thickness, elevation (`--ap-shadow-*`), and motion timing tokens under `.ap` and `[data-portal="ap"]` inside `@layer base`, plus core structural helpers like `.ap-shell` and `.ap-container`.

### `src/styles/admin-portal/utilities.css`

Holds reusable variant utility classes (surfaces, borders, radii, buttons, and subtle motion) scoped to `.ap` / `[data-portal="ap"]` inside `@layer utilities`. Apply these classes to vary presentation (such as surface tone, corner shape, or CTA style) on top of a component's structural layout.

### `src/styles/admin-portal/index.css`

Entry point that imports the sub-files (`colors.css`, `typography.css`, `keyframes.css`, `theme.css`, `utilities.css`) in order. Import this file in the Admin Portal entry/layout rather than loading individual pieces ad hoc across unrelated pages.

---

## Cascade Order & Portals

### Cascade Order (`@layer`)

* If the root stylesheet (`src/styles/index.css`) declares cascade layers (for example `@layer base, components, utilities;`), ensure Admin Portal rules participate in the matching layers so `@layer utilities` modifiers can override base/component defaults predictably without specificity wars.
* Import `src/styles/admin-portal/index.css` in the Admin Portal layout/entry so its tokens and utility classes are available where needed without leaking overrides into non-portal pages.

### Portals (Modals, Dropdowns, Popovers, Menus, Tooltips)

* **Keyframes are global in CSS:** Even when `@keyframes` declarations live inside `src/styles/admin-portal/keyframes.css`, animation names occupy a global namespace. Always prefix animation names with `ap-` (e.g., `ap-fade-in`) to avoid collisions with `src/styles/keyframes.css` or third-party styles.
* **Portals / modals / tooltips:** If any admin dropdown, modal, popover, context menu, or tooltip renders outside `.ap` in the DOM (for example, appended directly to `document.body` via a portal), make sure that portal root also receives `className="ap"` (or `data-portal="ap"`)—or inherits/receives the `--ap-*` variables—so custom properties and `ap-*` utility variants resolve properly.

---

## Agent & Component Authoring Rules

When generating or updating Admin Portal components that reference these files:

1. **Wrap Admin Portal trees in `.ap`:** Ensure the Admin Portal shell—and any portaled modal, dropdown, popover, or menu—is mounted inside `.ap` (or carries `.ap` / `data-portal="ap"` on its portal container) so `.ap .ap-*` selectors match.
2. **Separate structure from variants:** Keep layout geometry, grid/flex arrangement, and slot structure in component-specific styles; use `ap-*` utility classes (`ap-surface-*`, `ap-bordered`, `ap-pill`, `ap-btn`, `ap-btn--primary`, `ap-animate-*`, etc.) for visual variants and modifiers.
3. **Prefer `--ap-*` tokens over raw literals:** Reference `--ap-*` variables for colors, font families/sizes/spacing, radii, and motion durations rather than hardcoding magic numbers when a token exists.
4. **Check text contrast on accent surfaces:** When pairing accent backgrounds (such as `--ap-accent-primary`) with text or icons, verify readable contrast (`--ap-text-primary` or dark text on light/amber fills; `--ap-text-inverse` on dark fills) and preserve visible `:focus-visible` outlines.
5. **Prefix new keyframes:** Any new `@keyframes` added to `keyframes.css` must use the `ap-` prefix.


## Using the `.ap` Wrapper

All scoped tokens (`--ap-*`) and utility classes (`ap-*`) in `src/styles/admin-portal/` are anchored to `.ap` and `[data-portal="ap"]`. Wrap the Admin Portal root in this class and attribute so styles apply cleanly inside the portal without leaking into other views.

### Root Portal Shell
Wrap your top-level Admin Portal container with `className="ap"` and `data-portal="ap"`:

```tsx
export function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ap ap-shell" data-portal="ap">
      <div className="ap-container">{children}</div>
    </div>
  );
}


### Tailwind v4 Variant Usage

When `src/styles/admin-portal/index.css` defines `@custom-variant ap (&:where(.ap *, [data-portal="ap"] *));`, you can use the `ap:` variant prefix on Tailwind utilities for elements inside the wrapper:

```tsx
<button type="button" className="ap:font-ap-mono ap-btn ap-btn--primary ap-pill">
  Save Changes
</button>

```

### Portals (Modals, Dropdowns, Popovers, Menus, Tooltips)

If a modal, dropdown menu, popover, context menu, or tooltip renders outside the main DOM tree via a portal (such as into `document.body`), attach `className="ap"` and `data-portal="ap"` to the portal root container as well. Without that wrapper on the portal node, `.ap .ap-*` selectors and `--ap-*` scoped variables will not resolve as expected.
