import { useCallback, useEffect, useRef, useState, type CSSProperties, type WheelEvent as ReactWheelEvent } from 'react';
import { createPortal } from 'react-dom';
import '@/styles/room-photo-tour.css';
import useEmblaCarousel from 'embla-carousel-react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { JourneyRoom } from './data';
import { PHOTO_HIGHLIGHTS, roomAmenities } from '@/journey/tour';
import { cmsHighlightsForPhoto } from '@/journey/cmsTour';
import type { CmsPhotoHotspotMap } from '@/types/photo-hotspot-cms';
import { CmsAmenityIcon } from '@/components/rooms/CmsAmenityIcon';
import { FocusAmenity } from '@/components/rooms/FocusAmenity';
import { SideFocusAmenityBar } from '@/components/rooms/SideFocusAmenityBar';
import { PhotoTourArrow } from '@/journey/PhotoTourArrow';

/** Photo-enhancement demo: room 1 combines ambient backlight with film grain + vignette; all other photos stay plain. */
const FX: (string | undefined)[] = [];
const FX_LABEL: Record<string, string> = {
  'fx-backlight': 'Ambient backlight',
  'fx-grain': 'Film grain + vignette',
};


export function RoomPhotoTour({ room, cmsHotspots = {}, position, count, score, details, onDetails, onChoose, onPrevious, onNext, sideAmenitiesHost, currency = "USD" }: {
  room: JourneyRoom; cmsHotspots?: CmsPhotoHotspotMap; position: number; count: number; score?: number;
  details: boolean; onDetails: (open: boolean) => void; onChoose: () => void; currency?: string;
  onPrevious?: () => void; onNext?: () => void; sideAmenitiesHost?: HTMLElement | null;
}) {
  const section = useRef<HTMLElement>(null);
  const [viewport, carousel] = useEmblaCarousel({
    loop: room.images.length > 1, align: "center", containScroll: false, duration: 52, dragThreshold: 8, watchDrag: (api, event) => {
      const target = event.target;
      return !details && !(target instanceof Element && target.closest('button, a, [data-tour-panel]'));
    }
  });
  const [photo, setPhoto] = useState(0);
  const [ratios, setRatios] = useState<Record<number, number>>({});
  const [activePin, setActivePin] = useState<string | null>(null);
  const [amenityExiting, setAmenityExiting] = useState(false);
  const amenitySwapTimer = useRef<number | null>(null);
  const pendingPin = useRef<string | null>(null);
  const activePinRef = useRef(activePin);
  activePinRef.current = activePin;

  const selectAmenity = useCallback((next: string | null) => {
    if (amenitySwapTimer.current !== null) {
      window.clearTimeout(amenitySwapTimer.current);
      amenitySwapTimer.current = null;
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !activePinRef.current || activePinRef.current === next) {
      pendingPin.current = null;
      setAmenityExiting(false);
      activePinRef.current = next;
      setActivePin(next);
      return;
    }
    pendingPin.current = next;
    setAmenityExiting(true);
    amenitySwapTimer.current = window.setTimeout(() => {
      const target = pendingPin.current;
      activePinRef.current = target;
      setActivePin(target);
      setAmenityExiting(false);
      pendingPin.current = null;
      amenitySwapTimer.current = null;
    }, 240);
  }, []);
  useEffect(() => () => {
    if (amenitySwapTimer.current !== null) window.clearTimeout(amenitySwapTimer.current);
  }, []);
  const photoWheelLocked = useRef(false);
  const photoWheelUnlock = useRef<number | null>(null);
  const detailsRef = useRef(details);
  const dismissRef = useRef(onDetails);
  detailsRef.current = details;
  dismissRef.current = onDetails;

  const sync = useCallback(() => {
    setPhoto(carousel?.selectedScrollSnap() ?? 0);
    if (amenitySwapTimer.current !== null) window.clearTimeout(amenitySwapTimer.current);
    amenitySwapTimer.current = null;
    pendingPin.current = null;
    activePinRef.current = null;
    setAmenityExiting(false);
    setActivePin(null);
  }, [carousel]);
  useEffect(() => {
    if (!carousel) return;
    sync();
    carousel.on('select', sync);
    return () => { carousel.off('select', sync); };
  }, [carousel, sync]);

  useEffect(() => () => {
    if (photoWheelUnlock.current !== null) window.clearTimeout(photoWheelUnlock.current);
  }, []);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.intersectionRatio < 0.45 && detailsRef.current) dismissRef.current(false);
    }, { threshold: [0, 0.45, 0.75] });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!details) {
      if (amenitySwapTimer.current !== null) window.clearTimeout(amenitySwapTimer.current);
      amenitySwapTimer.current = null;
      pendingPin.current = null;
      activePinRef.current = null;
      setAmenityExiting(false);
      setActivePin(null);
    }
  }, [details]);
  useEffect(() => {
    if (!details) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') onDetails(false); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [details, onDetails]);

  const fx = FX[position];
  const pins = room.cmsAmenities
    ? cmsHighlightsForPhoto(room.images[photo], room.cmsAmenities, cmsHotspots)
    : PHOTO_HIGHLIGHTS[room.images[photo]] ?? [];
  const amenities = roomAmenities(room);
  const unseenAmenities = amenities.filter((amenity) => !amenity.id || !pins.some((pin) => pin.amenityId === amenity.id));
  const sideAmenities = unseenAmenities.map((amenity) => ({
    id: amenity.id ?? `amenity:${amenity.title}`,
    title: amenity.title,
    description: amenity.longNote ?? amenity.note,
    iconPath: amenity.iconPath,
    icon: amenity.icon,
  }));
  const selected = pins.find((pin) => pin.id === activePin);
  // Embla animates horizontal movement; jump immediately for reduced-motion users.
  const goPhoto = (direction: number) => {
    const jump = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (direction > 0) carousel?.scrollNext(jump);
    else carousel?.scrollPrev(jump);
  };
  const handlePhotoWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (details) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (room.images.length < 2 || event.ctrlKey) return;
    // Keep vertical mouse-wheel gestures available for room navigation. Only a
    // deliberate horizontal trackpad gesture should move between photographs.
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 12) return;
    event.preventDefault();
    event.stopPropagation();
    if (photoWheelUnlock.current !== null) window.clearTimeout(photoWheelUnlock.current);
    photoWheelUnlock.current = window.setTimeout(() => {
      photoWheelLocked.current = false;
      photoWheelUnlock.current = null;
    }, 240);
    if (photoWheelLocked.current) return;
    photoWheelLocked.current = true;
    goPhoto(event.deltaX > 0 ? 1 : -1);
  };
  const highlightRow = useRef<HTMLDivElement>(null);
  const handleSelectPin = (id: string) => {
    const willOpen = activePin !== id;
    selectAmenity(willOpen ? id : null);
    if (willOpen) {
      highlightRow.current?.querySelector(`[data-pin="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };
  const handleCycleAmenity = (direction: number) => {
    if (pins.length === 0) return;
    const currentIndex = Math.max(0, pins.findIndex((pin) => pin.id === (pendingPin.current ?? activePinRef.current)));
    const nextIndex = (currentIndex + direction + pins.length) % pins.length;
    selectAmenity(pins[nextIndex].id);
  };
  // Swiping the mobile editorial cards keeps its numbered photo dot in sync.
  const syncMobileHighlight = () => {
    const row = highlightRow.current;
    if (!row) return;
    const bounds = row.getBoundingClientRect();
    const center = bounds.left + bounds.width / 2;
    const cards = row.querySelectorAll<HTMLButtonElement>("[data-pin]");
    let nearest: string | null = null;
    let distance = Infinity;
    cards.forEach((card) => {
      const box = card.getBoundingClientRect();
      const delta = Math.abs(box.left + box.width / 2 - center);
      if (delta < distance) {
        nearest = card.dataset.pin ?? null;
        distance = delta;
      }
    });
    if (nearest && nearest !== (pendingPin.current ?? activePinRef.current)) selectAmenity(nearest);
  };

  const roomNav = (cls: string) => (
    <div className={cls}>
      <Button variant="transparent" colorScheme="paper" size="xsmall" style={{ padding: 0, borderRadius: "50%" }} className="j-tour-control" disabled={!onPrevious} aria-label={`Previous room from ${room.name}`} title="Previous room" onClick={onPrevious}><PhotoTourArrow direction="up" size={18} /></Button>
      <Button variant="transparent" colorScheme="paper" size="xsmall" style={{ padding: 0, borderRadius: "50%" }} className="j-tour-control" disabled={!onNext} aria-label={`Next room from ${room.name}`} title="Next room" onClick={onNext}><PhotoTourArrow direction="down" size={18} /></Button>
    </div>
  );

  return (
    <article ref={section} id={`tour-${room.id}`} className={`j-room-tour ${details ? "is-details-open" : ""} ${fx ?? ''}`} aria-label={room.name} data-photo-source={room.photoSource ?? "unknown"}
      onKeyDown={(event) => {
        if ((event.target as HTMLElement).matches('select, input, textarea')) return;
        if (details) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault(); goPhoto(event.key === 'ArrowRight' ? 1 : -1);
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault(); (event.key === 'ArrowDown' ? onNext : onPrevious)?.();
        }
      }}>
      <div ref={viewport} className="j-photo-viewport" role="region" aria-roledescription="carousel" aria-label={`${room.name} photographs`} tabIndex={0} onWheel={handlePhotoWheel}>
        <div className="j-photo-track">
          {room.images.map((src, index) => (
            <div className="j-photo-slide" key={`${src}-${index}`} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${room.images.length}`} aria-hidden={photo !== index} inert={photo !== index} style={{ '--photo-ratio': ratios[index] ?? 1.5 } as CSSProperties}>
              {fx?.includes('fx-backlight') && <img className="j-fx-halo" src={src} alt="" aria-hidden="true" draggable={false} />}
              {room.images.length > 1 && ([-1, 1] as const).map((direction) => {
                const neighborIndex = (index + direction + room.images.length) % room.images.length;
                const neighbor = room.images[neighborIndex];
                return (
                  <div key={direction} className={`j-photo-neighbor ${direction < 0 ? "is-prev" : "is-next"}`} aria-hidden="true">
                    <img src={neighbor} alt="" draggable={false} loading="lazy" />
                  </div>
                );
              })}
              <div className="j-photo-image">
                <img src={src} alt={`${room.name} — photo ${index + 1}`} draggable={false}
                  style={{ filter: details && photo === index ? "brightness(.42) saturate(.8)" : undefined, transition: "filter 240ms ease" }}
                  loading={position === 0 && index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={position === 0 && index === 0 ? 'high' : 'low'} decoding="async"
                  onLoad={(event) => {
                    const image = event.currentTarget;
                    if (image.naturalHeight) setRatios((old) => ({ ...old, [index]: image.naturalWidth / image.naturalHeight }));
                  }} />
                <div className={`j-hotspots ${details && photo === index ? 'is-open' : ''}`} inert={!details || photo !== index} aria-hidden={!details || photo !== index}>

                  {(room.cmsAmenities ? cmsHighlightsForPhoto(src, room.cmsAmenities, cmsHotspots) : PHOTO_HIGHLIGHTS[src] ?? []).map((pin, pinIndex, allPins) => (
                    <div
                      key={pin.id}
                      className="j-hotspot-anchor"
                      style={{ left: `${pin.x}%`, top: `${pin.y}%`, zIndex: activePin === pin.id ? 50 : 1 }}
                    >
                      <div className={`j-pin-desktop ${amenityExiting && activePin === pin.id ? "is-amenity-exiting" : ""} ${activePin === pin.id && !amenityExiting ? "is-amenity-selected" : ""}`}>
                        <FocusAmenity
                          count={pinIndex + 1}
                          totalCount={allPins.length}
                          icon={pin.icon}
                          iconPath={pin.iconPath}
                          title={pin.title}
                          description={pin.longNote ?? pin.note ?? pin.title}
                          active={activePin === pin.id}
                          state={activePin !== null && activePin !== pin.id ? "Inactive" : undefined}
                          onSelect={() => handleSelectPin(pin.id)}
                          onPreviousAmenity={() => handleCycleAmenity(-1)}
                          onNextAmenity={() => handleCycleAmenity(1)}
                          cardSide={pin.x > 55 ? "left" : "right"}
                          cardAlign={pin.y < 30 ? "top" : pin.y > 70 ? "bottom" : "center"}
                        />
                      </div>
                      <Button
                        type="button"
                        variant={activePin === pin.id ? "filled" : "outline"}
                        colorScheme={activePin === pin.id ? "alpine-linen" : "paper"}
                        size="xsmall"
                        style={{ padding: 0, width: "30px", height: "30px", borderRadius: "50%", borderWidth: "1px" }}
                        className="j-pin-mobile"
                        aria-label={pin.title}
                        aria-pressed={activePin === pin.id}
                        onClick={() => handleSelectPin(pin.id)}
                      >
                        {pinIndex + 1}
                      </Button>
                    </div>
                  ))}


                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {details && sideAmenities.length > 0 && sideAmenitiesHost && createPortal(
        <SideFocusAmenityBar amenities={sideAmenities} />,
        sideAmenitiesHost,
      )}

      {fx && <p className="j-fx-badge">Effect demo · {fx.split(' ').map((c) => FX_LABEL[c]).join(' + ')}</p>}

      {room.images.length > 1 && <>
        <Button variant="transparent" colorScheme="paper" size="xsmall" style={{ padding: 0, borderRadius: "50%", opacity: details ? 0 : 1, pointerEvents: details ? "none" : undefined }} className="j-tour-control j-photo-prev" aria-label={`Previous photo of ${room.name}`} title="Previous photo" onClick={() => goPhoto(-1)}><PhotoTourArrow direction="left" size={24} chevron /></Button>
        <Button variant="transparent" colorScheme="paper" size="xsmall" style={{ padding: 0, borderRadius: "50%", opacity: details ? 0 : 1, pointerEvents: details ? "none" : undefined }} className="j-tour-control j-photo-next" aria-label={`Next photo of ${room.name}`} title="Next photo" onClick={() => goPhoto(1)}><PhotoTourArrow direction="right" size={24} chevron /></Button>
      </>}

      <div className="j-photo-pagination" aria-label="Photo selection" style={{ opacity: details ? 0 : 1, pointerEvents: details ? "none" : undefined }}>
        {room.images.map((_, index) => <Button key={index} variant="transparent" colorScheme="paper" size="xsmall" style={{ padding: 0, borderRadius: "50%" }} className="j-tour-control j-photo-dot"
          title={`Photo ${index + 1}`} aria-label={`Show photo ${index + 1} of ${room.name}`} aria-pressed={photo === index}
          onClick={() => carousel?.scrollTo(index, window.matchMedia("(prefers-reduced-motion: reduce)").matches)}><span /></Button>)}
        <span className="font-number text-xs tabular-nums text--paper/85" aria-live="polite">{photo + 1} / {room.images.length}</span>
      </div>

      <aside id={`tour-details-${room.id}`} className={`j-tour-details ${details ? 'is-open' : ''}`} inert={!details} aria-hidden={!details} data-tour-panel>
        <div className="j-tour-amenities">
          {pins.length > 0 && <>
            <p className="j-mobile-only text-[11px] uppercase tracking-[0.2em] opacity-60">In this photo · tap a number or swipe</p>
            <div ref={highlightRow} onScroll={syncMobileHighlight} className="j-highlight-row no-scrollbar">
              {pins.map((pin, i) => (
                <Button key={pin.id} type="button" variant="transparent" colorScheme="lake-forest" size="xsmall" style={{ padding: "12px", fontWeight: 400, textAlign: "left", borderRadius: "10px" }} data-pin={pin.id} aria-pressed={selected?.id === pin.id} onClick={() => handleSelectPin(pin.id)} className="j-highlight-card">
                  <span className="j-highlight-num">{i + 1}</span>
                  <CmsAmenityIcon iconPath={pin.iconPath} fallback={pin.icon} className="size-10 shrink-0" />
                  <span className="min-w-0 text-left"><span className="block font-headline text-base leading-none">{pin.title}</span><span className="mt-0.5 block text-xs leading-snug opacity-75">{pin.longNote ?? pin.note}</span></span>
                </Button>
              ))}
            </div>
          </>}

          <div className="flex items-start justify-between gap-3">
            <div><h3 className="font-headline text-xl leading-none">The little comforts</h3><p className="mt-1 text-xs">{room.bedType} · {room.squareFeet} sq ft · {room.adultsOnly ? 'Guests 21+' : 'All ages'}{room.dogFriendly ? ' · Dogs welcome' : ''}</p></div>
            <Button variant="transparent" colorScheme="lake-forest" size="xsmall" style={{ padding: 0, borderRadius: "50%" }} className="j-tour-control j-panel-close" aria-label={`Close details for ${room.name}`} title="Close details" onClick={() => onDetails(false)}><X size={20} /></Button>
          </div>
          <ul className="j-amenity-list">
            {unseenAmenities.map((a) => <li key={a.id ?? a.title}><CmsAmenityIcon iconPath={a.iconPath} fallback={a.icon} className="size-6" /><span><span className="block font-semibold">{a.title}</span>{a.note && <span className="block text-xs opacity-75">{a.note}</span>}</span></li>)}
          </ul>
          {room.isMock && <p className="mt-3 text-xs">Sample room · photography reused</p>}
        </div>
      </aside>

      <footer className="j-tour-footer" data-tour-panel>
        {roomNav('j-roomnav-mobile')}
        <div className="j-tour-info min-w-0">
          <p className="truncate text-xs text--paper/75"><span className="capitalize">{room.building.toLocaleLowerCase()}</span> · Sleeps {room.maxGuests}{score !== undefined ? ` · ${score}% match` : ''}<span className="j-mobile-only"> · <span className="font-number">{position + 1}/{count}</span></span></p>
          <h2 className="mt-1 text-balance font-headline text-xl leading-none sm:text-4xl">{room.name}</h2>
          <p className="mt-1 hidden text-sm text--paper/80 lg:block" style={{ opacity: details ? 0 : 1 }}>{room.tagline}</p>
        </div>

        <div className="j-tour-actions">
          <p className="shrink-0 tabular-nums" style={{ opacity: details ? 0 : 1 }}><span className="text-xs text--paper/75">from </span><span className="font-number text-xl sm:text-[39px]">{new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(room.basePrice)}</span><span className="text-xs text--paper/75"> /night</span></p>
          <Button variant="outline" colorScheme="alpine-linen" size="small" aria-expanded={details} aria-controls={`tour-details-${room.id}`} onClick={() => onDetails(!details)} className="j-details-toggle sm:px-5.5!">{details ? 'Return to Rooms' : 'Details'}</Button>
          <Button variant="filled" colorScheme="alpine-linen" size="small" onClick={onChoose} className="sm:px-5.5!" style={{ opacity: details ? 0 : 1, pointerEvents: details ? "none" : undefined }}>Choose room</Button>
          <div className="j-roomnav-desktop flex items-center gap-1" style={{ opacity: details ? 0 : 1, pointerEvents: details ? "none" : undefined }}>
            <span className="mr-1 font-number text-xs tabular-nums text--paper/75">{position + 1}/{count}</span>
            {roomNav('flex items-center gap-1')}
          </div>
        </div>
      </footer>
    </article>
  );
}
