// Petit store d'observabilité : journalise chaque appel /api/mews/* avec une
// explication « pourquoi ». Alimente le Dev Panel (transparence : on voit en
// direct quels appels Mews sont faits et à quoi ils servent).

export interface ApiLogEntry {
  id: number;
  ts: number;
  method: string;
  path: string; // ex. "mews/availability"
  label: string; // libellé humain
  why: string; // explication pédagogique
  request?: unknown; // résumé du body envoyé
  status?: number;
  ok?: boolean;
  durationMs?: number;
  response?: unknown; // résumé (clés + tailles), pas le payload brut
  error?: string;
  pending: boolean;
}

const MAX = 40;
let entries: ApiLogEntry[] = [];
let seq = 0;
const subscribers = new Set<() => void>();
const emit = () => subscribers.forEach((fn) => fn());


const SENSITIVE_KEY =
  /^(email|firstName|lastName|telephone|phone|notes?|nationalityCode|sendMarketingEmails|authorization|password|token|secret|cardNumber|creditCard|cvc|cvv)$/i;

/**
 * Keep the developer log useful without retaining guest PII or credentials.
 * The log is client-side diagnostics only, so truncate unusually deep/large payloads too.
 */
export function redactForLog(value: unknown, depth = 0): unknown {
  if (value == null || typeof value !== "object") return value;
  if (depth >= 6) return "[truncated]";

  if (Array.isArray(value)) {
    const items = value.slice(0, 50).map((item) => redactForLog(item, depth + 1));
    return value.length > 50 ? [...items, `[+${value.length - 50} more]`] : items;
  }

  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SENSITIVE_KEY.test(key) ? "[REDACTED]" : redactForLog(item, depth + 1);
  }
  return out;
}

// Résumé compact d'une réponse (1 niveau) pour ne pas garder des Mo en mémoire.
export function summarize(data: unknown): unknown {
  if (data == null) return null;
  if (Array.isArray(data)) return `Array(${data.length})`;
  if (typeof data === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      out[k] = Array.isArray(v)
        ? `Array(${v.length})`
        : v && typeof v === "object"
          ? "{…}"
          : v;
    }
    return out;
  }
  return data;
}

export const apiLog = {
  start(method: string, path: string, label: string, why: string, request?: unknown): number {
    const id = ++seq;
    entries = [
      { id, ts: Date.now(), method, path, label, why, request: redactForLog(request), pending: true },
      ...entries,
    ].slice(0, MAX);
    emit();
    return id;
  },
  finish(id: number, patch: Partial<ApiLogEntry>) {
    const safePatch: Partial<ApiLogEntry> = {
      ...patch,
      ...(patch.request !== undefined ? { request: redactForLog(patch.request) } : {}),
      ...(patch.response !== undefined ? { response: redactForLog(patch.response) } : {}),
    };
    entries = entries.map((e) => (e.id === id ? { ...e, ...safePatch, pending: false } : e));
    emit();
  },
  getAll(): ApiLogEntry[] {
    return entries;
  },
  clear() {
    entries = [];
    emit();
  },
  subscribe(fn: () => void): () => void {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },
};
