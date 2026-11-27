<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Fumadocs theme tokens are not interchangeable with the raw design tokens

The docs app is a separate Fumadocs theme layer, so controls rendered by `@fumadocs/story` and `fumadocs-ui` are styled with the `--color-fd-*` tokens defined in `docs-app/app/globals.css`, not the raw `--primary` / `--primary-foreground` tokens from `src/styles/index.css`. These are inverted relative to the raw pair: `--color-fd-primary` is `--lake-forest` (raw `--primary-foreground`) and `--color-fd-primary-foreground` is `--paper` (raw `--primary`). Style docs-layer controls with the `fd-` pair — e.g. an active select option uses `--color-fd-primary` as its background and `--color-fd-primary-foreground` as its text. Use raw tokens only for components from the main project's design system.

