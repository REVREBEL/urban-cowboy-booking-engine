# W1.1 — Legacy Astro admin app: authoritative source inventory (COW-86 / COW-89)

**Source repository (read-only):** `/Users/garystringham/github-revrebel/cowboy-dashboard`
**Source snapshot:** branch `main`, HEAD `2d97d06` (inspected 2026-11-23).
**Destination:** separate `urban-cowboy-booking-engine` repo (Cloudflare Next.js admin app). No destination files were inspected or modified for this inventory.

**Method.** Every claim below was verified by reading source files in the source repository. Paths are relative to the source repo root; every item carries `path:line` evidence. Documentation files in the source repo (`PORTAL_STATUS.md`, `HOTSPOT_ARCHITECTURE_REF.md`, etc.) were **not** used as evidence of behavior. Environment variable **names** only are recorded — no values.

**Counts:** **22 route files** (8 UI pages + 14 API endpoints; 18 distinct HTTP method handlers), **17 source components** (15 top-level + 2 under `tools/`) plus a **46-file shadcn/Radix UI library**, **15 `src/lib` modules**, **8 scripts**, plus generated assets. **90 capabilities** catalogued below (`SRC-01`–`SRC-90`).

---

## Summary table — capability IDs and parity priority

Priority key: **P0** = must survive migration; **P1** = port if the receiving app owns that workflow; **P2** = candidate omission / needs confirmation (see §8).

| ID | Capability | Priority |
|----|------------|----------|
| SRC-01 | Astro SSR + Cloudflare adapter build shape | P0 |
| SRC-02 | Wrangler Worker config (no bindings/vars/cron) | P0 |
| SRC-03 | Scripts/deps/tsconfig toolchain | P0 |
| SRC-04 | Base-path (`WEBFLOW_MOUNT_PATH`) link/fetch prefixing | P0 |
| SRC-05 | DEV-only middleware `/-wf/ready` + CORS | P1 |
| SRC-06 | Static collection registry (11 collections, sort fields) | P0 |
| SRC-07 | Live collection discovery with static fallback | P1 |
| SRC-08 | Portal home collection browser | P0 |
| SRC-09 | Collection item browser (search/sort/status/empty) | P0 |
| SRC-10 | New-item page, defaults, photo-hotspot hand-off | P0 |
| SRC-11 | Edit-item page, live/staged diff banner | P0 |
| SRC-12 | Reorder page (sortField-gated) | P0 |
| SRC-13 | Tools hub (3 tool sections) | P0 |
| SRC-14 | Hotspot review page | P0 |
| SRC-15 | CMS proxy: list items (staged) | P0 |
| SRC-16 | CMS proxy: create item + auto-publish | P0 |
| SRC-17 | CMS proxy: get live item | P0 |
| SRC-18 | CMS proxy: update item + auto-publish | P0 |
| SRC-19 | CMS proxy: delete item | P0 |
| SRC-20 | CMS proxy: publish item | P1 |
| SRC-21 | CMS proxy: bulk create + publish | P1 |
| SRC-22 | CMS proxy: reorder (chunked update + publish) | P0 |
| SRC-23 | CMS proxy: collections introspection | P1 |
| SRC-24 | CMS proxy: site discovery (site token) | P2 |
| SRC-25 | CMS proxy: reference item lookup | P2 |
| SRC-26 | Re-key hotspots to replacement photo | P0 |
| SRC-27 | Hotspot sync: read-only analysis report | P0 |
| SRC-28 | Hotspot sync: curated delete execution | P0 |
| SRC-29 | Mews room-photo sync HTTP trigger | P1 |
| SRC-30 | Image upload to Webflow Assets (S3 presigned POST) | P0 |
| SRC-31 | Alt-text export (all photo fields, paginated) | P0 |
| SRC-32 | Alt-text import (batched `updateItemsLive`) | P0 |
| SRC-33 | Central Webflow client + env resolution | P0 |
| SRC-34 | Field-group organization + catch-all | P0 |
| SRC-35 | Field layout/grid rules + defensive fallback | P0 |
| SRC-36 | Photo-field config (which fields hold images) | P0 |
| SRC-37 | Client-safe hotspot utilities (asset-id matching) | P0 |
| SRC-38 | Server-only hotspot fetch/rekey helpers | P0 |
| SRC-39 | Room-type photo extraction/scoping helpers | P0 |
| SRC-40 | Sync report engine (orphans/duplicates) | P0 |
| SRC-41 | CSV encode/decode + BOM handling | P0 |
| SRC-42 | Alt-text shared types/CSV columns | P0 |
| SRC-43 | Image upload validation helper | P0 |
| SRC-44 | `ItemEditor` core form/save/delete | P0 |
| SRC-45 | Field-type renderers (PlainText→MultiReference) | P0 |
| SRC-46 | Required-field validation + auto-slug | P0 |
| SRC-47 | Async reference-option loading (display names) | P0 |
| SRC-48 | Amenity type/category filtering & grouping | P0 |
| SRC-49 | Photo-hotspot amenity scoping by room type | P0 |
| SRC-50 | Photo-hotspot auto name/slug generation | P0 |
| SRC-51 | Connected Room Types (reverse amenity editor) | P0 |
| SRC-52 | Custom section layouts (Details/Reviews/Contact/etc.) | P1 |
| SRC-53 | Feature-section icon upload + alt text | P1 |
| SRC-54 | Status banner `active` toggle | P0 |
| SRC-55 | Multi-hotspot tagger modal save/delete | P0 |
| SRC-56 | Single-image upload field | P0 |
| SRC-57 | Multi-image gallery field | P0 |
| SRC-58 | In-place photo replace + hotspot re-key | P0 |
| SRC-59 | Gallery thumbnail drag reorder | P0 |
| SRC-60 | Photo hotspot badges + Tag/Review entry points | P0 |
| SRC-61 | Amenity display-order sorting grid | P0 |
| SRC-62 | Restricted-amenities picker | P0 |
| SRC-63 | Click-to-place hotspot picker | P0 |
| SRC-64 | Multi-hotspot tagger component | P0 |
| SRC-65 | Room-photo picker (room type → photo) | P0 |
| SRC-66 | Hotspot review component | P0 |
| SRC-67 | Drag list reorder component | P0 |
| SRC-68 | Mews sync control panel UI | P1 |
| SRC-69 | Hotspot sync control panel UI | P0 |
| SRC-70 | Alt-text manager (audit/edit/CSV tabs) | P0 |
| SRC-71 | Bulk CSV alt-text importer (preview/confirm/progress) | P0 |
| SRC-72 | Client-only error boundary + toaster wrapper | P0 |
| SRC-73 | Error boundary (render errors, retry) | P0 |
| SRC-74 | shadcn/Radix UI library (46 files) | P0 |
| SRC-75 | Webflow design-token CSS + fonts | P0 |
| SRC-76 | Mews room-photo sync CLI (append/clear, dry run) | P1 |
| SRC-77 | Photo-hotspot sync CLI (dry run/apply) | P1 |
| SRC-78 | CMS doc generator scripts | P2 |
| SRC-79 | Build/push/sync shell scripts | P2 |
| SRC-80 | Draft/publish separation & unpublished-changes banner | P0 |
| SRC-81 | Keyboard/a11y behaviors | P0 |
| SRC-82 | Validation, loading/error/empty states | P0 |
| SRC-83 | Responsive layout behaviors | P0 |
| SRC-84 | No auth/session/RBAC — security gap to close | P0 |
| SRC-85 | Webflow Cloud DevLink `site-components` tree | P2 |
| SRC-86 | Blaxel volume template | P2 |
| SRC-87 | `TestComponent` dead code | P2 |
| SRC-88 | Unused API endpoints (publish/bulk/reference/discover/collections) | P2 |
| SRC-89 | Inherited framework scaffolding (README/dev script/plugin) | P2 |
| SRC-90 | Cloudflare Worker runtime incompatibilities to resolve | P0 |

