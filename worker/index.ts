// Worker entrypoint (modèle Workers + Static Assets).
//
//  • Les requêtes /api/mews/*  → routées vers les handlers Mews (proxy serveur :
//    le Client & les IDs établissement restent ici, jamais dans le front).
//  • Tout le reste            → servi par le binding ASSETS (front buildé dans dist/),
//    avec fallback SPA (not_found_handling = "single-page-application") pour les
//    routes client comme /confirmation.
//
// Déployé via `wrangler deploy` (compatible Cloudflare Workers Builds / Git).

import type { Env } from "./mews/_lib";
import { onRequestGet as hotelGet, onRequestPost as hotelPost } from "./mews/hotel";
import { onRequestPost as availability } from "./mews/availability";
import { onRequestPost as calendar } from "./mews/calendar";
import { onRequestPost as pricing } from "./mews/pricing";
import { onRequestPost as reservationPrice } from "./mews/reservation-price";
import { onRequestPost as reservation } from "./mews/reservation";
import { onRequestPost as reservationStatus } from "./mews/reservation-status";
import { onRequestPost as paymentLink } from "./mews/payment-link";
import { onRequestPost as voucher } from "./mews/voucher";
import { onRequestPost as track } from "./mews/track";
import { onRequestGet as geo } from "./mews/geo";
import { onRequestGet as productsDebug } from "./mews/products-debug";
import { runScheduledCalendarRefresh } from "./mews/calendar-engine";
import { onRequestGet as rateCards } from "./webflow/rate-cards";
import { policyLanguageRead } from "./content-adapters.ts";
import { addOnsRead } from "./add-on-adapter.ts";
import { onRequestGet as roomTypeReviews } from "./webflow/room-type-reviews";
import { onRequestGet as locations, onRequestStudioConfig } from "./webflow/locations";
import { onRequestGet as buildings } from "./webflow/buildings";
import { onRequestGet as contentList } from "./d1-content";
import {
  parityGet,
  snapshotGet,
  snapshotsRefresh,
  snapshotsRollback,
} from "./content-routes.ts";
import { eventOccurrences, eventPreview, eventVenues } from "./events.ts";
import { adminSiteSettingsRead, siteSettingsRead } from "./property-settings.ts";
import { dashboardPageRequest, isAdminPageRoute } from "./admin-pages.ts";
import {
  createEditorDraft,
  getEditorItem,
  listEditorItems,
  publishEditorItem,
  rollbackEditorItem,
  saveEditorDraft,
} from "./content-editor.ts";
import { eventsList, addOnsList, offersList, upgradesList } from "./d1-modules";
import { recoveryList } from "./d1-recovery";
import { analyticsSummary } from "./d1-analytics";
import { listAdminMedia, listRoomGallery, listRooms } from "./room-media.ts";
import { getRoomAmenities, listAdminAmenities } from "./room-amenities.ts";
import {
  applyHotspotReplacement,
  createRoomHotspot,
  deleteRoomHotspot,
  listRoomHotspots,
  planHotspotReplacement,
  publishRoomHotspots,
  rollbackRoomHotspots,
  updateRoomHotspot,
} from "./hotspot-admin.ts";

// Les handlers gardent la signature Pages ({ request, env, waitUntil }) — on les adapte ici.
// waitUntil permet de lancer les webhooks en tâche de fond sans bloquer la réponse.
type Ctx = { request: Request; env: Env; waitUntil: (p: Promise<unknown>) => void };
type Handler = (ctx: Ctx) => Response | Promise<Response>;
const h = (fn: unknown) => fn as Handler;

const ROUTES: Record<string, Partial<Record<string, Handler>>> = {
  hotel: { GET: h(hotelGet), POST: h(hotelPost) },
  availability: { POST: h(availability) },
  calendar: { POST: h(calendar) },
  pricing: { POST: h(pricing) },
  "reservation-price": { POST: h(reservationPrice) },
  reservation: { POST: h(reservation) },
  "reservation-status": { POST: h(reservationStatus) },
  "payment-link": { POST: h(paymentLink) },
  voucher: { POST: h(voucher) },
  track: { POST: h(track) },
  geo: { GET: h(geo) },
  "products-debug": { GET: h(productsDebug) },
  content: { GET: h(contentList) },
};

const json = (data: unknown, status: number) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

