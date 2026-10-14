/**
 * Original Lovable visual-booking-flow RoomsStep, adapted to canonical Mews
 * availability. Preserves sticky building/feature filters, mobile filter
 * sheet, sorting, photo/index toggle, and full-frame RoomPhotoTour.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { RoomPhotoTour } from "./RoomPhotoTour";
import { PhotoTourArrow } from "./PhotoTourArrow";
import { Button } from "../components/ui/button";
import { Pill, PillButton } from "../components/ui/pill";
import { toPhotoTourRoom } from "../data/photoTourRooms";
import type { ShapedRoom } from "../types/mews";
import type { RoomTypeCmsGalleryMap } from "../types/room-type-cms";
import type { RoomTypeCmsAmenityMap, CmsPhotoHotspotMap } from "../types/photo-hotspot-cms";
import { photoGalleryForRoom, studioEditorialRoomTypeId, type PhotoSource } from "../data/photoGalleries";
import type { Feature, MatchProfile } from "./data";

const label = "font-label text-[11px] uppercase tracking-[0.22em]";
const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const FEATURE_LABEL: Record<Feature, string> = {
  "indoor-tub": "Tub by the window", "outdoor-tub": "Soak outside",
  fireplace: "Fire or wood stove", view: "Big views", gather: "Space to gather",
  balcony: "Private deck", accessible: "Step-free access",
};
type Sort = "match" | "price-asc" | "price-desc" | "size";

/**
 * Each desktop filter group owns its own scroll position. Measure both the
 * viewport and its pills so arrows update when the viewport or fonts resize.
 */
