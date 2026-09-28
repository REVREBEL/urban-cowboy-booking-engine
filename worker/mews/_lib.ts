// Helper partagé du Worker.
// Toute requête Mews passe par ici : le `Client` et les IDs établissement sont injectés
// côté serveur (jamais exposés au front), avec un timeout dur.

export interface Env {
  // Binding Static Assets : sert le front buildé (dist/) + fallback SPA.
  ASSETS: Fetcher;
  MEWS_BASE_URL: string;
  MEWS_APP_BASE_URL: string;
  MEWS_CLIENT: string;
  MEWS_HOTEL_ID: string;
  MEWS_CONFIG_ID: string;
  MEWS_ADULT_AGE_CATEGORY_ID?: string;
  MEWS_CHILD_AGE_CATEGORY_ID?: string;
  // ★ UNIQUE endpoint de suivi → n8n → Supabase : reçoit TOUS les events du funnel
  // (chaque étape + paiement initié/validé). C'est LE endpoint du back-office.
  WEBHOOK_EVENTS?: string;
}

// POST best-effort d'un JSON vers une URL de webhook. No-op si l'URL est absente/invalide.
// N'échoue JAMAIS l'appel principal (à envelopper dans ctx.waitUntil côté handler).
export async function postWebhook(url: string | undefined, payload: unknown): Promise<void> {
  if (!url || !/^https?:\/\//.test(url)) return;
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 8_000);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
  } catch {
    // best-effort : on ne casse jamais la réservation à cause du webhook
  } finally {
    clearTimeout(to);
  }
}

// Safe Mews demo fallbacks. Production values must come from the deployment environment.
const AGE_FALLBACK = {
  adult: "5485e2f3-4034-4ca1-8a8f-ade30114c61f",
  child: "fece4b6b-39fa-4ccd-9909-afba0092eeb1",
};

// Configured properties. Demo IDs are public fixtures; production IDs come from the environment.
export interface Property {
  key: string; // "hotel" | "creole" | "villas"
  label: string;
  configId: string;
  adultAgeCategoryId: string;
  childAgeCategoryId: string | null; // null = pas d'enfants (ex. Culture Créole)
  // Infants are sent only when the selected property exposes an infant age category.
  infantAgeCategoryId: string | null;
}
export const PROPERTIES: Property[] = [
  {
    key: "hotel",
    label: "Mews Demo Hotel",
    configId: "93e27b6f-cba7-4e0b-a24a-819e1b7b388a",
    adultAgeCategoryId: "5485e2f3-4034-4ca1-8a8f-ade30114c61f",
    childAgeCategoryId: "fece4b6b-39fa-4ccd-9909-afba0092eeb1",
    infantAgeCategoryId: null,
  },
];

export const propertyByKey = (key: unknown): Property | undefined =>
  typeof key === "string" ? PROPERTIES.find((p) => p.key === key) : undefined;
export const propertyByConfig = (configId: string): Property | undefined => PROPERTIES.find((p) => p.configId === configId);

// Build Mews occupancy using the selected property's age categories.
export function occupancyForProperty(prop: Property, adults: number, children = 0, infants = 0) {
  const out: { AgeCategoryId: string; PersonCount: number }[] = [];
  if (adults > 0) out.push({ AgeCategoryId: prop.adultAgeCategoryId, PersonCount: adults });
  if (children > 0 && prop.childAgeCategoryId) out.push({ AgeCategoryId: prop.childAgeCategoryId, PersonCount: children });
  // Send infants only where a Mews age category exists.
  if (infants > 0 && prop.infantAgeCategoryId) out.push({ AgeCategoryId: prop.infantAgeCategoryId, PersonCount: infants });
  return out;
}

const TIMEOUT_MS = 12_000;

/** POST Mews → renvoie une Response JSON (passthrough). Le front shape la réponse brute. */
export async function mews(
  env: Env,
  path: string,
  body: Record<string, unknown>,
  opts: { cacheControl?: string } = {},
): Promise<Response> {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(`${env.MEWS_BASE_URL}/api/distributor/v1/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Client: env.MEWS_CLIENT, ...body }),
      signal: ctrl.signal,
    });
    const text = await r.text();
    return new Response(text, {
      status: r.ok ? 200 : r.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": opts.cacheControl ?? "no-store",
      },
    });
  } catch (e) {
    const reason = e instanceof Error && e.name === "AbortError" ? "mews_timeout" : "mews_unreachable";
    return json({ error: reason }, 502);
  } finally {
    clearTimeout(to);
  }
}

/** Variante qui renvoie l'objet parsé — pour les Functions qui doivent CURER la réponse. */
export async function mewsJson<T = unknown>(
  env: Env,
  path: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(`${env.MEWS_BASE_URL}/api/distributor/v1/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Client: env.MEWS_CLIENT, ...body }),
      signal: ctrl.signal,
    });
    const text = await r.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }
    return { ok: r.ok, status: r.status, data: data as T };
  } catch {
    return { ok: false, status: 502, data: null };
  } finally {
    clearTimeout(to);
  }
}

