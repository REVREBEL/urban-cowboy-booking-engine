import { useState, useSyncExternalStore } from "react";
import { apiLog, type ApiLogEntry } from "@/lib/apiLog";
import { IconChevron, IconClose } from "@/components/icons/cowboy-icons";

function useApiLog(): ApiLogEntry[] {
  return useSyncExternalStore(apiLog.subscribe, apiLog.getAll, apiLog.getAll);
}

// ── Collapsible JSON Tree (expand/collapse objects & arrays) ──────────────────
function Primitive({ value }: { value: unknown }) {
  if (value === null) return <span className="text-pink-300">null</span>;
  if (value === undefined) return <span className="text-cream/40">undefined</span>;
  const t = typeof value;
  if (t === "string") return <span className="text-emerald-300 break-all">"{value as string}"</span>;
  if (t === "number") return <span className="text-sky-300">{String(value)}</span>;
  if (t === "boolean") return <span className="text-amber-300">{String(value)}</span>;
  return <span className="text-cream/70">{String(value)}</span>;
}

function JsonNode({ name, value, depth }: { name?: string; value: unknown; depth: number }) {
  const [open, setOpen] = useState(depth < 1); // root open, rest collapsed
  const isObj = value !== null && typeof value === "object";

  if (!isObj) {
    return (
      <div className="break-words">
        {name !== undefined && <span className="text-turquoise-vivid">{name}</span>}
        {name !== undefined && <span className="text-cream/40">: </span>}
        <Primitive value={value} />
      </div>
    );
  }

  const isArr = Array.isArray(value);
  const entries: [string, unknown][] = isArr
    ? (value as unknown[]).map((v, i) => [String(i), v])
    : Object.entries(value as Record<string, unknown>);
  const summary = isArr ? `Array(${(value as unknown[]).length})` : `{${entries.length}}`;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-1 text-left transition hover:text-cream"
      >
        <IconChevron className={`mt-[3px] h-3 w-3 shrink-0 text-cream/40 transition-transform ${open ? "rotate-90" : ""}`} />
        <span>
          {name !== undefined && <span className="text-turquoise-vivid">{name}</span>}
          {name !== undefined && <span className="text-cream/40">: </span>}
          <span className="text-cream/45">{summary}</span>
        </span>
      </button>
      {open && (
        <div className="ml-2 border-l border-white/10 pl-2.5">
          {entries.slice(0, 200).map(([k, v]) => (
            <JsonNode key={k} name={k} value={v} depth={depth + 1} />
          ))}
          {entries.length > 200 && (
            <div className="text-[10px] text-cream/30">… {entries.length - 200} more items</div>
          )}
        </div>
      )}
    </div>
  );
}

const JsonTree = ({ value }: { value: unknown }) => (
  <div className="overflow-x-auto rounded-lg bg-black/40 p-2.5 font-mono text-[11px] leading-relaxed text-cream/80">
    <JsonNode value={value} depth={0} />
  </div>
);

const CALL_META: Record<string, { label: string; why: string }> = {
  hotel: {
    label: "Hotel configuration",
    why: "Loads the hotel configuration (room categories, photos, products/extras, currency, policies, and payment gateway) in the current language. Called once at startup and cached server-side for 5 minutes.",
  },
  availability: {
    label: "Availability & pricing",
    why: "Core booking-engine call: queries Mews for available rooms and rates in the property currency for the selected dates and occupancy. The frontend groups results by room type and derives starting rates.",
  },
  pricing: {
    label: "Exact room-type pricing",
    why: "When room details open, confirms the exact price for that room type using the selected occupancy and currency.",
  },
  "reservation-price": {
    label: "Final reservation quote",
    why: "Calculates the exact total for the selected rate and extras, including the amount Mews says is due at confirmation.",
  },
  reservation: {
    label: "Create reservation",
    why: "Creates the reservation in Mews and prepares payment. Mews returns the payment request used to build the secure hosted-payment URL.",
  },
  "reservation-status": {
    label: "Payment verification",
    why: "After returning from the payment page, verifies that payment completed successfully and rechecks while payment remains pending.",
  },
  "payment-link": {
    label: "Resume payment",
    why: "Rebuilds the Mews payment link for a reservation with payment still pending.",
  },
  voucher: {
    label: "Promo code validation",
    why: "Checks whether a promo code is valid so a new availability search can expose eligible private rates.",
  },
  geo: {
    label: "Visitor country (IP)",
    why: "Infers the visitor country from Cloudflare IP metadata, with no external API, to preselect the phone country code and support US/Canada-specific presets.",
  },
  "products-debug": {
    label: "Mews product catalog diagnostic",
    why: "Shows the raw Mews configuration product objects plus the current add-on inclusion/exclusion decision, so missing products can be traced to Mews data versus local filtering.",
  },
  track: {
    label: "Cart tracking → n8n",
    why: "Sends cart state (status, selection, and contact details) to n8n throughout the funnel to support abandoned, payment-started, and completed booking records.",
  },
  "room-type-reviews": {
    label: "Room-type reviews · Webflow CMS",
    why: "Loads published review copy for Room Types from Webflow, joined by Mews Room Type ID. Blank CMS review fields intentionally return no review.",
  },
  locations: {
    label: "Location chrome · Webflow CMS",
    why: "Loads the published Location CMS record bound to each configured Mews property for footer name, city/state, and legal links.",
  },
};