function useHorizontalFilterStrip(itemsKey: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const update = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    const next = {
      left: element.scrollLeft > 2,
      right: element.scrollWidth - element.clientWidth - element.scrollLeft > 2,
    };
    setEdges((previous) =>
      previous.left === next.left && previous.right === next.right ? previous : next,
    );
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    let active = true;
    void document.fonts?.ready.then(() => { if (active) update(); });
    update();
    return () => { active = false; observer.disconnect(); };
  }, [itemsKey, update]);

  const scroll = (direction: -1 | 1) => {
    const element = ref.current;
    if (!element) return;
    element.scrollBy({
      left: direction * Math.max(140, Math.round(element.clientWidth * 0.75)),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  return { ref, edges, update, scroll };
}


export function PhotoRooms({ profile, rooms, imageBaseUrl, galleries, cmsAmenities = {}, cmsHotspots = {}, photoSource = "webflow", children, onChoose, onEditJournal }: { profile: MatchProfile | null; rooms: ShapedRoom[]; imageBaseUrl: string; galleries: RoomTypeCmsGalleryMap; cmsAmenities?: RoomTypeCmsAmenityMap; cmsHotspots?: CmsPhotoHotspotMap; photoSource?: PhotoSource; guests: number; children: number; onChoose: (r: ShapedRoom) => void; onEditJournal: () => void }) {
  const [building, setBuilding] = useState<string>("all");
  const [features, setFeatures] = useState<Feature[]>([]);
  const [sort, setSort] = useState<Sort>(profile ? "match" : "price-asc");
  const [sortOpen, setSortOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"spreads" | "index">("spreads");
  useEffect(() => {
    if (!sortOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (!sortMenuRef.current?.contains(event.target as Node)) setSortOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSortOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [sortOpen]);

  const [detail, setDetail] = useState<string | null>(null);
  const roomStage = useRef<HTMLElement>(null);
  const filterOverlay = useRef<HTMLDivElement>(null);
  const roomScrollFrame = useRef<number | null>(null);
  const lastWheelNavigation = useRef(0);

  const cancelRoomScroll = useCallback(() => {
    if (roomScrollFrame.current !== null) {
      window.cancelAnimationFrame(roomScrollFrame.current);
      roomScrollFrame.current = null;
    }
    document.documentElement.classList.remove("j-room-scroll-animating");
  }, []);

  // Navigation can be interrupted by a normal wheel/touch gesture.
  useEffect(() => {
    window.addEventListener("touchstart", cancelRoomScroll, { passive: true });
    return () => {
      window.removeEventListener("touchstart", cancelRoomScroll);
      cancelRoomScroll();
    };
  }, [cancelRoomScroll]);


  useEffect(() => {
    const stage = roomStage.current;
    const filters = filterOverlay.current;
    if (!stage || !filters) return;
    const measure = () => stage.style.setProperty('--j-room-top', `${64 + filters.getBoundingClientRect().height + 12}px`);
    const observer = new ResizeObserver(measure);
    observer.observe(filters);
    measure();
    return () => observer.disconnect();
  }, []);

  const scored = useMemo(() => rooms.map((source) => {
    const room = toPhotoTourRoom(source, imageBaseUrl, photoGalleryForRoom(source.roomTypeId, galleries), photoSource, cmsAmenities[studioEditorialRoomTypeId(source.roomTypeId)] ?? []);
    const excludedBy =
      source.rates.length === 0 ? "Unavailable for these dates" :
      // The shaped capacity is a bed count, not guest occupancy. Mews availability
      // already validates the requested adults and children for each room type.
      children > 0 && source.merchandising?.agePolicy === "adultsOnly21" ? "Guests 21+ only" :
      profile?.dog && source.merchandising?.dogPolicy !== "allowed" ? "No dogs" :
      null;
    const matched = profile?.mustHaves.filter(feature => room.features.includes(feature)).length ?? 0;
    const underBudget = profile?.budget !== undefined && room.basePrice <= profile.budget ? 1 : 0;
    return { room, source, excludedBy, score: matched * 100 + underBudget };
  }), [rooms, imageBaseUrl, galleries, cmsAmenities, photoSource, children, profile]);

  const filterRooms = (b: string, fs: Feature[], s: Sort) => scored
    .filter((m) => !m.excludedBy)
    .filter((m) => b === "all" || m.room.building === b)
    .filter((m) => fs.every((f) => m.room.features.includes(f)))
    .sort((a, c) =>
      s === "match" ? c.score - a.score : s === "price-asc" ? a.room.basePrice - c.room.basePrice : s === "price-desc" ? c.room.basePrice - a.room.basePrice : c.room.squareFeet - a.room.squareFeet,
    );
  const list = filterRooms(building, features, sort);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState({ building, features, sort, view });
  const openSheet = () => { setDraft({ building, features, sort, view }); setSheetOpen(true); };
  const applySheet = () => { setBuilding(draft.building); setFeatures(draft.features); setSort(draft.sort); setView(draft.view); setSheetOpen(false); };
  const draftCount = filterRooms(draft.building, draft.features, draft.sort).length;
  const activeFilters = (building === "all" ? 0 : 1) + features.length;
  useEffect(() => {
    if (!sheetOpen) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setSheetOpen(false); };
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [sheetOpen]);
  const hidden = scored.filter((m) => m.excludedBy).length;
  const hasSizeData = scored.some(m => m.room.squareFeet > 0);
  const buildings = useMemo(() => ["all", ...new Set(scored.map(m => m.room.building))], [scored]);
  const buildingStrip = useHorizontalFilterStrip(buildings.join("|"));
  const featureStrip = useHorizontalFilterStrip("feature-options");
  useEffect(() => {
    buildingStrip.ref.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [building]);

  const visitRoom = (index: number) => {
    const target = list[index];
    if (!target) return;
    const section = document.getElementById(`tour-${target.room.id}`);
    if (!section) return;
    setDetail(null);
    cancelRoomScroll();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.scrollIntoView({ behavior: "instant", block: "start" });
      return;
    }

    // Ease the viewport between full-height rooms instead of jumping to the
    // next image. Respect the fixed filters and the room's scroll-margin-top.
    const start = window.scrollY;
    const offset = Number.parseFloat(window.getComputedStyle(section).scrollMarginTop) || 0;
    const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const limit = Math.max(0, height - window.innerHeight);
    const end = Math.min(limit, Math.max(0, start + section.getBoundingClientRect().top - offset));
    if (Math.abs(end - start) < 2) return;

    // Native CSS scroll snap can interrupt every animation frame and make the
    // room change feel abrupt. Temporarily suspend it only for guided navigation.
    document.documentElement.classList.add("j-room-scroll-animating");
    const startedAt = performance.now();
    const duration = 1250;
    const animate = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / duration);
      // Smooth fifth-order ease: gentle launch and long soft arrival.
      const eased = progress < 0.5
        ? 16 * Math.pow(progress, 5)
        : 1 - Math.pow(-2 * progress + 2, 5) / 2;
      window.scrollTo({ top: start + (end - start) * eased, behavior: "instant" });
      if (progress < 1) {
        roomScrollFrame.current = window.requestAnimationFrame(animate);
      } else {
        roomScrollFrame.current = null;
        document.documentElement.classList.remove("j-room-scroll-animating");
      }
    };
    roomScrollFrame.current = window.requestAnimationFrame(animate);
  };

  // Route desktop wheel gestures through the same guided easing as the room arrows.
  // Native wheel scrolling plus CSS snap was bypassing the animated navigation.
  useEffect(() => {
    if (view !== "spreads" || window.matchMedia("(max-width: 639px)").matches) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (!(event.target instanceof Element)) return;
      if (event.target.closest("button, select, input, textarea, [data-tour-panel], .j-room-filters, .j-tour-details")) return;
      const stage = roomStage.current;
      if (!stage?.contains(event.target)) return;
      const offset = Number.parseFloat(getComputedStyle(stage).getPropertyValue("--j-room-top")) || 160;
      const sections = list.map((item) => document.getElementById(`tour-${item.room.id}`)).filter((node): node is HTMLElement => Boolean(node));
      if (!sections.length) return;
      const current = sections.reduce((best, section, index) =>
        Math.abs(section.getBoundingClientRect().top - offset) < Math.abs(sections[best].getBoundingClientRect().top - offset) ? index : best, 0);
      const next = current + (event.deltaY > 0 ? 1 : -1);
      if (next < 0 || next >= sections.length) return;
      event.preventDefault();
      const now = performance.now();
      if (now - lastWheelNavigation.current < 1300) return;
      lastWheelNavigation.current = now;
      visitRoom(next);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [view, list]);

  return (
    <section ref={roomStage} className="j-room-stage pb-24">
      {/* Floating filter overlay */}
      <div ref={filterOverlay} className="j-room-filters sticky top-16 z-30 mx-auto max-w-[1600px] px-3 pt-2 sm:px-6">
        <div className="flex items-center gap-2 rounded-2xl bg-smoke/85 p-2 backdrop-blur-md sm:hidden">
          <Button type="button" variant="outline" colorScheme="paper" size="xsmall" onClick={openSheet} aria-haspopup="dialog" aria-expanded={sheetOpen}
            className="gap-2 rounded-full">
            <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters
            {activeFilters > 0 && <Pill colorScheme="alpine-linen" size="small" style={{ minWidth: "20px", height: "20px", padding: "0 4px" }}>{activeFilters}</Pill>}
          </Button>
          <p className="min-w-0 flex-1 truncate text-right text-xs text-paper/75">
            {building === "all" ? "All buildings" : building} · {view === "spreads" ? "Photo View" : "Multi Room View"}
          </p>
        </div>
        {sheetOpen && (
          <div className="fixed inset-0 z-50 sm:hidden" role="dialog" aria-modal="true" aria-label="Filter rooms">
            <Button type="button" variant="transparent" colorScheme="smoke" size="xsmall" aria-label="Close filters" className="absolute inset-0" style={{ padding: 0, backgroundColor: "rgb(52 56 51 / 70%)", borderRadius: 0 }} onClick={() => setSheetOpen(false)} />
            <div className="j-sheet absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-paper p-5 pb-6 text-foreground">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-foreground/20" />
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl leading-none">Filter rooms</h2>
                <Button type="button" aria-label="Close filters" onClick={() => setSheetOpen(false)} variant="transparent" colorScheme="lake-forest" size="xsmall" className="size-11 rounded-full" style={{ padding: 0 }}><X className="h-5 w-5" /></Button>
              </div>
              <p className={`${label} mt-5 text-foreground/60`}>Building</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {buildings.map((b) => (
                  <PillButton key={b} type="button" pressed={draft.building === b} variant={draft.building === b ? "filled" : "outline"} colorScheme="lake-forest" onClick={() => setDraft({ ...draft, building: b })}
                    className="text-sm">
                    {b === "all" ? "All buildings" : b}
                  </PillButton>
                ))}
              </div>
              <p className={`${label} mt-5 text-foreground/60`}>Must have</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["indoor-tub", "outdoor-tub", "fireplace", "gather"] as Feature[]).map((f) => {
                  const on = draft.features.includes(f);
                  return (
                    <PillButton key={f} type="button" pressed={on} variant={on ? "filled" : "outline"} colorScheme={on ? "alpine-linen" : "lake-forest"} onClick={() => setDraft({ ...draft, features: on ? draft.features.filter((x) => x !== f) : [...draft.features, f] })}
                      className="text-sm">
                      {FEATURE_LABEL[f]}
                    </PillButton>
                  );
                })}
              </div>
              <p className={`${label} mt-5 text-foreground/60`}>Sort by</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {([...(profile ? [["match", "Best match"]] : []), ["price-asc", "Price: low"], ["price-desc", "Price: high"], ...(hasSizeData ? [["size", "Most space"] as [Sort, string]] : [])] as [Sort, string][]).map(([v, t]) => (
                  <Button key={v} type="button" variant={draft.sort === v ? "filled" : "outline"} colorScheme="lake-forest" size="xsmall" aria-pressed={draft.sort === v} onClick={() => setDraft({ ...draft, sort: v })}
                    className="w-full">{t}</Button>
                ))}
              </div>
              <p className={`${label} mt-5 text-foreground/60`}>View</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["spreads", "index"] as const).map((v) => (
                  <Button key={v} type="button" variant={draft.view === v ? "filled" : "outline"} colorScheme="lake-forest" size="xsmall" aria-pressed={draft.view === v} onClick={() => setDraft({ ...draft, view: v })}
                    className="w-full">{v === "spreads" ? "Photo View" : "Multi Room View"}</Button>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Button type="button" variant="outline" colorScheme="lake-forest" size="small" className="rounded-full" onClick={() => setDraft({ ...draft, building: "all", features: [] })}>Clear</Button>
                <Button type="button" disabled={draftCount === 0} variant="filled" colorScheme="alpine-linen" size="small" className="flex-1 rounded-full" onClick={applySheet}>
                  {draftCount === 0 ? "No rooms match" : `Show ${draftCount} room${draftCount === 1 ? "" : "s"}`}
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="j-photo-filter-desktop hidden rounded-2xl bg-smoke/85 py-2 backdrop-blur-md sm:block">
          <div className="j-photo-filter-pair">
            <div role="group" aria-label="Buildings" className="j-photo-filter-segment">
              <Button type="button" variant="transparent" colorScheme="paper" size="xsmall"
                aria-label="Scroll buildings left" aria-controls="photo-building-options"
                disabled={!buildingStrip.edges.left} onClick={() => buildingStrip.scroll(-1)}
                className={`j-photo-filter-nav ${!buildingStrip.edges.left ? "is-hidden" : ""}`} style={{ width: 30, height: 30, padding: 0 }}>
                <PhotoTourArrow direction="left" size={16} chevron />
              </Button>
              <div id="photo-building-options" ref={buildingStrip.ref} onScroll={buildingStrip.update}
                className="j-photo-filter-strip no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto">
                {buildings.map((b) => (
                  <PillButton key={b} type="button" pressed={building === b} variant={building === b ? "filled" : "transparent"} colorScheme="paper" size="xsmall" onClick={() => setBuilding(b)}
                    className="shrink-0">
                    {b === "all" ? "All buildings" : b}
                  </PillButton>
                ))}
              </div>
              <Button type="button" variant="transparent" colorScheme="paper" size="xsmall"
                aria-label="Scroll buildings right" aria-controls="photo-building-options"
                disabled={!buildingStrip.edges.right} onClick={() => buildingStrip.scroll(1)}
                className={`j-photo-filter-nav ${!buildingStrip.edges.right ? "is-hidden" : ""}`} style={{ width: 30, height: 30, padding: 0 }}>
                <PhotoTourArrow direction="right" size={16} chevron />
              </Button>
            </div>
            <div role="group" aria-label="Features" className="j-photo-filter-segment">
              <Button type="button" variant="transparent" colorScheme="paper" size="xsmall"
                aria-label="Scroll features left" aria-controls="photo-feature-options"
                disabled={!featureStrip.edges.left} onClick={() => featureStrip.scroll(-1)}
                className={`j-photo-filter-nav ${!featureStrip.edges.left ? "is-hidden" : ""}`} style={{ width: 30, height: 30, padding: 0 }}>
                <PhotoTourArrow direction="left" size={16} chevron />
              </Button>
              <div id="photo-feature-options" ref={featureStrip.ref} onScroll={featureStrip.update}
                className="j-photo-filter-strip no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto">
                {(["indoor-tub", "outdoor-tub", "fireplace", "gather"] as Feature[]).map((f) => {
                  const on = features.includes(f);
                  return (
                    <PillButton key={f} type="button" pressed={on} variant={on ? "filled" : "outline"} colorScheme={on ? "alpine-linen" : "paper"} size="xsmall" onClick={() => setFeatures(on ? features.filter((x) => x !== f) : [...features, f])}
                      className="shrink-0">
                      {FEATURE_LABEL[f]}
                    </PillButton>
                  );
                })}
              </div>
              <Button type="button" variant="transparent" colorScheme="paper" size="xsmall"
                aria-label="Scroll features right" aria-controls="photo-feature-options"
                disabled={!featureStrip.edges.right} onClick={() => featureStrip.scroll(1)}
                className={`j-photo-filter-nav ${!featureStrip.edges.right ? "is-hidden" : ""}`} style={{ width: 30, height: 30, padding: 0 }}>
                <PhotoTourArrow direction="right" size={16} chevron />
              </Button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-end gap-2 border-t border-paper/15 pt-2">
            <div ref={sortMenuRef} className="relative">
              <Button type="button" variant="transparent" colorScheme="paper" size="xsmall"
                aria-label="Sort rooms" aria-haspopup="true" aria-expanded={sortOpen}
                onClick={() => setSortOpen((open) => !open)}
                className="flex min-h-7 items-center justify-center gap-2 rounded-full bg-paper/10 px-3 py-1 font-label text-[11px] uppercase leading-none tracking-[0.05em] text-paper">
                {sort === "match" ? "Best match" : sort === "price-asc" ? "Price: low to high" : sort === "price-desc" ? "Price: high to low" : "Most space"}
                <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${sortOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </Button>
              {sortOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-48 overflow-hidden rounded-xl border border-paper/20 bg-[#173C2D] p-1.5 text-paper shadow-xl" role="group" aria-label="Sort order">
                  {([...(profile ? [["match", "Best match"]] : []), ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"], ...(hasSizeData ? [["size", "Most space"]] : [])] as [Sort, string][]).map(([value, title]) => (
                    <Button key={value} type="button" variant="transparent" colorScheme="paper" size="xsmall"
                      aria-pressed={sort === value}
                      onClick={() => { setSort(value); setSortOpen(false); }}
                      className={`flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left font-label text-[11px] uppercase leading-tight tracking-[0.05em] transition-colors ${sort === value ? "bg-paper text-[#173C2D]" : "text-paper hover:bg-paper/15"}`}>
                      {title}
                      <span className="w-4 shrink-0">{sort === value && <Check className="h-4 w-4" aria-hidden="true" />}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <div role="group" aria-label="View" className="flex rounded-full bg-paper/10 p-0.5">
              {(["spreads", "index"] as const).map((v) => (
                <PillButton key={v} type="button" pressed={view === v} variant={view === v ? "filled" : "transparent"} colorScheme="paper" size="xsmall" onClick={() => setView(v)}
                  className="capitalize">
                  {v === "spreads" ? "Photo View" : "Multi Room View"}
                </PillButton>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-2 px-2 text-sm text-paper/70">
          {list.length} room types{hidden ? ` · ${hidden} excluded by availability or guest eligibility` : ""} ·{" "}
          <Button type="button" onClick={onEditJournal} variant="transparent" colorScheme="paper" size="xsmall" className="underline underline-offset-4" style={{padding:0}}>
            {profile ? "Edit my journal" : "Help me choose"}
          </Button>
        </p>
      </div>

      {list.length === 0 && (
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <p className="font-heading text-3xl leading-none">No rooms fit every filter.</p>
          <Button type="button" variant="outline" colorScheme="paper" size="small" className="mt-6 rounded-full" onClick={() => { setFeatures([]); setBuilding("all"); }}>Clear filters</Button>
        </div>
      )}

      {view === "spreads" ? (
        <div className="j-room-spreads">
          {list.map((m, i) => (
            <RoomPhotoTour key={m.room.id} room={m.room} cmsHotspots={cmsHotspots} position={i} count={list.length}
              currency={m.source.rates[0]?.currency ?? "USD"}
               details={detail === m.room.id}
              onDetails={(open) => setDetail(open ? m.room.id : null)} onChoose={() => onChoose(m.source)}
              onPrevious={i > 0 ? () => visitRoom(i - 1) : undefined}
              onNext={i < list.length - 1 ? () => visitRoom(i + 1) : undefined} />
          ))}
        </div>
      ) : (
        <ul className="mx-auto mt-6 grid max-w-[1600px] gap-x-4 gap-y-8 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((m) => (
            <li key={m.room.id}>
              <Button type="button" onClick={() => { setView("spreads"); setDetail(m.room.id); window.setTimeout(() => document.getElementById(`tour-${m.room.id}`)?.scrollIntoView({ block: "start" }), 0); }} variant="transparent" colorScheme="paper" size="xsmall" className="group block w-full text-left" style={{padding:0,display:"block",width:"100%",textAlign:"left",fontWeight:400}}>
                <img src={m.room.images[0]} alt="" className="aspect-3/2 w-full rounded-lg bg-smoke object-contain transition group-hover:opacity-90" loading="lazy" />
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <h3 className="min-w-0 truncate font-heading text-xl leading-none">{m.room.name}</h3>
                  <span className="shrink-0 tabular-nums">{money(m.room.basePrice)}</span>
                </div>
                <p className="text-sm text-paper/70">
                  {m.room.building} · {m.room.bedType}{profile ? ` · ${profile.mustHaves.filter(feature => m.room.features.includes(feature)).length} features matched` : ""}
                </p>
              </Button>
            </li>
          ))}
        </ul>
      )}


    </section>
  );
}
