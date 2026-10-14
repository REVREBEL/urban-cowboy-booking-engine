import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { money, type JourneyRoom } from './data';
import { PHOTO_HIGHLIGHTS, roomAmenities } from './tour';
import { TourIcon } from '@/components/rooms/TourIcon';
import { FeatureFocus } from '@/components/rooms/FeatureFocus';

/** Photo-enhancement demo: room 1 combines ambient backlight with film grain + vignette; all other photos stay plain. */
const FX: (string | undefined)[] = [
  'fx-backlight fx-grain',
  undefined,
  undefined,
];
const FX_LABEL: Record<string, string> = {
  'fx-backlight': 'Ambient backlight',
  'fx-grain': 'Film grain + vignette',
};


export function RoomPhotoTour({ room, position, count, score, details, onDetails, onChoose, onPrevious, onNext }: {
  room: JourneyRoom; position: number; count: number; score?: number;
  details: boolean; onDetails: (open: boolean) => void; onChoose: () => void;
  onPrevious?: () => void; onNext?: () => void;
}) {
  const section = useRef<HTMLElement>(null);
  const [viewport, carousel] = useEmblaCarousel({ loop: room.images.length > 1, watchDrag: (api, event) => {
    const target = event.target;
    return !(target instanceof Element && target.closest('button, a, [data-tour-panel]'));
  } });
  const [photo, setPhoto] = useState(0);
  const [ratios, setRatios] = useState<Record<number, number>>({});
  const [activePin, setActivePin] = useState<string | null>(null);
  const detailsRef = useRef(details);
  const dismissRef = useRef(onDetails);
  detailsRef.current = details;
  dismissRef.current = onDetails;

  const sync = useCallback(() => {
    setPhoto(carousel?.selectedScrollSnap() ?? 0);
    setActivePin(null);
  }, [carousel]);
  useEffect(() => {
    if (!carousel) return;
    sync();
    carousel.on('select', sync);
    return () => { carousel.off('select', sync); };
  }, [carousel, sync]);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.intersectionRatio < 0.45 && detailsRef.current) dismissRef.current(false);
    }, { threshold: [0, 0.45, 0.75] });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { if (!details) setActivePin(null); }, [details]);
  useEffect(() => {
    if (!details) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') onDetails(false); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [details, onDetails]);

  const fx = FX[position];
  const pins = PHOTO_HIGHLIGHTS[room.images[photo]] ?? [];
  const selected = pins.find((p) => p.id === activePin) ?? pins[0];
  const amenities = roomAmenities(room);
  const goPhoto = (direction: number) => direction > 0 ? carousel?.scrollNext() : carousel?.scrollPrev();
  const highlightRow = useRef<HTMLDivElement>(null);
  const pickPin = (id: string) => {
    setActivePin(id);
    highlightRow.current?.querySelector(`[data-pin="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };
  const roomNav = (cls: string) => (
    <div className={cls}>
      <Button variant="transparent" className="j-tour-control" disabled={!onPrevious} aria-label={`Previous room from ${room.name}`} title="Previous room" onClick={onPrevious}><ArrowUp size={18} /></Button>
      <Button variant="transparent" className="j-tour-control" disabled={!onNext} aria-label={`Next room from ${room.name}`} title="Next room" onClick={onNext}><ArrowDown size={18} /></Button>
    </div>
  );

  return (
    <article ref={section} id={`tour-${room.id}`} className={`j-room-tour ${fx ?? ''}`} aria-label={room.name}
      onKeyDown={(event) => {
        if ((event.target as HTMLElement).matches('select, input, textarea')) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault(); goPhoto(event.key === 'ArrowRight' ? 1 : -1);
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault(); (event.key === 'ArrowDown' ? onNext : onPrevious)?.();
        }
      }}>
      <div ref={viewport} className="j-photo-viewport" role="region" aria-roledescription="carousel" aria-label={`${room.name} photographs`} tabIndex={0}>
        <div className="j-photo-track">
          {room.images.map((src, index) => (
            <div className="j-photo-slide" key={`${src}-${index}`} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${room.images.length}`} aria-hidden={photo !== index} inert={photo !== index} style={{ '--photo-ratio': ratios[index] ?? 1.5 } as CSSProperties}>
              {fx?.includes('fx-backlight') && <img className="j-fx-halo" src={src} alt="" aria-hidden="true" draggable={false} />}
              <div className="j-photo-image">
                <img src={src} alt={`${room.name} — photo ${index + 1}`} draggable={false}
                  loading={position === 0 || photo === index ? 'eager' : 'lazy'}
                  onLoad={(event) => {
                    const image = event.currentTarget;
                    if (image.naturalHeight) setRatios((old) => ({ ...old, [index]: image.naturalWidth / image.naturalHeight }));
                  }} />
                <div className={`j-hotspots ${details && photo === index ? 'is-open' : ''}`} inert={!details || photo !== index} aria-hidden={!details || photo !== index}>
                  {(PHOTO_HIGHLIGHTS[src] ?? []).map((pin, pinIndex) => (
                    <div key={pin.id} className="j-hotspot-anchor" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
                      <div className="j-pin-desktop">
                        <FeatureFocus count={pinIndex + 1} icon={pin.icon} title={pin.title}
                          active={activePin === pin.id} onSelect={() => setActivePin(activePin === pin.id ? null : pin.id)} />
                      </div>
                      <button type="button" className="j-pin-mobile" aria-label={pin.title} aria-pressed={(selected?.id ?? null) === pin.id}
                        onClick={() => pickPin(pin.id)}>{pinIndex + 1}</button>
                    </div>
                  ))}
                </div>
              {room.images.length > 1 && [-1, 1].map((direction) => {
                const neighborIndex = (index + direction + room.images.length) % room.images.length;
                const neighbor = room.images[neighborIndex];
                if (!neighbor || neighbor === src) return null;
                return (
                  <Button key={direction} variant="transparent" tabIndex={-1} aria-hidden="true"
                    className={`j-photo-peek ${direction < 0 ? 'is-prev' : 'is-next'}`}
                    style={{ '--peek-ratio': ratios[neighborIndex] ?? 1.5 } as CSSProperties}
                    onClick={() => goPhoto(direction)}>
                    <img src={neighbor} alt="" draggable={false} loading="lazy" />
                  </Button>
                );
              })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {fx && <p className="j-fx-badge">Effect demo · {fx.split(' ').map((c) => FX_LABEL[c]).join(' + ')}</p>}


      {room.images.length > 1 && <>
        <Button variant="transparent" className="j-tour-control j-photo-prev" aria-label={`Previous photo of ${room.name}`} title="Previous photo" onClick={() => goPhoto(-1)}><ChevronLeft size={24} /></Button>
        <Button variant="transparent" className="j-tour-control j-photo-next" aria-label={`Next photo of ${room.name}`} title="Next photo" onClick={() => goPhoto(1)}><ChevronRight size={24} /></Button>
      </>}

      <div className="j-photo-pagination" aria-label="Photo selection">
        {room.images.map((_, index) => <Button key={index} variant="transparent" className="j-tour-control j-photo-dot"
          title={`Photo ${index + 1}`} aria-label={`Show photo ${index + 1} of ${room.name}`} aria-pressed={photo === index}
          onClick={() => carousel?.scrollTo(index)}><span /></Button>)}
        <span className="text-xs tabular-nums text-j-paper/85" aria-live="polite">{photo + 1} / {room.images.length}</span>
      </div>

      <aside id={`tour-details-${room.id}`} className={`j-tour-details ${details ? 'is-open' : ''}`} inert={!details} aria-hidden={!details} data-tour-panel>
        <div className="j-tour-feature" id={`tour-highlight-${room.id}`} aria-live="polite">
          {selected && <>
            <TourIcon name={selected.icon} className="size-14 shrink-0" />
            <div><p className="font-j-display text-2xl leading-tight">{selected.title}</p><p className="mt-1 text-sm leading-relaxed">{selected.note}</p></div>
          </>}
        </div>
        <div className="j-tour-amenities">
          {pins.length > 0 && <>
            <p className="j-mobile-only text-[11px] uppercase tracking-[0.2em] opacity-60">In this photo · tap a number or swipe</p>
            <div ref={highlightRow} className="j-highlight-row no-scrollbar">
              {pins.map((pin, i) => (
                <button key={pin.id} type="button" data-pin={pin.id} aria-pressed={selected?.id === pin.id} onClick={() => pickPin(pin.id)} className="j-highlight-card">
                  <span className="j-highlight-num">{i + 1}</span>
                  <TourIcon name={pin.icon} className="size-10 shrink-0" />
                  <span className="min-w-0 text-left"><span className="block font-j-display text-base leading-tight">{pin.title}</span><span className="mt-0.5 block text-xs leading-snug opacity-75">{pin.note}</span></span>
                </button>
              ))}
            </div>
          </>}
          <div className="flex items-start justify-between gap-3">
            <div><h3 className="font-j-display text-xl">The little comforts</h3><p className="mt-1 text-xs">{room.bedType} · {room.squareFeet} sq ft · {room.adultsOnly ? 'Guests 21+' : 'All ages'}{room.dogFriendly ? ' · Dogs welcome' : ''}</p></div>
            <Button variant="transparent" className="j-tour-control j-panel-close" aria-label={`Close details for ${room.name}`} title="Close details" onClick={() => onDetails(false)}><X size={20} /></Button>
          </div>
          <ul className="j-amenity-list">
            {amenities.map((a) => <li key={a.title}><TourIcon name={a.icon} /><span>{a.title}</span></li>)}
          </ul>
          {room.isMock && <p className="mt-3 text-xs">Sample room · photography reused</p>}
        </div>
      </aside>

      <footer className="j-tour-footer" data-tour-panel>
        {roomNav('j-roomnav-mobile')}
        <div className="j-tour-info min-w-0">
          <p className="truncate text-xs uppercase text-j-paper/75">{room.building} · Sleeps {room.maxGuests}{score !== undefined ? ` · ${score}% match` : ''}<span className="j-mobile-only"> · {position + 1}/{count}</span></p>
          <h2 className="mt-1 truncate font-j-display text-xl leading-tight sm:text-4xl sm:whitespace-normal">{room.name}</h2>
          <p className="mt-1 hidden text-sm text-j-paper/80 lg:block">{room.tagline}</p>
        </div>
        <div className="j-tour-actions">
          <p className="shrink-0 tabular-nums"><span className="text-xs text-j-paper/75">from </span><span className="font-j-display text-xl sm:text-3xl">{money(room.basePrice)}</span><span className="text-xs text-j-paper/75"> /night</span></p>
          <Button variant="outline" className="j-tour-button" aria-expanded={details} aria-controls={`tour-details-${room.id}`} onClick={() => onDetails(!details)}>{details ? 'Hide details' : 'Details'}</Button>
          <Button className="j-tour-button j-tour-choose" onClick={onChoose}>Choose room</Button>
          <div className="j-roomnav-desktop flex items-center gap-1">
            <span className="mr-1 text-xs tabular-nums text-j-paper/75">{position + 1}/{count}</span>
            {roomNav('flex items-center gap-1')}
          </div>
        </div>
      </footer>
    </article>
  );
}
