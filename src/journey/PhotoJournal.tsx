/**
 * Four-page photo-first Stay Journal, adapted from the original
 * visual-booking-flow/src/routes/journey.tsx.
 * Mews-shaped rooms and verified merchandising are authoritative.
 */
import { useMemo, useState, type ReactNode } from "react";
import type { ShapedRoom } from "../types/mews";
import { toPhotoTourRoom } from "../data/photoTourRooms";
import { ROOM_IMAGE_ASSETS } from "../data/roomImagePlaceholders";
import type { Feature, MatchProfile, Occasion } from "./data";
import { Button } from "../components/ui/button";
import { PillButton } from "../components/ui/pill";

const label = "font-label text-[11px] uppercase tracking-[0.22em]";
const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const FEATURE_LABEL: Record<Feature, string> = {
  "indoor-tub": "Tub by the window",
  "outdoor-tub": "Soak outside",
  fireplace: "Fire or wood stove",
  view: "Big views",
  gather: "Space to gather",
  balcony: "Private deck",
  accessible: "Step-free access",
};

const OCCASIONS: { id: Occasion; title: string; note: string; img: string }[] = [
  { id: "romance", title: "A trip for two", note: "Soaks, fires, do-not-disturb", img: ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE },
  { id: "friends", title: "The friends trip", note: "Room to gather, close to the bar", img: ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_LIVING_ROOM },
  { id: "family", title: "With the kids", note: "Space to roam, no 21+ rules", img: ROOM_IMAGE_ASSETS.WALDEN_FOREST_BATHING_SUITE },
  { id: "solo", title: "Just me", note: "Quiet, simple, restorative", img: ROOM_IMAGE_ASSETS.WALDEN_SUNRISE_BATHING_SUITE },
];

const MUST: Feature[] = ["indoor-tub", "outdoor-tub", "fireplace", "view", "gather", "balcony"];