export const json = (data: unknown, status = 200, cacheControl = "no-store"): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": cacheControl },
  });

export const bad = (error: string, status = 400): Response => json({ error }, status);

export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

/** Construit l'OccupancyData Mews à partir de simples compteurs (côté serveur). */
export function occupancyData(env: Env, adults: number, children = 0) {
  const adultId = env.MEWS_ADULT_AGE_CATEGORY_ID || AGE_FALLBACK.adult;
  const childId = env.MEWS_CHILD_AGE_CATEGORY_ID || AGE_FALLBACK.child;
  const out: { AgeCategoryId: string; PersonCount: number }[] = [];
  if (adults > 0) out.push({ AgeCategoryId: adultId, PersonCount: adults });
  if (children > 0) out.push({ AgeCategoryId: childId, PersonCount: children });
  return out;
}

// ── Garde-fous d'entrée ────────────────────────────────────────────────────
export const isIsoDate = (s: unknown): s is string =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(s);

// Normalise une entrée de langue (clé `fr|en` OU code `fr-FR|en-GB|en-US`) vers un
// LanguageCode Mews valide. Défaut strict : fr-FR. Utilisé par tous les endpoints
// qui renvoient du contenu localisé (config, dispo, pricing) et par la création
// (langue de la page de paiement + e-mails Mews).
export const mewsLang = (v: unknown): "fr-FR" | "en-GB" => {
  const s = String(v ?? "").toLowerCase();
  return s === "en" || s === "en-gb" || s === "en-us" ? "en-GB" : "fr-FR";
};

export const clampInt = (v: unknown, min: number, max: number, dflt: number): number => {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  if (!Number.isFinite(n)) return dflt;
  return Math.max(min, Math.min(max, Math.trunc(n)));
};

type RawTaxValue = { TaxRateCode?: string | null; Value?: number | null };
type RawAmount = {
  Currency?: string;
  GrossValue?: number | null;
  NetValue?: number | null;
  TaxValues?: RawTaxValue[];
  Breakdown?: { Items?: { TaxRateCode?: string | null; NetValue?: number | null; TaxValue?: number | null }[] };
};

export interface NormalizedAmount {
  currency: string;
  gross: number | null;
  net: number | null;
  taxTotal: number | null;
  taxes: { taxRateCode: string | null; value: number }[];
}

/** Normalize a single Mews Amount object. */
export const normalizeAmount = (amount: unknown, fallbackCurrency = "EUR"): NormalizedAmount | null => {
  if (!amount || typeof amount !== "object") return null;
  const a = amount as RawAmount;
  if (a.GrossValue == null && a.NetValue == null && !a.Currency) return null;

  const currency = typeof a.Currency === "string" && a.Currency ? a.Currency : fallbackCurrency;
  // reservations/price now documents Breakdown.Items as the primary tax source;
  // TaxValues remains as a backward-compatible fallback on older responses.
  const breakdownTaxes = Array.isArray(a.Breakdown?.Items)
    ? a.Breakdown.Items
        .filter((x) => typeof x?.TaxValue === "number" && x.TaxValue !== 0)
        .map((x) => ({ taxRateCode: x.TaxRateCode ?? null, value: x.TaxValue as number }))
    : [];
  const legacyTaxes = Array.isArray(a.TaxValues)
    ? a.TaxValues
        .filter((x) => typeof x?.Value === "number")
        .map((x) => ({ taxRateCode: x.TaxRateCode ?? null, value: x.Value as number }))
    : [];
  const taxes = breakdownTaxes.length ? breakdownTaxes : legacyTaxes;

  const taxTotal =
    taxes.length > 0
      ? +taxes.reduce((sum, x) => sum + x.value, 0).toFixed(2)
      : typeof a.GrossValue === "number" && typeof a.NetValue === "number"
        ? +(a.GrossValue - a.NetValue).toFixed(2)
        : null;

  return {
    currency,
    gross: typeof a.GrossValue === "number" ? a.GrossValue : null,
    net: typeof a.NetValue === "number" ? a.NetValue : null,
    taxTotal,
    taxes,
  };
};

/** Normalize a Mews multi-currency amount map, preferring the requested ISO code. */
export const currencyAmount = (amount: unknown, preferredCurrency = "EUR"): NormalizedAmount | null => {
  if (!amount || typeof amount !== "object") return null;
  const map = amount as Record<string, unknown>;
  const direct = map[preferredCurrency];
  if (direct && typeof direct === "object") return normalizeAmount(direct, preferredCurrency);

  for (const [currency, value] of Object.entries(map)) {
    const normalized = normalizeAmount(value, currency);
    if (normalized) return normalized;
  }
  return null;
};

/** Normalize either a single Amount object or a multi-currency amount map. */
export const anyAmount = (amount: unknown, preferredCurrency = "EUR"): NormalizedAmount | null =>
  normalizeAmount(amount, preferredCurrency) ?? currencyAmount(amount, preferredCurrency);

/** Backward-compatible helper while legacy worker code is migrated. */
export const eurAmount = (amount: unknown): NormalizedAmount | null => anyAmount(amount, "EUR");