---

## 1. Repo / deployment shape

### 1.1 Astro configuration — `astro.config.mjs`

- **SSR server output:** `output: 'server'` (line 53).
- **Base path:** `base: process.env.WEBFLOW_MOUNT_PATH || '/'` (line 54). All links/fetches use `baseUrl` from `src/lib/base-url.ts:1` (`import.meta.env.BASE_URL.replace(/\/$/, '')`) — a trailing-slash-stripped prefix. Migration must preserve mount-path prefixing for every link and API fetch.
- **Adapter:** `cloudflare({ platformProxy: { enabled: false } })` (lines 63–67). Platform proxy deliberately disabled; env comes from `Astro.locals.runtime.env` in production and `import.meta.env` in dev/build.
- **Integrations:** React (`react()`) + a custom dev-only script injector that injects `import "/generated/dev-only.js";` into every page **only when `command === 'dev'`** (lines 26–49, 68–71).
- **Vite:** Tailwind CSS v4 via `@tailwindcss/vite` (line 9, plugin at 73); a custom plugin that strips the Vite error-overlay "Open in editor" link from `vite/dist/client/client.mjs` (lines 11–24, 73); `optimizeDeps.include` enumerates React/Radix/form libs (lines 74–127) with `force: true`; polling file watcher for Docker with `src/site-components/**`, `*.md`, `webflow.json` ignored (lines 128–141); `resolve.dedupe: ['react','react-dom']` and production alias `react-dom/server` → `react-dom/server.edge` to avoid `node:worker_threads` `MessageChannel` polyfill needs on Workers (lines 142–156). **SRC-01, SRC-89, SRC-90**
- **Dev server:** port 3000, `host: true`, `strictPort: true` (lines 58–62). Dev overlay disabled (lines 55–57).

### 1.2 Wrangler / Worker config — `wrangler.jsonc`

- `name: "astro"`, `main: "./dist/_worker.js/index.js"`, `compatibility_date: "2025-04-15"`, `compatibility_flags: ["nodejs_compat"]` (lines 7–12).
- Static asset binding `ASSETS` → `./dist` (lines 13–16); observability enabled (lines 17–19).
- **No** `vars`, **no** `secrets` declarations, **no** D1/KV/R2 bindings, **no** service bindings, **no** `triggers/crons` (all commented placeholders only — lines 20–54). Secrets are supplied externally (`.dev.vars` locally, Worker secrets in deployment). `worker-configuration.d.ts:1-4` is an empty generated `Env` interface. **SRC-02, SRC-84**

### 1.3 Scripts and dependencies — `package.json`

- Scripts (lines 5–19): `predev` (kill-port 3000), `dev` (`astro dev`), `build` (`astro build`), `preview` (`astro build && wrangler dev`), `astro`, `cf-typegen`, `setup:repo`, `build:push`, `build:docs`, `sync:photo-hotspots` (`node --env-file=.env --experimental-strip-types scripts/sync-photo-hotspots.ts`), `sync:main`, `clean:cache`, `cleanup` (broad `rm -rf` of temp/npm caches). No `deploy` script, no test/lint script. **SRC-03, SRC-79**
- Key runtime deps (lines 20–74): `astro@5.13.5`, `@astrojs/cloudflare@12.6.7`, `@astrojs/react@4.3.0`, `react@19.1.1`, `webflow-api@3.2.0`, `@tailwindcss/vite@4.1.11`/`tailwindcss@4.1.11`, Radix primitives, `react-hook-form`, `zod`, `sonner`, `lucide-react`, `cmdk`, `recharts`, `vaul`, `date-fns`. Dev deps (75–81): `@astrojs/check`, `@cloudflare/workers-types`, `wrangler@4.26.1`, `kill-port`, `tw-animate-css`.
- `tsconfig.json`: extends `astro/tsconfigs/strict`, `jsx: react-jsx`, alias `@/* → ./src/*`, `verbatimModuleSyntax: false`, Cloudflare Workers 2023-07-01 types (lines 2–12); excludes `generated`, `src/site-components/**/*` (lines 14–23). **SRC-03**
- `components.json`: shadcn "new-york", non-RSC, Tailwind v4 CSS-first config pointing at `src/styles/global.css`, lucide icons (file lines 1–19).

### 1.4 Styling source of truth

- `src/styles/global.css:3-5` imports `tailwindcss`, `../../generated/webflow.css`, and `tw-animate-css`; `:root` and `@theme inline` map Webflow design-system variables (`--_apps---colors--*`, `--_apps---typography--*`) into semantic tokens (lines 9–90+).
- `generated/webflow.css` is Webflow-generated and overwritten by the Workbench (header lines 1–14); defines fonts (Desertrain/Uchen/Brothers) and colors. `generated/fonts.css` is a 15-byte placeholder.
- `src/layouts/main.astro:7-8` imports fonts + global CSS; lines 13–27 render `<html>`/`<head>` with no-cache meta and title "CMS Client Portal"; lines 29–60 global critical CSS. **SRC-75**

### 1.5 Cloudflare/Next.js migration hazards (source evidence)

- **Node-only child process in an API route:** `src/pages/api/cms/sync-room-photos.ts:2-5,25,44-48` calls `child_process.exec` with `cwd: process.cwd()` on a Worker request. This cannot work at runtime on Cloudflare Workers even with `nodejs_compat`; it must be re-architected (fetch-based Mews sync, queue/cron, or external runner). **SRC-90**
- **Node crypto/Buffer in upload route:** `src/pages/api/cms/upload-image.ts:2,67-69` uses `crypto.createHash('md5')` + `Buffer.from(arrayBuffer)`; port to WebCrypto/Uint8Array for Workers. **SRC-90**
- `import.meta.env.*` access is pervasive in pages/routes (e.g. `src/pages/portal/[slug].astro:16-19`); Next.js must use its own env surface plus Worker bindings. **SRC-90**
- `Astro.locals.runtime.env` is the production env source (e.g. `src/pages/api/cms/[collectionId]/[itemId].ts:27-31` via `createCmsClient`); map to Next.js `getCloudflareContext().env` or equivalent.

