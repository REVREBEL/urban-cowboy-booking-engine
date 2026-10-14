/**
 * Original Lovable visual-booking-flow RoomsStep, adapted to canonical Mews
 * availability. Preserves sticky building/feature filters, mobile filter
 * sheet, sorting, photo/index toggle, and full-frame RoomPhotoTour.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { RoomPhotoTour } from "./RoomPhotoTour";
import { toPhotoTourRoom } from "../data/photoTourRooms";
import type { ShapedRoom } from "../types/mews";
import type { Feature, MatchProfile } from "./data";

const label = "font-j-label text-[11px] uppercase tracking-[0.22em]";
const btnGhost = "inline-flex items-center justify-center gap-2 rounded-full border border-j-paper/75 px-5 py-2.5 font-j-label text-xs uppercase tracking-[0.2em] text-j-paper transition hover:bg-j-paper/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-paper";
const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const FEATURE_LABEL: Record<Feature, string> = {
  "indoor-tub": "Tub by the window", "outdoor-tub": "Soak outside",
  fireplace: "Fire or wood stove", view: "Big views", gather: "Space to gather",
  balcony: "Private deck", accessible: "Step-free access",
};
type Sort = "match" | "price-asc" | "price-desc" | "size";

export function PhotoRooms({ profile, rooms, imageBaseUrl, guests, children, onChoose, onEditJournal }: { profile: MatchProfile | null; rooms: ShapedRoom[]; imageBaseUrl: string; guests: number; children: number; onChoose: (r: ShapedRoom) => void; onEditJournal: () => void }) {
  const [building, setBuilding] = useState<string>("all");
  const [features, setFeatures] = useState<Feature[]>([]);
  const [sort, setSort] = useState<Sort>(profile ? "match" : "price-asc");
  const [view, setView] = useState<"spreads" | "index">("spreads");
  const [detail, setDetail] = useState<string | null>(null);
  const roomStage = useRef<HTMLElement>(null);
  const filterOverlay = useRef<HTMLDivElement>(null);

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
    const room = toPhotoTourRoom(source, imageBaseUrl);
    const excludedBy =
      source.rates.length === 0 ? "Unavailable for these dates" :
      source.capacity < guests ? `Sleeps ${source.capacity}` :
      children > 0 && source.merchandising?.agePolicy === "adultsOnly21" ? "Guests 21+ only" :
      profile?.dog && source.merchandising?.dogPolicy !== "allowed" ? "No dogs" :
      null;
    const matched = profile?.mustHaves.filter(feature => room.features.includes(feature)).length ?? 0;
    const underBudget = profile?.budget !== undefined && room.basePrice <= profile.budget ? 1 : 0;
    return { room, source, excludedBy, score: matched * 100 + underBudget };
  }), [rooms, imageBaseUrl, guests, children, profile]);

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
  const buildingStrip = useRef<HTMLDivElement>(null);
  const [stripScroll, setStripScroll] = useState({ left: false, right: false });
  const updateStrip = () => {
    const el = buildingStrip.current;
    if (!el) return;
    setStripScroll({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };
  useEffect(() => { updateStrip(); }, [buildings]);
  useEffect(() => {
    buildingStrip.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [building]);

  const visitRoom = (index: number) => {
    const target = list[index];
    if (!target) return;
    setDetail(null);
    document.getElementById(`tour-${target.room.id}`)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start',
    });
  };

  return (
    <section ref={roomStage} className="j-room-stage pb-24">
      {/* Floating filter overlay */}
      <div ref={filterOverlay} className="j-room-filters sticky top-16 z-30 mx-auto max-w-[1600px] px-3 pt-2 sm:px-6">
        <div className="flex items-center gap-2 rounded-2xl bg-j-night/85 p-2 backdrop-blur-md sm:hidden">
          <button type="button" onClick={openSheet} aria-haspopup="dialog" aria-expanded={sheetOpen}
            className="flex items-center gap-2 rounded-full border border-j-paper/40 px-4 py-2 text-sm text-j-paper">
            <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters
            {activeFilters > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-j-ember px-1 text-xs">{activeFilters}</span>}
          </button>
          <p className="min-w-0 flex-1 truncate text-right text-xs text-j-paper/75">
            {building === "all" ? "All buildings" : building} · {view === "spreads" ? "Full photos" : "Index"}
          </p>
        </div>
        {sheetOpen && (
          <div className="fixed inset-0 z-50 sm:hidden" role="dialog" aria-modal="true" aria-label="Filter rooms">
            <button type="button" aria-label="Close filters" className="absolute inset-0 bg-j-night/70" onClick={() => setSheetOpen(false)} />
            <div className="j-sheet absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-j-paper p-5 pb-6 text-j-ink">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-j-ink/20" />
              <div className="flex items-center justify-between">
                <h2 className="font-j-display text-2xl">Filter rooms</h2>
                <button type="button" aria-label="Close filters" onClick={() => setSheetOpen(false)} className="grid h-11 w-11 place-items-center rounded-full"><X className="h-5 w-5" /></button>
              </div>
              <p className={`${label} mt-5 text-j-ink/60`}>Building</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {buildings.map((b) => (
                  <button key={b} type="button" aria-pressed={draft.building === b} onClick={() => setDraft({ ...draft, building: b })}
                    className={`rounded-full border px-3 py-2 text-sm ${draft.building === b ? "border-j-ink bg-j-ink text-j-paper" : "border-j-ink/25"}`}>
                    {b === "all" ? "All buildings" : b}
                  </button>
                ))}
              </div>
              <p className={`${label} mt-5 text-j-ink/60`}>Must have</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["indoor-tub", "outdoor-tub", "fireplace", "gather"] as Feature[]).map((f) => {
                  const on = draft.features.includes(f);
                  return (
                    <button key={f} type="button" aria-pressed={on} onClick={() => setDraft({ ...draft, features: on ? draft.features.filter((x) => x !== f) : [...draft.features, f] })}
                      className={`rounded-full border px-3 py-2 text-sm ${on ? "border-j-ember bg-j-ember text-j-paper" : "border-j-ink/25"}`}>
                      {FEATURE_LABEL[f]}
                    </button>
                  );
                })}
              </div>
              <p className={`${label} mt-5 text-j-ink/60`}>Sort by</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {([...(profile ? [["match", "Best match"]] : []), ["price-asc", "Price: low"], ["price-desc", "Price: high"], ...(hasSizeData ? [["size", "Most space"] as [Sort, string]] : [])] as [Sort, string][]).map(([v, t]) => (
                  <button key={v} type="button" aria-pressed={draft.sort === v} onClick={() => setDraft({ ...draft, sort: v })}
                    className={`rounded-xl border px-3 py-2.5 text-sm ${draft.sort === v ? "border-j-ink bg-j-ink text-j-paper" : "border-j-ink/25"}`}>{t}</button>
                ))}
              </div>
              <p className={`${label} mt-5 text-j-ink/60`}>View</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["spreads", "index"] as const).map((v) => (
                  <button key={v} type="button" aria-pressed={draft.view === v} onClick={() => setDraft({ ...draft, view: v })}
                    className={`rounded-xl border px-3 py-2.5 text-sm ${draft.view === v ? "border-j-ink bg-j-ink text-j-paper" : "border-j-ink/25"}`}>{v === "spreads" ? "Full photos" : "Index"}</button>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" className="rounded-full border border-j-ink/30 px-5 py-3 text-sm" onClick={() => setDraft({ ...draft, building: "all", features: [] })}>Clear</button>
                <button type="button" disabled={draftCount === 0} className="flex-1 rounded-full bg-j-ember px-5 py-3 text-sm text-j-paper disabled:opacity-50" onClick={applySheet}>
                  {draftCount === 0 ? "No rooms match" : `Show ${draftCount} room${draftCount === 1 ? "" : "s"}`}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="hidden flex-wrap items-center gap-2 rounded-2xl bg-j-night/85 p-2 backdrop-blur-md sm:flex">
          <div role="group" aria-label="Building" className="relative flex w-full min-w-0 items-center sm:w-auto sm:flex-1">
            <button type="button" aria-label="Earlier buildings" tabIndex={stripScroll.left ? 0 : -1}
              onClick={() => buildingStrip.current?.scrollBy({ left: -240, behavior: "smooth" })}
              className={`mr-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-j-paper/25 text-j-paper/80 transition-opacity ${stripScroll.left ? "opacity-100 hover:border-j-paper/75" : "pointer-events-none opacity-0"}`}>
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <div ref={buildingStrip} onScroll={updateStrip} className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto">
              {buildings.map((b) => (
                <button key={b} type="button" aria-pressed={building === b} onClick={() => setBuilding(b)}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${building === b ? "bg-j-paper text-j-ink" : "text-j-paper/80 hover:bg-j-paper/10"}`}>
                  {b === "all" ? "All buildings" : b}
                </button>
              ))}
            </div>
            <button type="button" aria-label="More buildings" tabIndex={stripScroll.right ? 0 : -1}
              onClick={() => buildingStrip.current?.scrollBy({ left: 240, behavior: "smooth" })}
              className={`ml-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-j-paper/25 text-j-paper/80 transition-opacity ${stripScroll.right ? "opacity-100 hover:border-j-paper/75" : "pointer-events-none opacity-0"}`}>
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <span className="mx-1 hidden h-6 w-px bg-j-paper/20 sm:block" />
          <div role="group" aria-label="Features" className="flex flex-wrap gap-1">
            {(["indoor-tub", "outdoor-tub", "fireplace", "gather"] as Feature[]).map((f) => {
              const on = features.includes(f);
              return (
                <button key={f} type="button" aria-pressed={on} onClick={() => setFeatures(on ? features.filter((x) => x !== f) : [...features, f])}
                  className={`rounded-full border px-3 py-1.5 text-sm ${on ? "border-j-ember bg-j-ember text-j-paper" : "border-j-paper/25 text-j-paper/80 hover:border-j-paper/75"}`}>
                  {FEATURE_LABEL[f]}
                </button>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <label className="sr-only" htmlFor="sort">Sort</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-full bg-j-paper/10 px-3 py-1.5 text-sm text-j-paper">
              {profile && <option value="match">Best match</option>}
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              {hasSizeData && <option value="size">Most space</option>}
            </select>
            <div role="group" aria-label="View" className="flex rounded-full bg-j-paper/10 p-0.5">
              {(["spreads", "index"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}
                  className={`rounded-full px-3 py-1 text-sm capitalize ${view === v ? "bg-j-paper text-j-ink" : "text-j-paper/80"}`}>
                  {v === "spreads" ? "Full photos" : "Index"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-2 px-2 text-sm text-j-paper/70">
          {list.length} room types{hidden ? ` · ${hidden} excluded by availability or guest eligibility` : ""} ·{" "}
          <button type="button" onClick={onEditJournal} className="underline underline-offset-4 hover:text-j-paper">
            {profile ? "Edit my journal" : "Help me choose"}
          </button>
        </p>
      </div>

      {list.length === 0 && (
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <p className="font-j-display text-3xl">No rooms fit every filter.</p>
          <button type="button" className={`${btnGhost} mt-6`} onClick={() => { setFeatures([]); setBuilding("all"); }}>Clear filters</button>
        </div>
      )}

      {view === "spreads" ? (
        <div className="j-room-spreads">
          {list.map((m, i) => (
            <RoomPhotoTour key={m.room.id} room={m.room} position={i} count={list.length}
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
              <button type="button" onClick={() => { setView("spreads"); setDetail(m.room.id); window.setTimeout(() => document.getElementById(`tour-${m.room.id}`)?.scrollIntoView({ block: "start" }), 0); }} className="group block w-full text-left">
                <img src={m.room.images[0]} alt="" className="aspect-[3/2] w-full rounded-lg object-cover transition group-hover:opacity-90" loading="lazy" />
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <h3 className="min-w-0 truncate font-j-display text-xl">{m.room.name}</h3>
                  <span className="shrink-0 tabular-nums">{money(m.room.basePrice)}</span>
                </div>
                <p className="text-sm text-j-paper/70">
                  {m.room.building} · {m.room.bedType}{profile ? ` · ${profile.mustHaves.filter(feature => m.room.features.includes(feature)).length} features matched` : ""}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}


    </section>
  );
}

