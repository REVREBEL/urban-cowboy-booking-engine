<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Fumadocs theme tokens are not interchangeable with the raw design tokens

`docs-app/app/globals.css` maps Fumadocs' `--color-fd-*` tokens from the brand palette in the opposite direction to the raw tokens in `src/styles/index.css`: `--color-fd-primary` is `--lake-forest` (raw `--primary-foreground`), while `--color-fd-primary-foreground` is `--paper` (raw `--primary`). When a request names raw tokens (`--primary`, `--primary-foreground`), use those literal variables in CSS rather than substituting the `fd-` equivalents.