---

## 2. Full route map

All paths are relative to the mounted base (`WEBFLOW_MOUNT_PATH`, default `/`). **No route has an auth guard** (see §4). Data source abbreviations: **W-CMS** = Webflow CMS via `webflow-api`, **FS/script** = filesystem/child process, **local proxy** = browser fetch to `/api/cms/*`.

### 2.1 UI pages (8)

| File | Route | Purpose | HTTP | Auth | Key inputs → outputs / data source |
|------|-------|---------|------|------|------------------------------------|
| `src/pages/index.astro:7-23` | `/` | Landing page; link + 100 ms JS redirect to `/portal` | GET | none | `baseUrl` → client redirect; no data source |
| `src/pages/portal/index.astro:8-28,31-90` | `/portal` | Collection browser grid | GET | none | Reads env token/site/host (8–11); tries `getLiveCollections()` and falls back to static `COLLECTIONS` (13–28); outputs cards linking `/portal/${slug}` (66–87); Tools link at 51–59. **SRC-06, SRC-07, SRC-08** |
| `src/pages/portal/[slug].astro:15-29,31-57,61-103` | `/portal/:slug` | Item list for collection | GET | none | Static config then live collection lookup by slug (32–52); redirect `/portal` if unknown (54–57); paginated `listItemsLive` (PAGE_SIZE 100, MAX_ITEMS 2000, 68–87) sorted by `sortField` (89–97); error/empty states (179–201) |
| `src/pages/portal/[slug]/new.astro:20-27,29-57,59-97,137-147` | `/portal/:slug/new` | New-item form host | GET | none | Static collection only; throws if no token (35–37); `client.collections.get` for fields (48–54); defaults `name/slug` empty, `Switch` fields false, **`photo-hotspots.active` true** (60–74); query params `photoUrl`, `photoFileId`, `roomTypeId`, `roomTypeName` prefill hotspot fields (76–89); renders `ItemEditor` with `itemId="new"` (137–147). Note hardcoded `/portal` redirect at line 26 (not base-prefixed). **SRC-10** |
| `src/pages/portal/[slug]/[itemId].astro:16-64,70-102` | `/portal/:slug/:itemId` | Edit-item form host | GET | none | `getItemLive` (35) + `getItem` staged comparison (40–51) → `hasUnpublishedChanges` banner (85–91); `collections.get` for field schema (53–59); renders `ItemEditor` with live `fieldData` (92–101). **SRC-11, SRC-80** |
| `src/pages/portal/[slug]/reorder.astro:12-21,23-58,62-85` | `/portal/:slug/reorder` | Drag reorder host | GET | none | Redirects if no collection or no `sortField` (14–21); fetches first 100 live items, client sort (36–47); passes `ReorderList` props (75–82). **SRC-12** |
| `src/pages/portal/tools/index.astro:34-55` | `/portal/tools` | Tools hub | GET | none | Three client-only sections: Mews integration (`SyncRoomPhotos`), Photo hotspots (`SyncPhotoHotspots`), Alt text manager (`AltTextManagerClient`). **SRC-13** |
| `src/pages/portal/photo-hotspots/review.astro:8-11,43-49` | `/portal/photo-hotspots/review` | Read-only hotspot review host | GET | none | Query params `photoUrl`, `photoFileId`, `roomTypeId` (8–10) → `HotspotReview` props (43–49). **SRC-14** |

### 2.2 API endpoints (14 files, 18 handlers)

| File / route | Methods | Purpose | Auth | Key inputs → outputs; Webflow SDK calls; safety |
|--------------|---------|---------|------|--------------------------------------------------|
| `src/pages/api/cms/collections.ts` | GET | Enumerate site collections with field summaries | none | `WEBFLOW_SITE_ID` (5–13), `createCmsClient` (17); `collections.list` + per-collection `collections.get` (28–62); returns `{collections,count}` with slug/type/required/helpText/validations (36–49). Unused by app UI. **SRC-23** |
| `src/pages/api/cms/discover-site.ts` | GET | List Webflow sites | none | Requires `WEBFLOW_SITE_API_TOKEN` (5–16, distinct from CMS token); `client.sites.list()` (26); returns id/displayName/shortName/previewUrl (28–35). Unused by app UI. **SRC-24** |
| `src/pages/api/cms/[collectionId].ts:4-31` | GET | List items | none | Query `limit` (capped 100), `offset` (15–16); **`listItems` (staged, not live)** at 19; JSON passthrough. **SRC-15** |
| `src/pages/api/cms/[collectionId].ts:33-87` | POST | Create item | none | Body `{fieldData}` (45–52); `createItem` (56) then **auto-publish** new id (60–72); 201 with created item. **SRC-16** |
| `src/pages/api/cms/[collectionId]/bulk.ts` | POST | Bulk create | none | Body `{items:[{fieldData}]}` (20–37); reshaped to top-level `fieldData: []` (39–50); `createItems` then batch publish (62–72); 201. Unused by app UI (tagger uses single-item calls). **SRC-21** |
| `src/pages/api/cms/[collectionId]/reorder.ts` | POST | Bulk sort-field update | none | Body `{sortField, items:[{id,sort}]}` (21–32); chunks of 100 `updateItems` (34–49) + chunks of 100 `publishItem` (51–62); `{success,updated}` (64). **SRC-22** |
| `src/pages/api/cms/[collectionId]/[itemId].ts:4-25` | GET | Get item | none | `getItemLive` (16); 404 on error. **SRC-17** |
| `src/pages/api/cms/[collectionId]/[itemId].ts:27-76` | PATCH | Update + publish | none | Body `{fieldData}` (40); `updateItem` (45–51) + `publishItem` (54–59); 500 with `{error,details}` on failure. Used by `ItemEditor.handleSubmit` and amenity reverse-sync. **SRC-18** |
| `src/pages/api/cms/[collectionId]/[itemId].ts:78-105` | DELETE | Delete item | none | `deleteItem` (90); `{success:true}`. Destructive, no auth/dry-run. **SRC-19** |
| `src/pages/api/cms/[collectionId]/[itemId]/publish.ts` | POST | Publish item | none | `publishItem` (16–18); `{success:true}`. Unused by app UI. **SRC-20** |
| `src/pages/api/cms/reference/[itemId].ts` | GET | Reference lookup | none | Query `collectionId` required (13–19); `getItemLive` (22). Unused by app UI. **SRC-25** |
| `src/pages/api/cms/rekey-photo.ts:25-154` | POST | Re-point hotspots after photo replacement | none | Body `{roomTypeId, oldPhoto:{fileId\|url}, newPhoto:{fileId,url}}` (11–15, 38–70); falls back to 24-hex asset id extracted from URL (44–49); resolves current room-type gallery via `getItemLive` + `extractPhotosFromFieldData` (83–96), fetches **all staged + live** hotspots (98–112 via `fetchAllPhotoHotspotsWithClient`), scopes by gallery, then `rekeyHotspotsForPhoto` (114–146). Returns `updatedCount`, `warning` for no-match, per-item errors. **SRC-26** |
| `src/pages/api/cms/sync-photo-hotspots.ts:7-42` | GET | Hotspot analysis (dry run) | none | Query `skipOrphans`, `skipDuplicates`, `roomType`, `coordEpsilon` (16–29); `buildSyncReport` (24); **read-only, never deletes** (comment lines 5–6). **SRC-27** |
| `src/pages/api/cms/sync-photo-hotspots.ts:47-80` | POST | Delete curated hotspot ids | none | Body `{ids:string[]}` (57–65); `deleteHotspotItems` (67); intended to be fed by prior GET report (44–46). Destructive; UI confirms first. **SRC-28** |
| `src/pages/api/cms/sync-room-photos.ts` | POST | Trigger Mews sync script | none | Body `{write,clearEmpty,width,only}` (9–15); constructs `node scripts/sync-mews-room-photos ...` (25–30); passes env via `child_process.exec` with 60 s timeout (2–5, 33–48); returns stdout/stderr. Default `write=false` (dry run). **Runtime-incompatible with Workers.** **SRC-29, SRC-90** |
| `src/pages/api/cms/upload-image.ts` | POST | Upload image asset | none | `WEBFLOW_SITE_ID` (29–33); multipart `file` (45–50); MIME allowlist JPEG/PNG/GIF/SVG/WebP (53–56); 4 MB limit (7, 58–64); MD5 `fileHash` (66–75); `assets.create` → S3 presigned POST fields (71–108); then **polls `assets.get` up to 6×500 ms** for `hostedUrl` (9–15, 116–150); returns `{success,fileId,url,fileName}`. **SRC-30** |
| `src/pages/api/tools/alt-text/export.ts` | GET | Export all image alt text | none | Iterates `PHOTO_COLLECTIONS` (26), paginated `listItemsLive` 100/page (12, 30–37); flattens single `image` and `multiImage` fields into rows with stable keys `collectionId:itemId:fieldSlug:index` (39–98); returns `{rows, generatedAt}`. **SRC-31** |
| `src/pages/api/tools/alt-text/import.ts` | POST | Bulk apply alt text | none | Body `{updates}` (30–37); groups by collection→item→field, matches multi-image by **URL first, then index** (97–103), preserves all other field values (91, 108–111); batches 100 `updateItemsLive` (11, 128–140); returns `{updatedItems,updatedImages,skipped,errors}`. Writes live items directly. **SRC-32** |