async function handleRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    // COW-68: the React admin is a separate Vite entry (dashboard.html). Serve
    // it at both readable admin routes; guest routes keep the SPA fallback.
    if (isAdminPageRoute(url.pathname)) {
      return env.ASSETS.fetch(dashboardPageRequest(request));
    }
    if (url.pathname === "/api/studio/config") {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return onRequestStudioConfig({ request, env });
    }
    if (url.pathname.match(/^\/api\/content\/policy-language\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return policyLanguageRead({ request, env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    if (url.pathname.match(/^\/api\/content\/rate-cards\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return rateCards({ env });
    }
    if (url.pathname.match(/^\/api\/content\/add-ons\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return addOnsRead({ request, env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    if (url.pathname.match(/^\/api\/content\/room-type-reviews\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return roomTypeReviews({ env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    if (url.pathname.match(/^\/api\/content\/locations\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return locations({ env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    if (url.pathname.match(/^\/api\/content\/buildings\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return buildings({ env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    if (url.pathname.match(/^\/api\/content\/site-settings\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return siteSettingsRead({ request, env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    if (url.pathname.match(/^\/api\/admin\/site-settings\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return adminSiteSettingsRead({ request, env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    if (url.pathname.match(/^\/api\/content\/items\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return contentList({ request, env });
    }
    // Editorial / publishing API. All role + tenant checks happen in the Worker.
    const editorAction = url.pathname.match(/^\/api\/content\/editor\/items\/([^/]+)\/(publish|rollback)\/?$/);
    if (editorAction) {
      if (request.method !== "POST") return json({ error: "not_found" }, 404);
      const editorCtx = { request, env, waitUntil: (p: Promise<unknown>) => ctx.waitUntil(p) };
      return editorAction[2] === "publish"
        ? publishEditorItem(editorCtx, editorAction[1])
        : rollbackEditorItem(editorCtx, editorAction[1]);
    }
    const editorItem = url.pathname.match(/^\/api\/content\/editor\/items\/([^/]+)\/?$/);
    if (editorItem) {
      const editorCtx = { request, env, waitUntil: (p: Promise<unknown>) => ctx.waitUntil(p) };
      if (request.method === "GET") return getEditorItem(editorCtx, editorItem[1]);
      if (request.method === "PATCH") return saveEditorDraft(editorCtx, editorItem[1]);
      return json({ error: "not_found" }, 404);
    }
    if (url.pathname.match(/^\/api\/content\/editor\/items\/?$/)) {
      const editorCtx = { request, env, waitUntil: (p: Promise<unknown>) => ctx.waitUntil(p) };
      if (request.method === "GET") return listEditorItems(editorCtx);
      if (request.method === "POST") return createEditorDraft(editorCtx);
      return json({ error: "not_found" }, 404);
    }
    const adminCtx = { request, env, waitUntil: (p: Promise<unknown>) => ctx.waitUntil(p) };
    // COW-84 image catalog for linking room gallery photos.
    if (url.pathname.match(/^\/api\/admin\/media\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return listAdminMedia(adminCtx);
    }
    // COW-73 amenity admin reads (writes use the admin-only content editor above).
    if (url.pathname.match(/^\/api\/admin\/amenities\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return listAdminAmenities(adminCtx);
    }
    const roomAmenities = url.pathname.match(/^\/api\/admin\/rooms\/([^/]+)\/amenities\/?$/);
    if (roomAmenities) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      let roomId: string;
      try { roomId = decodeURIComponent(roomAmenities[1]); }
      catch { return json({ error: "invalid_room_id" }, 400); }
      if (!roomId) return json({ error: "invalid_room_id" }, 400);
      return getRoomAmenities(adminCtx, roomId);
    }
    if (url.pathname.match(/^\/api\/admin\/rooms\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return listRooms(adminCtx);
    }
    const roomPhotos = url.pathname.match(/^\/api\/admin\/rooms\/([^/]+)\/photos\/?$/);
    if (roomPhotos) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      let roomId: string;
      try {
        roomId = decodeURIComponent(roomPhotos[1]);
      } catch {
        return json({ error: "invalid_room_id" }, 400);
      }
      if (!roomId) return json({ error: "invalid_room_id" }, 400);
      return listRoomGallery(adminCtx, roomId);
    }
    // COW-84 hotspot admin: specific actions before the mapping-id route.
    const hotspotAction = url.pathname.match(/^\/api\/admin\/rooms\/([^/]+)\/hotspots\/(publish|rollback|plan|apply)\/?$/);
    if (hotspotAction) {
      if (request.method !== "POST") return json({ error: "not_found" }, 404);
      let roomId: string;
      try { roomId = decodeURIComponent(hotspotAction[1]); }
      catch { return json({ error: "invalid_room_id" }, 400); }
      if (!roomId) return json({ error: "invalid_room_id" }, 400);
      const action = hotspotAction[2];
      if (action === "publish") return publishRoomHotspots(adminCtx, roomId);
      if (action === "rollback") return rollbackRoomHotspots(adminCtx, roomId);
      return action === "plan"
        ? planHotspotReplacement(adminCtx, roomId)
        : applyHotspotReplacement(adminCtx, roomId);
    }
    const hotspotMapping = url.pathname.match(/^\/api\/admin\/rooms\/([^/]+)\/hotspots\/([^/]+)\/?$/);
    if (hotspotMapping) {
      if (request.method !== "PATCH" && request.method !== "DELETE") {
        return json({ error: "not_found" }, 404);
      }
      const wantsDelete = request.method === "DELETE";
      let roomId: string;
      let mappingId: string;
      try {
        roomId = decodeURIComponent(hotspotMapping[1]);
        mappingId = decodeURIComponent(hotspotMapping[2]);
      } catch { return json({ error: "invalid_room_id" }, 400); }
      if (!roomId || !mappingId) return json({ error: "invalid_room_id" }, 400);
      return wantsDelete
        ? deleteRoomHotspot(adminCtx, roomId, mappingId)
        : updateRoomHotspot(adminCtx, roomId, mappingId);
    }
    const roomHotspots = url.pathname.match(/^\/api\/admin\/rooms\/([^/]+)\/hotspots\/?$/);
    if (roomHotspots) {
      if (request.method !== "GET" && request.method !== "POST") {
        return json({ error: "not_found" }, 404);
      }
      const wantsCreate = request.method === "POST";
      let roomId: string;
      try { roomId = decodeURIComponent(roomHotspots[1]); }
      catch { return json({ error: "invalid_room_id" }, 400); }
      if (!roomId) return json({ error: "invalid_room_id" }, 400);
      return wantsCreate
        ? createRoomHotspot(adminCtx, roomId)
        : listRoomHotspots(adminCtx, roomId);
    }
    // Specific paths first: /snapshots/rollback must not be read as a collection.
    if (url.pathname.match(/^\/api\/content\/snapshots\/rollback\/?$/)) {
      if (request.method !== "POST") return json({ error: "not_found" }, 404);
      return snapshotsRollback({ request, env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    if (url.pathname.match(/^\/api\/content\/snapshots\/?$/)) {
      if (request.method !== "POST") return json({ error: "not_found" }, 404);
      return snapshotsRefresh({ request, env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    const snapshotMatch = url.pathname.match(/^\/api\/content\/snapshots\/([a-zA-Z0-9_]+)\/?$/);
    if (snapshotMatch) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return snapshotGet({ request, env, waitUntil: (p) => ctx.waitUntil(p) }, snapshotMatch[1]);
    }
    if (url.pathname.match(/^\/api\/content\/parity\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return parityGet({ request, env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    if (url.pathname.match(/^\/api\/content\/events\/venues\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return eventVenues({ request, env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    if (url.pathname.match(/^\/api\/content\/events\/preview\/?$/)) {
      if (request.method !== "POST") return json({ error: "not_found" }, 404);
      return eventPreview({ request, env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    if (url.pathname.match(/^\/api\/content\/events\/occurrences\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return eventOccurrences({ request, env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    if (url.pathname.match(/^\/api\/content\/events\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return eventsList({ request, env });
    }
    if (url.pathname.match(/^\/api\/d1\/add-ons\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return addOnsList({ request, env });
    }
    if (url.pathname.match(/^\/api\/content\/offers\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return offersList({ request, env });
    }
    if (url.pathname.match(/^\/api\/content\/upgrades\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return upgradesList({ request, env });
    }
    if (url.pathname.match(/^\/api\/recovery\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return recoveryList({ request, env });
    }
    if (url.pathname.match(/^\/api\/analytics\/summary\/?$/)) {
      if (request.method !== "GET") return json({ error: "not_found" }, 404);
      return analyticsSummary({ request, env });
    }
    const match = url.pathname.match(/^\/api\/mews\/([a-z-]+)\/?$/);
    if (match) {
      // A Studio-originating request must never reach a live Mews handler.
      const referer = request.headers.get("Referer");
      if (referer) {
        try {
          if (["/booking/studio", "/booking/studio/"].includes(new URL(referer).pathname))
            return json({ error: "studio_live_api_disabled" }, 403);
        } catch { /* ignore malformed referer */ }
      }
      const handler = ROUTES[match[1]]?.[request.method.toUpperCase()];
      if (!handler) return json({ error: "not_found" }, 404);
      return handler({ request, env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    // Front statique + fallback SPA (géré par le binding ASSETS).
    return env.ASSETS.fetch(request);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Admin API access uses the same-origin server-side proxy in admin-app;
    // the browser never calls this Worker cross-origin with credentials.
    return handleRequest(request, env, ctx);
  },

  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      runScheduledCalendarRefresh(env, controller.scheduledTime).catch(() => undefined),
    );
  },
};