function callMeta(entry: ApiLogEntry) {
  const endpoint = entry.path.split("?")[0];
  return CALL_META[endpoint] ?? { label: entry.label, why: entry.why };
}

// ── Dev Panel ─────────────────────────────────────────────────────────────────
export function DevPanel() {
  const entries = useApiLog();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"calls" | "sources">("calls");
  const [expanded, setExpanded] = useState<number | null>(null);
  const pending = entries.some((e) => e.pending);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 left-4 z-[60] inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 font-mono text-xs font-semibold text-cream shadow-float transition hover:bg-teal-deep"
        aria-expanded={open}
        aria-label="API call log"
      >
        <span className="relative flex h-2 w-2">
          {pending && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-turquoise-vivid opacity-75" />}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${pending ? "bg-turquoise-vivid" : "bg-turquoise"}`} />
        </span>
        {"</>"} API
        {entries.length > 0 && (
          <span className="rounded-full bg-turquoise-vivid px-1.5 text-[10px] text-ink">{entries.length}</span>
        )}
      </button>

      {open && (
        <section
          className="fixed bottom-16 left-4 z-[60] flex max-h-[74vh] w-[min(460px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink text-cream shadow-float"
          aria-label="Mews API call log"
        >
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <Tab active={view === "calls"} onClick={() => setView("calls")}>
                Calls{entries.length ? ` (${entries.length})` : ""}
              </Tab>
              <Tab active={view === "sources"} onClick={() => setView("sources")}>
                Data sources
              </Tab>
            </div>
            <div className="flex items-center gap-1">
              {view === "calls" && (
                <button
                  type="button"
                  onClick={() => apiLog.clear()}
                  className="rounded-md px-2 py-1 font-mono text-[11px] text-cream/60 hover:bg-white/10 hover:text-cream"
                >
                  clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-7 w-7 place-items-center rounded-md text-cream/60 hover:bg-white/10 hover:text-cream"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="no-scrollbar flex-1 overflow-y-auto">
            {view === "calls" ? <CallsView entries={entries} expanded={expanded} setExpanded={setExpanded} /> : <SourcesView />}
          </div>

          <footer className="border-t border-white/10 px-4 py-2 text-center text-[10px] text-cream/35">
            Mews calls pass through the Worker — Client & IDs remain server-side.
          </footer>
        </section>
      )}
    </>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
        active ? "bg-white/10 text-cream" : "text-cream/50 hover:text-cream"
      }`}
    >
      {children}
    </button>
  );
}

function CallsView({
  entries,
  expanded,
  setExpanded,
}: {
  entries: ApiLogEntry[];
  expanded: number | null;
  setExpanded: (id: number | null) => void;
}) {
  if (entries.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-cream/40">
        No calls yet.
        <br />
        Run a search to see Mews calls appear here.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-white/5">
      {entries.map((e) => {
        const isOpen = expanded === e.id;
        const meta = callMeta(e);
        return (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : e.id)}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition hover:bg-white/5"
            >
              <StatusDot e={e} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-cream">{meta.label}</span>
                <span className="block truncate font-mono text-[11px] text-cream/45">
                  {e.method} /{e.path}
                </span>
              </span>
              <span className="shrink-0 text-right font-mono text-[11px] text-cream/50">
                {e.pending ? "…" : `${e.status ?? "ERR"}`}
                {e.durationMs != null && <span className="block text-cream/35">{e.durationMs}ms</span>}
              </span>
            </button>
            {isOpen && (
              <div className="space-y-3 bg-black/20 px-4 py-3">
                <Field title="Why this call?">
                  <p className="text-[12px] leading-relaxed text-cream/75">{meta.why}</p>
                </Field>
                {e.request != null && (
                  <Field title="Request (sent to proxy)">
                    <JsonTree value={e.request} />
                  </Field>
                )}
                {e.error && (
                  <Field title="Error">
                    <pre className="rounded-lg bg-black/40 p-2.5 font-mono text-[11px] text-red-300">{e.error}</pre>
                  </Field>
                )}
                {e.response != null && (
                  <Field title="Mews response (click to expand arrays)">
                    <JsonTree value={e.response} />
                  </Field>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ── "Sources" Tab: real (Mews) vs hardcoded (demo) ───────────────────────────
const LIVE: string[] = [
  "Rooms: name, description, photos, capacity (beds)",
  "Availability: 'Only N rooms left' = actual AvailableRoomCount",
  "Prices: 'starting at', per rate, /night, total, strikethrough price (MaxPrice) → discount derived",
  "Rates: name, description, private/public, payment mode",
  "Extras: name, description, EUR price, billing",
  "Booking: confirmation #, total, payment status",
  "Room detail review quotes: published Webflow Room Type CMS fields, keyed by Mews Room Type ID",
  "Booking footer: published Webflow Location name, city/state, and legal links",
];
const MOCK: string[] = [
  "Aggregate rating/count badges ('9.4 · 1,248', '9.0 · 129') — no aggregate review API connected",
  "'X people viewing', 'booked N times' — generated (deterministic per room)",
  "'Guest favorite', 'High demand' — marketing badges",
  "'High demand for your dates' banner — copy",
  "'Free cancellation' — copy (actual policy = Mews RateGroups, not connected)",
  "'Holding your room for 09:58' timer — cosmetic",
  "Detailed amenities (Wi-Fi, AC, terrace, view) — generic",
  "Homepage visuals — placeholders (site CDN)",
];

function SourcesView() {
  return (
    <div className="space-y-4 px-4 py-3 text-[12px] leading-relaxed">
      <p className="text-cream/60">
        Simple rule: <strong className="text-cream">everything in the 'Calls' tab is real</strong>{" "}
        (live Mews responses). The rest of the interface listed below is <strong className="text-cream">hardcoded</strong>{" "}
        (conversion demo, to be connected in prod).
      </p>

      <div>
        <p className="mb-1.5 inline-flex items-center gap-2 font-semibold text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Live Data · Mews
        </p>
        <ul className="space-y-1">
          {LIVE.map((t) => (
            <li key={t} className="flex gap-2 text-cream/75">
              <span className="text-emerald-400">✓</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-1.5 inline-flex items-center gap-2 font-semibold text-amber-300">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Demo Data · Hardcoded
        </p>
        <ul className="space-y-1">
          {MOCK.map((t) => (
            <li key={t} className="flex gap-2 text-cream/75">
              <span className="text-amber-400">⚠</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-cream/40">
          Remaining demo conversion signals are centralized in <code className="text-cream/60">src/components/conversion.tsx</code> (+ amenities in{" "}
          <code className="text-cream/60">RoomDetailDrawer</code>). Room-detail review quotes now come from published Webflow CMS content.
        </p>
      </div>
    </div>
  );
}

function StatusDot({ e }: { e: ApiLogEntry }) {
  const color = e.pending ? "bg-amber-400" : e.ok ? "bg-emerald-400" : "bg-red-400";
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      {e.pending && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />}
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
    </span>
  );
}

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-turquoise-vivid/80">{title}</p>
      {children}
    </div>
  );
}