---

## 3. Screen and editor inventory

### 3.1 Collection browser / item list / reorder

- **`src/pages/portal/index.astro`** (103 lines): live-or-static collection grid, "Tools" button, base-prefixed links. **SRC-08**
- **`src/pages/portal/[slug].astro`** (403 lines): server-rendered table with name/slug/status columns, inline JS search over `data-search-text` JSON (319–345), client-side tri-state sort toggling (347–389), Active/Inactive badge based on `active !== false && archived !== true` (246–275), "New …", conditional "Reorder" (139–149) and "Review tags" for `photo-hotspots` (150–161), empty/error states (179–201). **SRC-09**
- **`src/components/ReorderList.tsx`** (223 lines): native HTML5 drag-and-drop + up/down buttons, dirty state, POST to `/api/cms/:id/reorder` with `sortField` and zero-based index payload (81–107), toasts, empty state. **SRC-67**

### 3.2 Item editor — `src/components/ItemEditor.tsx` (**2,289 lines**, the largest component)

Core structure and capabilities (verified line-by-line):

- Props contract (82–93): `collectionId`, `collectionSlug`, `collectionName`, `itemId`, `fields`, `initialData`, `baseUrl`, optional `initialRoomTypeId`.
- State: formData, saving/deleting, error, reference options/loading, hotspot scoping, tagger state, feature-icon upload state (230–287).
- **SRC-44** Save flow `handleSubmit` (782–890): required-field validation (787–802), `POST` for `new` vs `PATCH` for existing (805–818), amenity reverse-sync after save (828–844), success toasts and 500 ms redirect back to edit page or to the originating Room Type for hotspot hand-off (846–880). Delete flow (892–927) uses `window.confirm` then `DELETE`, toast + redirect.
- **SRC-45** `renderField` (929–1474): `PlainText`/`Email`/`Phone` (single-line vs textarea, `slug` and `mews-image-ids` read-only), `RichText`, `Number`, `Bool`/`Switch`, `DateTime` (ISO normalizing), `Link` (`{url}` object), `Color` (color+text pair), `MultiImage`/array-`Image` → `MultiImageField`, single `Image` → `ImageUpload`, `Option` buttons (with color swatches from `COLOR_MAP`, 95–111), `Reference` select, `MultiReference` toggle chips, default JSON `<pre>` fallback. `state` field always rendered as a US-state dropdown (113–121, 932–961).
- **SRC-46** `generateSlug` (626–634) and auto-slug on name change (641–643); initialData backfills missing slug (466–480).
- **SRC-47** Async reference options fetched via local CMS proxy with pagination and name/type/category/image extraction (561–624); controlled-Select guards for late-loading options (1281–1289, 1301–1314); missing/chips preserved (1351–1364).
- **SRC-48** Amenity filtering: `AMENITIES_COLLECTION_ID` + `AMENITY_POLICY_TYPE_ID`, slug-based type maps (123–184); MultiReference grouped Category → Type with clean fallbacks (1373–1400, 1436–1456).
- **SRC-49** Photo-hotspot amenity scoping: resolves Room Type from hand-off or by photo matching (482–530), restricts dropdown to `features-amenities` (1270–1275, 1330–1339).
- **SRC-50** Auto name/slug for hotspots: `"RoomType - Amenity"` and `"room-type-amenity_fileId"` (532–559).
- **SRC-51** Amenities reverse editor "Connected Room Types": loads all room types (356–408), toggles (410–420), PATCHes only changed `features-amenities` arrays with `Promise.allSettled` (422–456), renders checkbox grid (2185–2226).
- **SRC-52** Bespoke group layouts: geo-fencing collapsible sections (1600–1608, 2080–2092), Visibility (1798–1807), Contact two-column with `Google Maps Link` relocated by display name (1503–1511, 1585–1591, 1808–1818), Address 3-column city/state/postal (1689–1715, 1819–1833), Social & Links two columns (1671–1687, 1834–1846), Room Types Details two-column (1618–1634, 1964–1981), Reviews 12-column with stacked Review Source (1636–1647, 1982–1999), Amenities section collapsed by default with highlight badges (1649–1652, 2000–2077), Add Ons quantity row (2114–2137), Feature Section cards (1717–1733, 1847–1963).
- **SRC-53** Feature icons: custom upload/replace/remove with per-icon loading/error state (279–314), hidden file inputs (1889–1901), alt-text input that mirrors into image value (1935–1952).
- **SRC-54** `active` field hoisted to a top status banner with tooltip (1476–1481, 1513–1540, 1546–1572).
- **SRC-55** Tagger integration: `handleTagHotspot` (649–655), amenity options from room type (657–666), prefill from existing hotspots (668–681), `handleTaggerSubmit` (683–768) creates/updates individually and deletes stale markers, refresh + toasts; dialog at 2262–2286.
- **SRC-81/SRC-82** Error banner (1574–1578), sticky footer buttons with 44 px min height (2228–2259), `ErrorBoundary` wrapper (1543).