export function PhotoJournal({ adults, children, rooms, imageBaseUrl, initial, onDone, onSkip }: { adults: number; children: number; rooms: ShapedRoom[]; imageBaseUrl: string; initial?: MatchProfile | null; onDone: (p: MatchProfile) => void; onSkip: () => void }) {
  const [p, setP] = useState<MatchProfile>(
    initial ?? { occasion: children > 0 ? "family" : "romance", adults, children, dog: false, mustHaves: [], quiet: 4, budget: 300 },
  );
  const [page, setPage] = useState(0);
  const pages = 4;
  // Live Mews-shaped room types only. No synthetic inventory, occupancy,
  // access guarantees, or fabricated match percentages.
  const eligible = useMemo(() => rooms
    .filter(room =>
      room.rates.length > 0 &&
      room.capacity >= adults + children &&
      (children === 0 || room.merchandising?.agePolicy !== "adultsOnly21") &&
      (!p.dog || room.merchandising?.dogPolicy === "allowed"))
    .map(shaped => {
      const room = toPhotoTourRoom(shaped, imageBaseUrl);
      const hits = p.mustHaves.filter(feature => room.features.includes(feature));
      const reasons = hits.map(feature => FEATURE_LABEL[feature]);
      if (shaped.rates[0]?.perNightGross != null && shaped.rates[0].perNightGross <= p.budget) {
        reasons.push("Within your budget");
      }
      return { room, reasons, score: hits.length * 100 + (room.basePrice <= p.budget ? 1 : 0) };
    })
    .sort((a, b) => b.score - a.score), [rooms, adults, children, p.dog, p.mustHaves, p.budget, imageBaseUrl]);
  const top = eligible[0];
  const set = <K extends keyof MatchProfile>(k: K, v: MatchProfile[K]) => setP((x) => ({ ...x, [k]: v }));

  return (
    <section className="relative min-h-dvh">
      {top && (
        <img src={top.room.images[0]} alt="" aria-hidden className="fixed inset-0 h-full w-full object-cover opacity-35 transition-opacity duration-700" />
      )}
      <div className="fixed inset-0 bg-linear-to-r from-secondary-foreground via-secondary-foreground/90 to-secondary-foreground/40" />
      <div className="relative mx-auto grid max-w-[1600px] gap-10 px-5 pb-16 pt-28 sm:px-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className={`${label} text-alpine-linen`}>Your stay journal · page {page + 1} of {pages}</p>
          <div className="mt-2 h-px w-full bg-paper/15">
            <div className="h-px bg-alpine-linen transition-all" style={{ width: `${((page + 1) / pages) * 100}%` }} />
          </div>

          {page === 0 && (
            <JournalPage title="What brings you to the mountains?">
              <div className="grid gap-4 sm:grid-cols-2">
                {OCCASIONS.map((o) => (
                  <Button key={o.id} type="button" variant="transparent" colorScheme="paper" size="xsmall" style={{ padding: 0, borderRadius: "12px", width: "100%", display: "block", textAlign: "left" }} aria-pressed={p.occasion === o.id} onClick={() => set("occasion", o.id)}
                    className={`group relative overflow-hidden rounded-xl text-left ring-2 transition ${p.occasion === o.id ? "ring-alpine-linen" : "ring-transparent hover:ring--paper/40"}`}>
                    <img src={o.img} alt="" className="aspect-4/3 w-full object-cover" loading="lazy" />
                    <span className="absolute inset-0 bg-linear-to-t from-secondary-foreground/90 to-transparent" />
                    <span className="absolute bottom-0 p-4">
                      <span className="block font-headline text-2xl">{o.title}</span>
                      <span className="text-sm text-paper/80">{o.note}</span>
                    </span>
                  </Button>
                ))}
              </div>
            </JournalPage>
          )}

          {page === 1 && (
            <JournalPage title="What would make it perfect?" note="Choose the features you love. Only verified room features count toward matching.">
              <div className="flex flex-wrap gap-3">
                {MUST.map((f) => {
                  const on = p.mustHaves.includes(f);
                  return (
                    <PillButton key={f} type="button" pressed={on} size="large" variant={on ? "filled" : "outline"} colorScheme={on ? "alpine-linen" : "paper"}
                      onClick={() => set("mustHaves", on ? p.mustHaves.filter((x) => x !== f) : [...p.mustHaves, f])}
                      className="transition">
                      {FEATURE_LABEL[f]}
                    </PillButton>
                  );
                })}
              </div>
              <label className="mt-8 flex items-center gap-3 text-lg">
                <input type="checkbox" checked={p.dog} onChange={(e) => set("dog", e.target.checked)} className="size-5 accent-alpine-linen" />
                I'm bringing my dog
              </label>
            </JournalPage>
          )}

          {page === 2 && (
            <JournalPage title="How tucked away do you want to be?">
              <input type="range" min={1} max={5} value={p.quiet} onChange={(e) => set("quiet", Number(e.target.value))}
                aria-label="Seclusion" className="w-full accent-alpine-linen" />
              <div className="mt-2 flex justify-between text-sm text-paper/70">
                <span>Steps from the bar</span><span>Deep in the pines</span>
              </div>
            </JournalPage>
          )}

          {page === 3 && (
            <JournalPage title="What feels right per night?" note="Before taxes. Rooms above this still show — just lower down.">
              <p className="font-headline text-5xl tabular-nums">{money(p.budget)}</p>
              <input type="range" min={150} max={600} step={10} value={p.budget} onChange={(e) => set("budget", Number(e.target.value))}
                aria-label="Nightly budget" className="mt-4 w-full accent-alpine-linen" />
            </JournalPage>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-3">
            {page > 0 && <Button type="button" variant="outline" colorScheme="paper" size="small" className="rounded-full" onClick={() => setPage(page - 1)}>← Back</Button>}
            {page < pages - 1 ? (
              <Button type="button" variant="filled" colorScheme="alpine-linen" size="small" className="rounded-full" onClick={() => setPage(page + 1)}>Next page →</Button>
            ) : (
              <Button type="button" variant="filled" colorScheme="alpine-linen" size="small" className="rounded-full" onClick={() => onDone({ ...p, adults, children })}>See my matches →</Button>
            )}
            <Button type="button" onClick={onSkip} variant="transparent" colorScheme="paper" size="xsmall" className="ml-auto underline underline-offset-4" style={{padding:0}}>Skip — show me everything</Button>
          </div>
        </div>

        <aside aria-live="polite" className="self-start rounded-2xl bg-paper/95 p-5 text-foreground lg:sticky lg:top-28">
          <p className={`${label} text-lake-forest-fade`}>Matching · {eligible.length} of {rooms.length} available room types</p>
          <ol className="mt-4 space-y-3">
            {eligible.slice(0, 4).map((m, i) => (
              <li key={m.room.id} className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3">
                <img src={m.room.images[0]} alt="" className="aspect-square w-16 rounded-md object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-headline text-lg leading-tight">{m.room.name}</p>
                  <p className="truncate text-xs text-foreground/70">{m.reasons.join(" · ") || m.room.tagline}</p>
                </div>
                <span className={`tabular-nums text-sm ${i === 0 ? "font-bold text-alpine-linen" : ""}`}>{m.reasons.length ? `${m.reasons.length} fit` : ""}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-ash pt-3 text-xs text-foreground/70">Only bookable rooms that fit the verified guest and dog policies appear above.</p>
        </aside>
      </div>
    </section>
  );
}

function JournalPage({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="max-w-[20ch] font-headline text-4xl leading-tight sm:text-5xl">{title}</h2>
      {note && <p className="mt-3 max-w-[60ch] text-paper/70">{note}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

