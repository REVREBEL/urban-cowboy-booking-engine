/**
 * Developer-only rate-card design lab ported from visual-booking-flow.
 * It intentionally stays independent of the production booking state so the
 * cancellation/payment presentation can be iterated without touching live flow.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { priceStay, ratesForStay } from "@/journey/data";
import type { RateOption } from "@/types";
import {
  buildCancellationTimeline,
  formatShortDate,
  type CancellationTimeline,
  type PhaseKind,
} from "@/lib/cancellationTimeline";

const POLICY = { freeCancelDays: 14, balanceDueDays: 5, depositShare: 0.5 };
const NIGHTS = 2;
const SUBTOTAL = 1230;
const TAXES = 147.6;
const TOTAL = SUBTOTAL + TAXES;

const SCENARIOS = [
  { id: "365", label: "365 days out", days: 365 },
  { id: "62", label: "62 days out", days: 62 },
  { id: "20", label: "20 days out", days: 20 },
  { id: "10", label: "10 days out", days: 10 },
  { id: "3", label: "3 days out", days: 3 },
] as const;

export type RateCardLabScenario = (typeof SCENARIOS)[number]["id"];

const ARRIVAL = "2027-06-20";

function minusDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const PHASE_COPY: Record<PhaseKind, { title: string; line: (t: CancellationTimeline, kept: number) => string }> = {
  refundable: { title: "Full refund", line: () => "Cancel and get your deposit back" },
  "deposit-kept": { title: "Deposit kept", line: (_t, kept) => `Cancel and ${money(kept)} is kept` },
  locked: { title: "Nothing back", line: () => "Stay is fully paid and locked" },
};

export type RateCardLabMode = "single" | "drawer" | "tray";
const MODES: { id: RateCardLabMode; label: string }[] = [
  { id: "single", label: "Single card" },
  { id: "drawer", label: "Option 1 · Slide-up drawer" },
  { id: "tray", label: "Option 2 · Full-width tray" },
];
const LAB_ROOM_PRICE = 615;

export interface RateCardLabProps {
  initialMode?: RateCardLabMode;
  initialScenario?: RateCardLabScenario;
}

export function RateCardLab({
  initialMode = "drawer",
  initialScenario = "62",
}: RateCardLabProps = {}) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Rate Card Lab — Urban Cowboy Catskills";
    return () => { document.title = previousTitle; };
  }, []);

  const [scenario, setScenario] = useState<RateCardLabScenario>(initialScenario);
  const [mode, setMode] = useState<RateCardLabMode>(initialMode);
  const [open, setOpen] = useState(false);
  const days = SCENARIOS.find((s) => s.id === scenario)!.days;
  const today = minusDays(ARRIVAL, days);
  const timeline = useMemo(() => buildCancellationTimeline(today, ARRIVAL, TOTAL, POLICY), [today]);

  return (
    <main className="rc-page">
      <header className="rc-lab-head">
        <p className="rc-eyebrow">Design lab · Rate card</p>
        <div className="rc-scenarios" role="radiogroup" aria-label="Preview layout">
          {MODES.map((m) => (
            <button key={m.id} role="radio" aria-checked={mode === m.id} className="rc-scenario" onClick={() => setMode(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="rc-scenarios" role="radiogroup" aria-label="Preview booking scenario">
          {SCENARIOS.map((s) => (
            <button key={s.id} role="radio" aria-checked={scenario === s.id} className="rc-scenario" onClick={() => setScenario(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
        <p className="rc-lab-note">
          Booking on {formatShortDate(today)} · Arriving {formatShortDate(ARRIVAL)} · Sample prices
        </p>
      </header>

      {mode === "single" ? (
        <article className={`rc-card ${open ? "is-open" : ""}`}>
          <div className="rc-summary">
            <div>
              <p className="rc-eyebrow">Keep your options open</p>
              <h1 className="rc-name">Ride Easy</h1>
              <p className="rc-policy-line" data-phase={timeline.currentPhase}>{timeline.summary}</p>
            </div>
            <div className="rc-price">
              <span className="rc-price-amt">{money(SUBTOTAL / NIGHTS)}</span>
              <span className="rc-price-unit">per night · excl. taxes</span>
            </div>
            <MiniBar timeline={timeline} />
            <div className="rc-actions">
              <button className="rc-link" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                {open ? "Hide details" : "View details"}
              </button>
              <button className="rc-book">Book this rate</button>
            </div>
          </div>
          <div className="rc-details" hidden={!open}>
            <DetailBody timeline={timeline} />
          </div>
        </article>
      ) : (
        <RateGrid mode={mode} today={today} />
      )}
    </main>
  );
}

function DetailBody({ timeline, rate }: { timeline: CancellationTimeline; rate?: RateOption }) {
  const p = rate ? priceStay(LAB_ROOM_PRICE, rate.rateMultiplier, NIGHTS) : null;
  return (
    <>
      <div className="rc-details-grid">
        <section className="rc-desc">
          <h2 className="rc-h2">About this rate</h2>
          <p>{rate ? (rate.subtitle ?? rate.tagline) : "Lock in your cabin with half down and keep your plans loose. Breakfast at the lodge is on us each morning."}</p>
          {rate && (
            <ul className="rc-incl">
              {rate.inclusions.map((x) => <li key={x}>✓ {x}</li>)}
            </ul>
          )}
          <p>
            Change your mind up to {POLICY.freeCancelDays} days before arrival and your deposit comes straight back.
            Sample copy — replace with the real rate description.
          </p>
        </section>
        <section className="rc-table" aria-label="Stay pricing">
          <h2 className="rc-h2">Stay pricing</h2>
          <Row label={`Nightly average · ${NIGHTS} nights`} value={money(p ? p.nightly : SUBTOTAL / NIGHTS)} />
          <Row label="Stay before taxes" value={money(p ? p.subtotal : SUBTOTAL)} />
          <Row label="Taxes & fees" value={money(p ? p.taxes : TAXES)} />
          <Row label="Total stay" value={money(p ? p.total : TOTAL)} strong />
        </section>
      </div>
      <Timeline timeline={timeline} />
    </>
  );
}

function RateGrid({ mode, today }: { mode: "drawer" | "tray"; today: string }) {
  const tlFor = (r: RateOption) => buildCancellationTimeline(today, ARRIVAL, priceStay(LAB_ROOM_PRICE, r.rateMultiplier, NIGHTS).total, POLICY);
  const rates = ratesForStay(NIGHTS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const tray = useRef<HTMLDivElement>(null);
  const openRate = rates.find((r) => r.id === openId);

  useEffect(() => { setOpenId(null); }, [mode]);
  useEffect(() => {
    if (!openId) return;
    if (mode === "tray") {
      requestAnimationFrame(() => tray.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
      return;
    }
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenId(null); };
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [openId, mode]);

  const choose = (id: string) => { setChosen(id); setOpenId(null); };

  return (
    <div className="rc-grid-wrap">
      <div className="rc-grid">
        {rates.map((r, i) => {
          const p = priceStay(LAB_ROOM_PRICE, r.rateMultiplier, NIGHTS);
          const isOpen = openId === r.id;
          const timeline = tlFor(r);
          return (
            <article key={r.id} className={`rc-rate ${chosen === r.id ? "is-chosen" : ""} ${isOpen ? "is-open" : ""}`}>
              <p className="rc-eyebrow">{i === 0 ? "Most flexible" : r.eyebrow}</p>
              <h2 className="rc-name">{r.title}</h2>
              <p className="rc-rate-sub">{r.subtitle ?? r.tagline}</p>
              <ul className="rc-incl">
                {r.inclusions.slice(0, 4).map((x) => <li key={x}>✓ {x}</li>)}
              </ul>
              <p className="rc-policy-line" data-phase={timeline.currentPhase}>{timeline.summary}</p>
              <MiniBar timeline={timeline} />
              <div className="rc-rate-price">
                <span>{money(p.nightly)} × {NIGHTS} nights</span>
                <b className="rc-num">{money(p.total)}</b>
              </div>
              <div className="rc-actions">
                <button className="rc-link" aria-expanded={isOpen} onClick={() => setOpenId(isOpen ? null : r.id)}>
                  {isOpen ? "Hide details" : "View details"}
                </button>
                <button className="rc-book" onClick={() => choose(r.id)}>{chosen === r.id ? "Selected" : "Choose this rate"}</button>
              </div>
            </article>
          );
        })}
      </div>

      {mode === "tray" && openRate && (
        <div ref={tray} key={openRate.id} className="rc-tray">
          <div className="rc-sheet-head">
            <h2 className="rc-name">{openRate.title}</h2>
            <button className="rc-link" onClick={() => setOpenId(null)}>Close ×</button>
          </div>
          <DetailBody timeline={tlFor(openRate)} rate={openRate} />
        </div>
      )}

      {mode === "drawer" && openRate && (
        <div className="rc-drawer-layer">
          <button className="rc-backdrop" aria-label="Close details" onClick={() => setOpenId(null)} />
          <div className="rc-drawer" role="dialog" aria-modal="true" aria-label={`${openRate.title} details`}>
            <div className="rc-sheet-head">
              <h2 className="rc-name">{openRate.title}</h2>
              <button className="rc-link" onClick={() => setOpenId(null)}>Close ×</button>
            </div>
            <div className="rc-drawer-body"><DetailBody timeline={tlFor(openRate)} rate={openRate} /></div>
            <div className="rc-drawer-foot">
              <b className="rc-num">{money(priceStay(LAB_ROOM_PRICE, openRate.rateMultiplier, NIGHTS).total)}</b>
              <button className="rc-book" onClick={() => choose(openRate.id)}>Choose this rate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`rc-row ${strong ? "is-strong" : ""}`}>
      <span>{label}</span>
      <span className="rc-num">{value}</span>
    </div>
  );
}

function MiniBar({ timeline }: { timeline: CancellationTimeline }) {
  return (
    <div className="rc-mini" aria-hidden>
      {timeline.phases.map((p) => (
        <span key={p.kind} className="rc-seg" data-phase={p.kind} style={{ flexGrow: p.weight }} />
      ))}
    </div>
  );
}

function Timeline({ timeline }: { timeline: CancellationTimeline }) {
  const balance = timeline.charges[1];
  return (
    <section className="rc-timeline" aria-label="Cancellation timeline">
      <div className="rc-tl-head">
        <h2 className="rc-h2">If you cancel</h2>
        <p className="rc-today">
          Cancel today and get back <strong>{money(timeline.refundIfCancelToday)}</strong>
        </p>
      </div>
      {timeline.warning && <p className="rc-warning">{timeline.warning}</p>}

      <ol className="rc-track">
        {timeline.phases.map((p, i) => (
          <li key={p.kind} className="rc-phase" data-phase={p.kind} style={{ flexGrow: p.weight }}>
            <div className="rc-marker">
              {i === 0 ? (
                <span className="rc-pin">You are here</span>
              ) : (
                <span className="rc-date">
                  <b>{formatShortDate(p.start)}</b>
                  <small>
                    {p.kind === "deposit-kept" ? POLICY.freeCancelDays : POLICY.balanceDueDays} days before
                  </small>
                </span>
              )}
            </div>
            <div className="rc-bar">{p.compressed && <span className="rc-break" aria-hidden>⫽</span>}</div>
            <div className="rc-phase-copy">
              <b>{PHASE_COPY[p.kind].title}</b>
              <span>{PHASE_COPY[p.kind].line(timeline, p.kept)}</span>
              <small>{p.days === 0 ? "Arrival day" : `${p.days} ${p.days === 1 ? "day" : "days"}`}</small>
            </div>
          </li>
        ))}
        <li className="rc-arrive">
          <span className="rc-date">
            <b>{formatShortDate(timeline.phases.at(-1)!.end)}</b>
            <small>Arrive</small>
          </span>
        </li>
      </ol>

      <div className="rc-charges">
        <div>
          <small>Due today</small>
          <b className="rc-num">{money(timeline.dueToday)}</b>
        </div>
        {balance && (
          <div>
            <small>Charged {formatShortDate(balance.date)}</small>
            <b className="rc-num">{money(balance.amount)}</b>
          </div>
        )}
      </div>
    </section>
  );
}