### 3.3 Field / media components

| Component | Lines | Capability evidence |
|-----------|-------|---------------------|
| `src/components/ImageUpload.tsx` | 238 | **SRC-56**: drag/drop + click upload, MIME/size helper, alt-text field with resync on URL change (30–51), preview, remove with `window.confirm` (61–66), replace (213–231), error/uploading states. |
| `src/components/MultiImageField.tsx` | 752 | **SRC-57–SRC-60**: thumbnail grid 3/5 columns (373–505), multi-file upload with filename-derived alt (156–178), modal editor (564–735), missing-alt warning badge (422–431), hotspot badges (458–467), Tag badge (432–457), Replace action (190–297) calling `/api/cms/rekey-photo` and toasting updated count/warning, thumbnail drag reorder (309–346), keyboard `role="button"`/`Enter`/`Space` on tiles and action badges (381–400, 434–449, 468–489). |
| `src/components/RoomPhotoPicker.tsx` | 239 | **SRC-65**: loads all room types via CMS proxy (46–90), extracts photos from hero/feature/gallery via `extractPhotosFromFieldData` (92–124), search filter when >3 photos (139–141, 176–187), thumbnail selection with source labels + selected ring (200–227), `onRoomTypeChange` callback (126–133), loading/empty/error states. |
| `src/components/HotspotPicker.tsx` | 165 | **SRC-63**: click-to-place with `getBoundingClientRect` percentage conversion, clamp/round to 0.1 (14–18, 33–46), draggable marker with pointer capture (48–68), numeric X/Y inputs (125–162), image-error/no-photo empty states (116–123). |
| `src/components/MultiHotspotTagger.tsx` | 281 | **SRC-64**: click to add marker, pointer drag to reposition (76–116), per-marker amenity `Select` and remove (118–124, 227–264), validation for unassigned markers / zero markers (128–149), saved-vs-unsaved legend (162–173), responsive 2fr/1fr grid (175). |
| `src/components/HotspotReview.tsx` | 214 | **SRC-66**: loads all hotspots via client-safe helper (29–47), filters by selected photo (53–56), numbered pins with inactive styling and hover highlight (107–139), linked list with "Edit" links to `/portal/photo-hotspots/:id` (149–195), loading/error/empty/image-error states (77–90, 92–97, 142–147, 198–203). |
| `src/components/AmenitySortingGrid.tsx` | 128 | **SRC-61**: visual reorder of selected amenity tiles driving the comma-separated `amenity-display-order` field (21–26, 33–58, 64–70), icons/images with left/right buttons and `aria-label`s (98–117). |
| `src/components/RestrictedAmenitiesPicker.tsx` | 159 | **SRC-62**: toggles amenities in `restricted-amenity-ids`, tooltip explaining "restricted to photo tags" behavior (30–38, 80–103), `aria-pressed` buttons with lock icons (113–153). |
| `src/components/ErrorBoundary.tsx` | 72 | **SRC-73**: class boundary with `label`, `componentDidCatch` logging, recoverable "Try again" (26–69); explicit note that async errors are not caught (22–24). |
| `src/components/TestComponent.tsx` | 7 | **SRC-87**: unused "React is working!" placeholder; no references in `src` (grep). |

### 3.4 Tools / sync / review UI

| Component | Lines | Capability evidence |
|-----------|-------|---------------------|
| `src/components/SyncRoomPhotos.tsx` | 263 | **SRC-68**: collapsible panel, native switch (17–49) avoiding Radix duplicate-React bug, Write Mode default **true** (55), Clear Empty default false (56), width input (155–168), room filter (170–186), POST body (68–77), success/error result blocks with stdout/stderr (209–242), dry-run warning (244–250). |
| `src/components/SyncPhotoHotspots.tsx` | 333 | **SRC-69**: Run Analysis GET (58–82), selectable orphan/duplicate rows with keep/remove grouping (231–304), `window.confirm` before POST delete (96–147), local report pruning after delete (123–141), "nothing to clean up" state (238–243), progress/error/success toasts (204–229). |
| `src/components/AltTextManager.tsx` | 447 | **SRC-70**: Scan CMS → export API (49–65), stats cards (217–228), Audit & edit tab with search + All/Missing/Edited filters (230–273), inline alt edits with "Edited" badge (288–328), CSV export via Blob/BOM (71–95), CSV import into loaded rows with unmatched count (97–150), Save via import API with per-item error summary (152–192), Bulk tab delegating to `AltTextImporter` (385–392). |
| `src/components/tools/AltTextImporter.tsx` | 475 | **SRC-71**: drag/drop CSV (187–192, 286–318), compares against live export and builds preview/unmatched (92–185), checkboxes + select-all/none (194–200, 388–396), old→new diff view (398–439), confirmation `AlertDialog` with irreversibility warning (458–472), batched apply in groups of 10 with progress bar (45–47, 202–254, 364–371), error list and toasts (265–271, 373–386). |
| `src/components/tools/AltTextManagerClient.tsx` | 23 | **SRC-72**: `client:only` wrapper with `ErrorBoundary` + `Toaster` so toasts from the importer have a mount point (5–21). |

### 3.5 Shared UI library and generated assets

- `src/components/ui/*`: **46 files** — accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle-group, toggle, tooltip. shadcn/Radix "new-york" style, Tailwind v4 tokens from `global.css`. **SRC-74**
- `src/hooks/use-mobile.ts` (19 lines): mobile breakpoint hook used by sidebar UI.
- `src/site-components/**`: **594 files** (297 `.jsx` + 297 `.d.ts`) of Webflow DevLink-generated site components (e.g. `CowboyNavbar.jsx`, `RoomCard.jsx`, `AvailabilityStarter.jsx`). Excluded from TypeScript and watched-with-ignore in Astro config; not referenced by portal pages. **SRC-85**

