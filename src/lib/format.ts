import type { Localized } from "../types/mews";
import { getLang, LOCALE } from "./lang";

// Locale Intl courante (fr-FR | en-US). La langue est fixe par chargement de page.
const locale = () => LOCALE[getLang()];

// Sélection de la valeur localisée selon la langue active : la langue courante
// d'abord, puis repli sur l'autre, puis 1ère clé dispo.
export function loc(value: Localized | null | undefined, fallback = ""): string {
  if (!value) return fallback;
  const order =
    getLang() === "en"
      ? ["en-US", "en-GB", "en", "fr-FR", "fr"]
      : ["fr-FR", "fr", "en-US", "en-GB", "en"];
  for (const k of order) {
    const v = value[k];
    if (v) return v;
  }
  return Object.values(value)[0] || fallback;
}

// Nom localisé d'un pays à partir de son code ISO (FR/EN via Intl.DisplayNames).
const regionCache = new Map<string, Intl.DisplayNames>();
export function regionName(code: string): string {
  const loc = locale();
  let dn = regionCache.get(loc);
  if (!dn) {
    dn = new Intl.DisplayNames([loc], { type: "region" });
    regionCache.set(loc, dn);
  }
  try {
    return dn.of(code) ?? code;
  } catch {
    return code;
  }
}

// Currency formatters cached by locale + ISO currency + decimals.
const numCache = new Map<string, Intl.NumberFormat>();
const moneyFmt = (currency: string, decimals: number) => {
  const code = (currency || "USD").toUpperCase();
  // USD prices belong to the Catskills property and should retain the familiar
  // American price treatment ($282.24) in both language variants. Formatting
  // USD with fr-FR/en-GB produces "$US"/"US$", which reads like an accidental
  // currency conversion rather than the hotel's native rate.
  const formatLocale = code === "USD" ? "en-US" : locale();
  const key = `${formatLocale}:${code}:${decimals}`;
  let f = numCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(formatLocale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    numCache.set(key, f);
  }
  return f;
};

// Generic ISO-4217 formatter. Default decimal behavior preserves the existing UI:
// whole values omit cents, fractional values show two.
export function money(
  value: number | null | undefined,
  currency: string,
  opts?: { decimals?: 0 | 2 },
): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const d = opts?.decimals ?? (Number.isInteger(value) ? 0 : 2);
  try {
    return moneyFmt(currency, d).format(value);
  } catch {
    return `${currency} ${value.toFixed(d)}`;
  }
}

// Backward-compatible alias used by legacy Martinique-only UI while the remaining
// property-specific screens are migrated to generic currency formatting.
export function eur(value: number | null | undefined, opts?: { decimals?: 0 | 2 }): string {
  return money(value, "EUR", opts);
}

// Normalise une date (yyyy-mm-dd ou ISO) en ISO 8601 UTC minuit.
export function toUtc(date: string): string {
  if (!date) return date;
  return /T/.test(date) ? date : `${date}T00:00:00Z`;
}

// Mews stay boundaries must represent midnight at the property, not UTC midnight.
// Catskills is currently the only configured property, so booking API calls use
// America/New_York while display-only date math can continue using toUtc().
export function toPropertyUtc(date: string, timeZone = "America/New_York"): string {
  if (!date || /T/.test(date)) return date;
  const guess = Date.parse(`${date}T00:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(guess));
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const representedAsUtc = Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"), value("second"));
  return new Date(guess - (representedAsUtc - guess)).toISOString();
}

// Nombre de nuits entre deux dates (calcul en UTC, robuste DST).
export function nights(start: string, end: string): number {
  const a = Date.parse(toUtc(start));
  const b = Date.parse(toUtc(end));
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

const dateCache = new Map<string, Intl.DateTimeFormat>();
const dateFmtFor = (opts: Intl.DateTimeFormatOptions, tag: string) => {
  const key = `${locale()}:${tag}`;
  let f = dateCache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale(), { ...opts, timeZone: "UTC" });
    dateCache.set(key, f);
  }
  return f;
};

export function fmtDate(date: string): string {
  const t = Date.parse(toUtc(date));
  return Number.isNaN(t)
    ? date
    : dateFmtFor({ day: "numeric", month: "short", year: "numeric" }, "short").format(new Date(t));
}
export function fmtDateLong(date: string): string {
  const t = Date.parse(toUtc(date));
  return Number.isNaN(t)
    ? date
    : dateFmtFor({ weekday: "long", day: "numeric", month: "long" }, "long").format(new Date(t));
}

// URL d'image Mews : `${ImageBaseUrl}/{imageId}?width=…`. Renvoie null si pas d'id.
// ⚠️ Le CDN Mews attend `width` (et non `w`) : avec `w`, le prod sert l'image pleine
// résolution TRONQUÉE à 1 Mio (illisible → image cassée). `width` renvoie une image
// complète ET redimensionnée (prod + demo).
export function imgUrl(baseUrl: string | undefined, imageId: string | null | undefined, width = 900): string | null {
  if (!baseUrl || !imageId) return null;
  return `${baseUrl}/${imageId}?width=${width}`;
}

// yyyy-mm-dd du jour (en UTC) + ajout de N jours — pour les valeurs par défaut du sélecteur.
export function isoDay(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
