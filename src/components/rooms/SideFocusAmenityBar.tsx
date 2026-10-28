import { useCallback, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { cmsIconUrl } from "@/lib/cmsPhotoHotspots";
import { FocusAmenityAction } from "./FocusAmenityAction";
import { CmsAmenityIcon } from "./CmsAmenityIcon";
import type { TourIcon } from "@/journey/tour";

export interface SideFocusAmenityItem {
  id: string;
  title: string;
  description?: string | null;
  iconPath?: string | null;
  imageUrl?: string | null;
  icon: TourIcon;
}
export interface SideFocusAmenityBarProps {
  amenities: readonly SideFocusAmenityItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}


/** Image loading is checked separately because CSS masks do not emit load errors. */
function AmenityTileArtwork({ item }: { item: SideFocusAmenityItem }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const url = cmsIconUrl(item.iconPath);
  const webflowUrl = item.imageUrl && /^https:\/\//i.test(item.imageUrl) ? item.imageUrl : null;
  const [failedWebflowUrl, setFailedWebflowUrl] = useState<string | null>(null);
  if (webflowUrl && failedWebflowUrl !== webflowUrl) {
    return <img src={webflowUrl} alt="" aria-hidden="true" className="j-cms-icon h-25 w-27 object-contain" onError={() => setFailedWebflowUrl(webflowUrl)} />;
  }
  if (!url || failedUrl === url) {
    return <CmsAmenityIcon iconPath={null} fallback={item.icon} className="size-25 object-contain" />;
  }
  return (
    <span className="relative block h-25 w-27">
      <img src={url} alt="" aria-hidden="true" className="pointer-events-none absolute size-px opacity-0" onError={() => setFailedUrl(url)} />
      <span
        aria-hidden="true"
        className="block size-full bg-current text-(--invert-fg) transition-colors"
        style={{ maskImage: `url("${url}")`, WebkitMaskImage: `url("${url}")`, maskSize: "contain", WebkitMaskSize: "contain", maskPosition: "center", WebkitMaskPosition: "center", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" } as CSSProperties}
      />
    </span>
  );
}

/** Receives the ordered amenities not marked on the currently visible photo. */
export function SideFocusAmenityBar({ amenities, open, onOpenChange, className = "" }: SideFocusAmenityBarProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardCenter, setCardCenter] = useState(56);
  const panelRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const uniqueAmenities = useMemo(() => {
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();
    return amenities.filter((item) => {
      const normalizedTitle = item.title.trim().toLocaleLowerCase();
      if (seenIds.has(item.id) || seenTitles.has(normalizedTitle)) return false;
      seenIds.add(item.id);
      seenTitles.add(normalizedTitle);
      return true;
    });
  }, [amenities]);
  const expanded = open ?? localOpen;
  const selectedIndex = selectedId ? uniqueAmenities.findIndex((item) => item.id === selectedId) : -1;
  const selected = selectedIndex >= 0 ? uniqueAmenities[selectedIndex] : undefined;
  const toggle = (value: boolean) => {
    if (open === undefined) setLocalOpen(value);
    if (!value) setSelectedId(null);
    onOpenChange?.(value);
  };
  const cycle = (direction: number) => {
    if (!uniqueAmenities.length) return;
    const nextIndex = selectedIndex < 0
      ? direction > 0 ? 0 : uniqueAmenities.length - 1
      : (selectedIndex + direction + uniqueAmenities.length) % uniqueAmenities.length;
    setSelectedId(uniqueAmenities[nextIndex].id);
  };
  const handleSelectAmenity = (id: string) => {
    setSelectedId((currentId) => currentId === id ? null : id);
  };
  const updateCardPosition = useCallback(() => {
    const panel = panelRef.current;
    const item = selected ? itemRefs.current.get(selected.id) : null;
    if (!panel || !item) return;
    const panelBounds = panel.getBoundingClientRect();
    const itemBounds = item.getBoundingClientRect();
    const desiredCenter = itemBounds.top - panelBounds.top + itemBounds.height / 2;
    const cardHeight = cardRef.current?.getBoundingClientRect().height ?? 0;
    const safeHalfHeight = Math.min(cardHeight / 2, panelBounds.height / 2);
    const minimumCenter = safeHalfHeight;
    const maximumCenter = panelBounds.height - safeHalfHeight;
    setCardCenter(Math.min(maximumCenter, Math.max(minimumCenter, desiredCenter)));
  }, [selected]);

  useLayoutEffect(() => {
    if (!expanded || !selected) return;
    const item = itemRefs.current.get(selected.id);
    item?.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
    updateCardPosition();
    const observer = new ResizeObserver(updateCardPosition);
    if (panelRef.current) observer.observe(panelRef.current);
    if (cardRef.current) observer.observe(cardRef.current);
    if (item) observer.observe(item);
    return () => observer.disconnect();
  }, [expanded, selected, updateCardPosition]);

  if (!uniqueAmenities.length) return null;

  return (
    <section aria-label="Other amenities & features" className={expanded
      ? `pointer-events-none! fixed top-1/2 left-8 z-40 w-[min(680px,calc(100vw-64px))] max-w-none -translate-y-1/2 ${className}`
      : `w-full max-w-170 ${className}`}>
      {!expanded ? (
        <button type="button" aria-expanded={false} onClick={() => toggle(true)}
          className="flex w-full items-center gap-5 py-3 text-left text-primary focus-visible:outline-2 focus-visible:outline-offset-4">
          <FocusAmenityAction state="Active" className="size-12.5 border-0 shadow-[0_0_28px_rgba(242,242,242,.8)]" />
          <span className="flex min-w-0 flex-col font-heading uppercase leading-none tracking-[1px] drop-shadow-[0_0_55px_#363333]">
            <span className="text-[clamp(23px,4vw,41px)]">More amenities</span>
            <span className="text-[clamp(32px,6vw,62px)]">&amp; Features</span>
          </span>
        </button>
      ) : (
        <div ref={panelRef} className="pointer-events-auto relative flex w-full min-h-0 items-start gap-6">
          <div className="relative flex h-[clamp(224px,calc(100dvh-128px),528px)] w-41 shrink-0 items-center">
            <div className="flex size-full min-h-0 w-37.25 flex-col rounded-modal-xl bg-primary p-0.5 shadow-[0_0_12px_rgba(242,242,242,.75)]">
              <div className="flex min-h-0 flex-col rounded-[39px] border-[1.5px] border-accent bg-secondary-foreground p-0.5">
                <div ref={listRef} onScroll={updateCardPosition} className="no-scrollbar flex min-h-0 flex-col gap-2 overflow-y-auto overscroll-contain rounded-[35px] border-[1.5px] border-accent bg-secondary-foreground px-2 pb-4">
                  {uniqueAmenities.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selected?.id === item.id}
                      aria-label={item.title}
                      onClick={() => handleSelectAmenity(item.id)}
                      ref={(node) => { if (node) itemRefs.current.set(item.id, node); else itemRefs.current.delete(item.id); }}
                      className={`group grid h-28 w-full shrink-0 place-items-center border-0 bg-transparent p-0 first:mt-11 focus-visible:outline-2 focus-visible:outline-offset-2 ${selected?.id === item.id ? "focus-active" : "focus-default hover:focus-hover"
                        }`}
                    >
                      <AmenityTileArtwork item={item} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button type="button" aria-label="Close amenities" onClick={() => toggle(false)}
              className="absolute left-13 -top-8.5 z-10 grid size-11.25 place-items-center focus-visible:outline-2">
              <FocusAmenityAction state="Active" className="size-11.25 border-0" />
            </button>
            <div className="absolute left-35.5 top-1/2 flex -translate-y-1/2 flex-col gap-3">
              <button type="button" aria-label="Previous amenity" onClick={() => cycle(-1)} className="grid size-9 place-items-center focus-visible:outline-2">
                <img src="/assets/icons/ui/ui-arrow_single_line_up.svg" alt="" className="h-9 w-9 object-contain" />
              </button>
              <button type="button" aria-label="Next amenity" onClick={() => cycle(1)} className="grid size-8 place-items-center focus-visible:outline-2">
                <img src="/assets/icons/ui/ui-arrow_single_line_down.svg" alt="" className="h-9 w-9 object-contain" />
              </button>
            </div>
          </div>
          {selected && <div ref={cardRef} className="absolute right-0 left-47 min-w-0 -translate-y-1/2" style={{ top: cardCenter }} aria-live="polite">
            <div key={selected.id} className="max-h-[min(350px,70dvh)] overflow-y-auto rounded-xl bg-white p-6 text-secondary shadow-[0_6px_24px_rgba(0,0,0,.18)] sm:p-8">
              <h3 className="font-heading text-[clamp(20px,3vw,24px)] leading-tight text-accent">{selected.title}</h3>
              {selected.description && <p className="mt-3 font-body text-[15px] leading-relaxed">{selected.description}</p>}
            </div>
          </div>}
        </div>
      )}
    </section>
  );
}
export default SideFocusAmenityBar;