---

## 4. Auth / session / RBAC behavior

- **There is no authentication, session, or authorization layer anywhere in the source application.** Grep across `src/**/*.{ts,tsx,astro}` finds no login, password, session, JWT, role, or user identity logic; the only cookie write is shadcn sidebar UI state (`src/components/ui/sidebar.tsx:85-86`), unrelated to security. **SRC-84**
- `src/middleware.ts:3-19` contains a single behavior: in **DEV only** (`import.meta.env.DEV`), `GET /-wf/ready` returns `{ready:true}` with `Access-Control-Allow-Origin: *` (lines 7–16); all other requests fall through to `next()` (18). It is a Webflow Workbench readiness probe, not a guard.
- **No auth guards on any UI page** (e.g. `src/pages/portal/[slug]/[itemId].astro:9-64` reads params and calls Webflow directly with no identity check) and **no auth guards on any API endpoint** (e.g. `src/pages/api/cms/[collectionId]/[itemId].ts:27-76` PATCH/DELETE only checks token presence via `createCmsClient`).
- The CMS token is a **server-side shared credential** (`WEBFLOW_CMS_API_TOKEN`, `src/lib/webflow-client.ts:29-37`); authorization is effectively "anyone who can reach the app can act as the CMS token holder." `discover-site.ts:5-16` uses a separate site token but still no caller authentication.
- Migration implication: the receiving Next.js app should add real auth/RBAC at the platform layer; this is a **new requirement**, not a port of existing behavior. Preserve the fact that API routes are internal-only in intent, but do not assume they were protected.

---

## 5. Data contracts and environment

### 5.1 Environment variable names (names only)

| Name | Used in (evidence) | Scope |
|------|--------------------|-------|
| `WEBFLOW_CMS_API_TOKEN` | `src/lib/webflow-client.ts:29-37`; all CMS API routes; portal pages (`src/pages/portal/index.astro:8-9`, `[slug].astro:16-17`, `[slug]/new.astro:30`, `[slug]/reorder.astro:23-24`, `[slug]/[itemId].astro:16`); `src/pages/api/cms/sync-room-photos.ts:38`; scripts (`scripts/refresh-cms-docs.ts:5`, `scripts/document-cms-collections.ts:3`, `scripts/sync-photo-hotspots.ts:89`) | Shared CMS token (read/write), single source of truth |
| `WEBFLOW_CMS_SITE_API_TOKEN` | `scripts/document-cms-collections.ts:3`, `scripts/refresh-cms-docs.ts:5`, `scripts/sync-photo-hotspots.ts:89` | CLI-doc/sync alias |
| `WEBFLOW_SITE_API_TOKEN` | `src/pages/api/cms/discover-site.ts:5-6` | Needed for `sites.list()` |
| `WEBFLOW_SITE_ID` | `src/pages/portal/index.astro:11`, `[slug].astro:19`, `src/pages/api/cms/collections.ts:5-6`, `src/pages/api/cms/upload-image.ts:29` | Asset uploads + collection/site listing |
| `WEBFLOW_API_HOST` | `src/lib/webflow-client.ts:43-45`; `src/pages/api/cms/discover-site.ts:18`, `sync-room-photos.ts:40`; scripts | Optional API base override |
| `WEBFLOW_ROOM_TYPE_COLLECTION_ID` | `src/pages/api/cms/sync-room-photos.ts:39` (hardcoded fallback `'6abc815b36cbcba74b8b01c4'`), `scripts/sync-mews-room-photos:52` | Room Types collection ID |
| `WEBFLOW_MOUNT_PATH` | `astro.config.mjs:54` | Base path for Webflow Cloud mount |
| `MEWS_BASE_URL` | `src/pages/api/cms/sync-room-photos.ts:35`, `scripts/sync-mews-room-photos:48` (default `https://api.mews.com`) | Mews API base |
| `MEWS_CLIENT` | `src/pages/api/cms/sync-room-photos.ts:36`, `scripts/sync-mews-room-photos:49,62` | Mews client |
| `MEWS_CONFIG_ID` | `src/pages/api/cms/sync-room-photos.ts:37`, `scripts/sync-mews-room-photos:50,63` | Mews config |
| `BASE_URL` / `import.meta.env.DEV` / `import.meta.env.PROD` | `src/lib/base-url.ts:1`; `src/middleware.ts:7`; `astro.config.mjs:151` | Framework-provided |
| `.dev.vars`, `.env` | `scripts/sync-mews-room-photos:9-34` (loads `.dev.vars`), `package.json:15` (`--env-file=.env`), `scripts/build-and-push.sh:13-17` (sources `.env`) | Local-only secret files (`.gitignore` ignores `.env*`, `.dev.vars*` — see `.gitignore:20-29`) |

Resolution precedence in `src/lib/webflow-client.ts:16-22`: `locals.runtime.env` → `import.meta.env` → `process.env`. **SRC-33**

### 5.2 Collection configuration

`src/lib/collections-config.ts:8-101` defines 11 collections with **fixed IDs** (evidence lines in file): Events (`events`, complexity complex, id `6abc810f…`, 20–26), Menu Items (`menu-items`, simple, 27–33), Locations (`locations`, core, 34–40), Offers (`offers`, complex, 41–47), Room Types (`room-types`, complex, **`sortField: 'sort'`**, 48–55), Amenities (`amenities`, simple, 56–62), Buildings (`buildings`, core, 63–69), Outlets (`outlets`, core, 70–76), Instagrams (`instagram`, core, `sortField: 'sort'`, 77–84), Add Ons (`add-ons`, simple, `sortField: 'sort'`, 85–92), Photo Hotspots (`photo-hotspots`, simple, **`sortField: 'display-order'`**, 93–100). Helpers `getCollectionBySlug`/`getCollectionById` (103–109) and `getCollectionsByComplexity` (111–124). **SRC-06**

Hardcoded collection IDs elsewhere: Photo Hotspots `6acfb8250c28159487fb2aaf` (`src/lib/photo-hotspots-utils.ts:13`), Room Types `6abc815b36cbcba74b8b01c4` (`src/lib/room-type-photos.ts:4`), Amenities `6abc8175a7bbdc92fa9e6599` (`src/lib/sync-photo-hotspots.ts:7`, `src/components/ItemEditor.tsx:128`). Amenity option IDs (Policy type, type/category label maps) are hardcoded in `src/components/ItemEditor.tsx:129-151`. These IDs must be re-validated for the destination site.

### 5.3 Field groups and layouts

- `src/lib/field-groups.ts` (471 lines): `FIELD_GROUPS` for all 11 slugs (17–421): e.g. Offers 9 groups including Domestic/International Geo-Fencing (18–91), Events 6 groups (92–136), Room Types 8 groups incl. Amenities & Policies, Images, Reviews, Integration, Settings (196–247), Photo Hotspots Basic Information/Photo/Position/Display (399–420). `organizeFieldsByGroup` (429–467) maps field objects into groups, drops duplicates, and appends **"Other Fields"** catch-all (455–464) so new CMS fields never disappear. **SRC-34**
- `src/lib/field-layouts.ts` (486 lines): `FIELD_TYPE_LAYOUTS` defaults (25–41) and `COLLECTION_LAYOUTS` rows for 11 slugs (45–407) specifying full/half/third/quarter; `getFieldRows` is defensive — unknown slugs are skipped and unmapped fields appended (427–466); `getLayoutClasses` maps to Tailwind grid spans (468–482). **SRC-35**

### 5.4 API/data shapes to preserve

- Image value: `{ url, alt, fileId? }` — single object or array (`src/lib/photo-fields-config.ts:6-7`, `src/pages/api/cms/upload-image.ts:159-171`).
- Photo Hotspot item fields: `name`, `slug`, `amenity` (reference id), `photo-url`, `photo-file-id`, `x-percent`, `y-percent`, `display-order`, `active` (`src/lib/photo-hotspots-utils.ts:28-41`, `src/lib/photo-hotspots.ts:140-153`).
- Asset-id matching: 24-hex regex; for CDN URLs the first match (shared site id) is discarded; `primaryAssetId` uses only the leading id to avoid false matches from filenames (`src/lib/photo-hotspots-utils.ts:68-111`). **SRC-37**
- Alt text row/update/result/columns contracts: `src/lib/alt-text-types.ts:3-58`; rows keyed `collectionId:itemId:fieldSlug:imageIndex|'single'` (4–5); CSV columns `collection,item_name,item_slug,item_id,field_label,field_slug,image_index,image_url,alt_text` (48–58). **SRC-42**
- Sync report/options/delete result shapes: `src/lib/sync-photo-hotspots.ts:9-47, 293-296`. **SRC-40**
- Photo-field map (which collections/fields carry images): `src/lib/photo-fields-config.ts:32-106` — Events (image-long, image), Offers (3 card images), Locations (hero-image), Room Types (images multi + hero + 2 feature images), Amenities (image), Buildings (exterior + multi-image), Outlets (hero, logo, multi-images), Instagram (image), Add Ons (image). **SRC-36**

---

## 6. Background / operational operations

- **No scheduled/cron work exists.** `wrangler.jsonc` has no `triggers`/`crons` (lines 20–54 are commented placeholders); no `scheduled` handler in source. All operational work is user-triggered from `/portal/tools` or run as CLI scripts. **SRC-02**
- **Mews room-photo sync** (`scripts/sync-mews-room-photos`, 512 lines): loads `.dev.vars` (9–34); flags `--write`, `--clear-empty`, `--width=`, `--only` (36–46); fetches Mews `configuration/get` and orders category images via `CategoryImageAssignments` (85–103, 155–209); fetches all Webflow room types, detects duplicate `mews-room-type-id` and **fails fast** (286–301); dedupes by stored `mews-image-ids` + URL image-id signature (237–251, 332–349); **append-only** by default — existing photos untouched (332–335, 419–441, 505–509); `--clear-empty` is an explicit destructive override only for rooms with zero Mews photos (353–417); default **dry run** prints `WOULD APPEND`/`WOULD CLEAR` without writes (383–392, 444–453, 499–503); `console.table` summary + exit code 1 on failures (481–512); 250 ms rate-limit delays (403, 467). **Staged-only: script explicitly says it does not publish the site (505–509).** **SRC-76**
- **Hotspot sync CLI** (`scripts/sync-photo-hotspots.ts`, 184 lines): dry-run by default; `--apply` required to delete (21–22, 75, 158–165); shares `buildSyncReport`/`deleteHotspotItems` with the portal tool (24–26, 48). **SRC-77**
- **Sync engine** (`src/lib/sync-photo-hotspots.ts`, 315 lines): fetches live room types/hotspots/amenities (60–76, 191–199), matches hotspots to photos via `primaryAssetId` (142–157), detects orphans (201–213) and duplicate clusters keyed by room type + photo + amenity with x/y epsilon (215–277), keeps oldest by `createdOn` else lowest display-order (257–264), `toDeleteIds` respects skip flags (279–290), deletes with 250 ms pacing and per-item error capture (299–315). **SRC-40**
- **Doc scripts**: `scripts/document-cms-collections.ts` (126 lines) prints site/collection/field docs to stdout (16–123); `scripts/refresh-cms-docs.ts` (66 lines) writes `cms-collections-documentation.json` from live schema (18–63); `scripts/build-master-doc.mjs` (107 lines) concatenates root Markdown into `docs/MASTER_GUIDE.md`, archiving the previous file (52–100). **SRC-78**
- **Repo scripts**: `scripts/build-and-push.sh` (127 lines) checks clean tree, builds, commits build output, enforces PR size guardrails (8–9, 74–92), pushes and optionally opens a PR with `gh` (94–125); `scripts/sync-main-to-dev.sh` (42 lines) merges `origin/main` into `dev`; `scripts/setup-repo.sh` (381 lines) configures git identity/remotes/credentials (not runtime). **SRC-79**
- **Safety properties to preserve**: dry-run default in both sync tools; explicit confirmation dialogs before destructive UI actions (`src/components/SyncPhotoHotspots.tsx:101`, `src/components/ItemEditor.tsx:896`, `src/components/ImageUpload.tsx:62`); curated-id deletion rather than blind "delete all" (`sync-photo-hotspots.ts:44-46,57-65`); graceful no-match warning rather than error in rekey (`src/pages/api/cms/rekey-photo.ts:125-145`); explicit field preservation in rekey patches (`src/lib/photo-hotspots.ts:140-153`). **SRC-87**

---

## 7. User-visible behaviors worth preserving

- **Keyboard/a11y** (SRC-81): `role="button"` + `tabIndex` + Enter/Space handlers on gallery tiles and Tag/Replace badges (`src/components/MultiImageField.tsx:381-400, 432-457, 468-489`); `role="button"` + `aria-label` on draggable hotspot markers (`src/components/HotspotPicker.tsx:100-105`, `src/components/MultiHotspotTagger.tsx:196-208`); `aria-label`s on move/reorder controls (`AmenitySortingGrid.tsx:104,113`; `ReorderList.tsx:195,207`); `aria-pressed` on restricted-amenity toggles (`RestrictedAmenitiesPicker.tsx:117`); `aria-expanded` on collapsible tool panels (`SyncRoomPhotos.tsx:97`, `SyncPhotoHotspots.tsx:157`); `role="switch"`/`aria-checked` on native toggles (`SyncRoomPhotos.tsx:36-38`); `htmlFor`/ids on labels throughout `ItemEditor`.
- **Validation** (SRC-82): required-field checks with friendly names + toast (`ItemEditor.tsx:787-802`); unassigned/zero marker validation (`MultiHotspotTagger.tsx:128-149`); image MIME + 4 MB limits enforced client and server (`src/lib/image-upload-client.ts:12-27`, `src/pages/api/cms/upload-image.ts:52-64`); CSV unmatched-row reporting (`tools/AltTextImporter.tsx:141-150, 177-179, 441-454`).
- **Loading/error/empty states** (SRC-82): collection list error/empty (`[slug].astro:179-201`), item editor error + "no fields" (`ItemEditor.tsx:1486-1495`), reference `Loading…`/`No options available` (`ItemEditor.tsx:1428-1435`), image URL failure hints (`HotspotPicker.tsx:116-123`, `MultiHotspotTagger.tsx:212-219`), hotspot review states (`HotspotReview.tsx:77-90, 142-147, 198-203`), sync/import progress and failure summaries (`SyncPhotoHotspots.tsx:204-229`; `tools/AltTextImporter.tsx:364-386`).
- **Responsive behavior** (SRC-83): ubiquitous `sm:`/`md:`/`lg:` grids and stacked-to-row headers (e.g. `[slug].astro:123-132, 205-240, 257-277`; `MultiImageField.tsx:373-375`; `tools/AltTextImporter.tsx:398-439`); `min-h-[44px]` touch targets (`[slug].astro:137,142,153,164`); `use-mobile` hook for sidebar.
- **Draft/publish separation** (SRC-80): portal edits publish immediately via create/PATCH/reorder endpoints (`src/pages/api/cms/[collectionId].ts:60-72`, `[itemId].ts:54-59`, `reorder.ts:51-62`); the item edit page compares live vs staged fieldData and warns when Webflow Designer edits are unpublished (`[itemId].astro:40-51, 85-91`); Mews sync writes staged content only (`scripts/sync-mews-room-photos:505-509`); alt-text import writes live directly (`alt-text/import.ts:128-140`); hotspot rekey patches staged + publishes (`src/lib/photo-hotspots.ts:138-171`). Audit feedback includes toasts, save results, sync stdout/stderr panels, and per-item skipped/error lists.

---

## 8. Obsolete / do-not-port candidates (need confirmation)

All items below are **candidates**, not decisions. Each has source evidence; confirm with product owner before dropping.

| ID | Candidate | Evidence | Why candidate |
|----|-----------|----------|---------------|
| SRC-85 | `src/site-components/**` (594 DevLink files) | `webflow.json:5-11` devlink rootDir; `tsconfig.json:21` excludes; `astro.config.mjs:136` ignores in watcher | Generated Webflow site components for the public marketing site; portal pages import none of them. Admin app likely does not need them. |
| SRC-86 | `blaxel.toml` | `blaxel.toml:1-4` (volume-template, directory `app`) | Inherited from a different hosting platform (Blaxel volume), not used by Wrangler/Astro config. |
| SRC-89 | README/`bootstrap.sh`/Vite overlay patch/dev script injector | `README.md:1-64` stock Astro starter; `astro.config.mjs:11-24,26-49,68-71`; `generated/dev-only.js:1-60` posts `BLAXEL_LINK_CLICKED` to Webflow Designer preview | Webflow Workbench/Blaxel-specific scaffolding; dev-only overlay patch unnecessary in Next.js. |
| SRC-87 | `src/components/TestComponent.tsx` | 7 lines; grep finds zero imports | Dead smoke-test component. |
| SRC-88 | Unused API endpoints | `publish.ts`, `bulk.ts`, `reference/[itemId].ts`, `discover-site.ts`, `collections.ts` have **no callers** outside `src/pages/api/` (grep of client code returns 0) | May be an intentional external API surface; confirm before omitting. Note `bulk.ts` is explicitly superseded by per-item tagger saves (`ItemEditor.tsx:695-699`). |
| SRC-24 | `discover-site.ts` | Uses separate `WEBFLOW_SITE_API_TOKEN` (`discover-site.ts:5-12`) | Requires an extra scope not used elsewhere; likely one-off bootstrap. |
| SRC-78/79 | Doc generators and git workflow scripts | `scripts/document-cms-collections.ts`, `refresh-cms-docs.ts`, `build-master-doc.mjs`, `build-and-push.sh`, `setup-repo.sh`, `sync-main-to-dev.sh` | Repo-maintenance tooling, not application behavior; destination may have its own. |
| SRC-52 (portion) | Webflow-specific CSS variable names / hardcoded option IDs | `ItemEditor.tsx:95-151`; `generated/webflow.css:16-40` | Must be re-mapped to destination design tokens; do not copy raw IDs blindly. |
| — | Legacy single-hotspot flow | `ItemEditor.tsx:770-780` + `HotspotReview` links to `/portal/photo-hotspots/:id`; `new.astro:76-89` hand-off still active | Comments call the multi-tagger the replacement for "old one-hotspot-per-page-navigation flow" (`ItemEditor.tsx:272-275`), yet the single-item flow is still wired. Confirm whether to keep both. |

---

## 9. Capability-to-source index (parity matrix key)

The summary table at the top is the compact scheme. This section gives the grouping needed to build the parity matrix:

- **SRC-01–05 — platform/build:** `astro.config.mjs`, `wrangler.jsonc`, `package.json`, `tsconfig.json`, `src/middleware.ts`, `src/lib/base-url.ts`.
- **SRC-06–14 — UI pages:** `src/pages/index.astro`, `src/pages/portal/**` (8 files).
- **SRC-15–32 — API endpoints:** `src/pages/api/cms/**` (12 files), `src/pages/api/tools/alt-text/**` (2 files).
- **SRC-33–43 — lib contracts/helpers:** `src/lib/**` (15 files).
- **SRC-44–55 — `ItemEditor.tsx`** (2,289 lines) capability breakdown in §3.2.
- **SRC-56–67 — field/picker/reorder components** (§3.3 table).
- **SRC-68–73 — tools components and error boundaries** (§3.4 table).
- **SRC-74–75 — shared UI + design tokens** (§3.5).
- **SRC-76–79 — scripts** (§6).
- **SRC-80–84 — cross-cutting behaviors** (§7 + §4).
- **SRC-85–90 — candidates + runtime hazards** (§8 + §1.5).

**Recommended parity-matrix columns:** `Capability ID | Source evidence | Destination route/component | Port status (port/adapt/omit) | Notes/owner`. Use the P0/P1/P2 priority from the summary table to order work; treat **SRC-84 (auth gap)** and **SRC-90 (Worker runtime incompatibilities)** as migration blockers to resolve early, and **SRC-26/SRC-27/SRC-28/SRC-58/SRC-69** (rekey + sync safety properties) as the highest-risk behavioral cluster to verify end-to-end.

---

**End of inventory.** No files in the destination repository were modified.
