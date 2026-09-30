// FRONTIÈRE RÉSEAU UNIQUE du front. Aucun composant n'appelle Mews directement :
// tout passe par /api/mews/* (Pages Functions, même origine). Le front ne connaît
// ni le `Client`, ni les UUID établissement.
//
// Chaque appel est journalisé (apiLog) avec une explication « pourquoi » → Dev Panel.

import type {
  AvailabilityResponse,
  HotelConfig,
  PricingResult,
  ReservationQuoteResult,
  ReservationCreateResult,
  ReservationStatusResult,
} from "../types/mews";
import { toUtc } from "./format";
import { getLang, mewsLang } from "./lang";
import { t } from "../i18n";
import { apiLog } from "./apiLog";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(code: string, status: number, details?: unknown) {
    super(code);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

interface Meta {
  label: string;
  why: string;
  request?: unknown;
}

async function call<T>(path: string, init: RequestInit | undefined, meta: Meta): Promise<T> {
  const id = apiLog.start(init?.method ?? "GET", path, meta.label, meta.why, meta.request);
  const t0 = performance.now();
  const ms = () => Math.round(performance.now() - t0);

  let res: Response;
  try {
    res = await fetch(`/api/mews/${path}`, init);
  } catch {
    apiLog.finish(id, { ok: false, error: "network_error", durationMs: ms() });
    throw new ApiError("network_error", 0);
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const code = (data as { error?: string } | null)?.error ?? `http_${res.status}`;
    apiLog.finish(id, { ok: false, status: res.status, durationMs: ms(), error: code, response: data });
    throw new ApiError(code, res.status, data);
  }

  apiLog.finish(id, { ok: true, status: res.status, durationMs: ms(), response: data });
  return data as T;
}

const post = <T>(path: string, body: unknown, meta: Omit<Meta, "request">) =>
  call<T>(
    path,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    { ...meta, request: body },
  );

export interface SearchParams {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants: number; // bébés en berceau — gratuits + non décomptés
  voucherCode?: string;
  properties?: string[]; // hébergements cochés (hotel/creole/villas)
  currencyCode?: string;
}

export interface GuestPayload {
  email: string;
  firstName: string;
  lastName: string;
  telephone?: string;
  nationalityCode?: string;
  sendMarketingEmails?: boolean;
}

export interface ReservationLine {
  roomCategoryId: string;
  startUtc: string;
  endUtc: string;
  rateId: string;
  adults: number;
  children: number;
  infants?: number; // bébés en berceau — non décomptés, consignés en note à la résa
  productIds?: string[];
  voucherCode?: string;
  notes?: string;
}

export const api = {
  hotel: () =>
    call<HotelConfig>(`hotel?lang=${getLang()}`, undefined, {
      label: "Hotel configuration",
      why: "Loads the hotel configuration (room categories, photos, products/extras, currency, policies, and payment gateway) in the current language. Called once at startup and cached server-side for 5 minutes.",
    }),

  availability: (p: SearchParams) =>
    post<AvailabilityResponse>(
      "availability",
      {
        startUtc: toUtc(p.checkIn),
        endUtc: toUtc(p.checkOut),
        adults: p.adults,
        children: p.children,
        infants: p.infants,
        languageCode: mewsLang(),
        ...(p.voucherCode ? { voucherCode: p.voucherCode } : {}),
        ...(p.properties?.length ? { properties: p.properties } : {}),
        ...(p.currencyCode ? { currencyCode: p.currencyCode } : {}),
      },
      {
        label: "Availability & pricing",
        why: "Core booking-engine call: queries Mews for available rooms and rates in the property currency for the selected dates and occupancy. The frontend groups results by room type and derives starting rates.",
      },
    ),

  pricing: (p: {
    checkIn: string;
    checkOut: string;
    roomCategoryId: string;
    adults: number;
    children: number;
    productIds?: string[];
    voucherCode?: string;
    currencyCode?: string;
  }) =>
    post<PricingResult>(
      "pricing",
      {
        startUtc: toUtc(p.checkIn),
        endUtc: toUtc(p.checkOut),
        roomCategoryId: p.roomCategoryId,
        adults: p.adults,
        children: p.children,
        languageCode: mewsLang(),
        ...(p.productIds?.length ? { productIds: p.productIds } : {}),
        ...(p.voucherCode ? { voucherCode: p.voucherCode } : {}),
        ...(p.currencyCode ? { currencyCode: p.currencyCode } : {}),
      },
      {
        label: "Exact room-type pricing",
        why: "When room details open, confirms the exact price for that room type using the selected occupancy and currency.",
      },
    ),

  reservationPrice: (p: {
    checkIn: string;
    checkOut: string;
    roomCategoryId: string;
    rateId: string;
    adults: number;
    children: number;
    infants: number;
    property?: string | null;
    productIds?: string[];
    voucherCode?: string;
    currencyCode?: string;
  }) =>
    post<ReservationQuoteResult>(
      "reservation-price",
      {
        startUtc: toUtc(p.checkIn),
        endUtc: toUtc(p.checkOut),
        roomCategoryId: p.roomCategoryId,
        rateId: p.rateId,
        adults: p.adults,
        children: p.children,
        infants: p.infants,
        ...(p.property ? { property: p.property } : {}),
        ...(p.productIds?.length ? { productIds: p.productIds } : {}),
        ...(p.voucherCode ? { voucherCode: p.voucherCode } : {}),
        ...(p.currencyCode ? { currencyCode: p.currencyCode } : {}),
      },
      {
        label: "Final reservation quote",
        why: "Calculates the exact total for the selected rate and extras, including the amount Mews says is due at confirmation.",
      },
    ),

  createReservation: (payload: {
    customer: GuestPayload;
    booker?: GuestPayload;
    property?: string; // hébergement de la chambre choisie → config Mews côté serveur
    reservations: ReservationLine[];
    returnUrl?: string;
  }) =>
    post<ReservationCreateResult>("reservation", { ...payload, languageCode: mewsLang() }, {
      label: "Create reservation",
      why: "Creates the reservation in Mews (reservationGroups/create) and prepares payment. Mews returns a PaymentRequestId and the server builds the secure payment URL.",
    }),

  reservationStatus: (reservationGroupId: string) =>
    post<ReservationStatusResult>("reservation-status", { reservationGroupId }, {
      label: "Payment verification",
      why: "After returning from the payment page, verifies via reservationGroups/get that payment completed successfully. Rechecked while payment remains pending.",
    }),

  paymentLink: (reservationGroupId: string, returnUrl: string) =>
    post<{ paymentUrl: string | null; paid: boolean }>("payment-link", { reservationGroupId, returnUrl }, {
      label: "Resume payment",
      why: "Rebuilds the Mews payment link for a reservation with payment still pending.",
    }),

  validateVoucher: (voucherCode: string) =>
    post<unknown>("voucher", { voucherCode }, {
      label: "Promo code validation",
      why: "Checks whether a promo code is valid. A new availability search with the code can unlock eligible private rates.",
    }),

  // Détection best-effort du pays via l'IP (Cloudflare). Pré-remplit l'indicatif
  // téléphonique + presets US/CA. Ne stocke rien ; échoue silencieusement.
  geo: () =>
    call<{ country: string | null }>("geo", undefined, {
      label: "Visitor country (IP)",
      why: "Infers the visitor country from Cloudflare IP metadata, with no external API, to preselect the phone country code and support US/Canada-specific presets.",
    }).catch(() => ({ country: null })),

  // Suivi de panier (funnel) → n8n via le Worker. Best-effort : n'échoue jamais l'UI.
  track: (payload: unknown): Promise<{ ok: boolean }> =>
    post<{ ok: boolean }>("track", payload, {
      label: "Cart tracking → n8n",
      why: "Sends cart state (status, selection, and contact details) to n8n throughout the funnel to support abandoned, payment-started, and completed booking records.",
    }).catch(() => ({ ok: false })),
};

// Messages d'erreur lisibles (localisés) à partir des codes renvoyés par les Functions.
export function errorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return t("err.unexpected");
  switch (err.code) {
    case "network_error":
      return t("err.network");
    case "mews_timeout":
      return t("err.timeout");
    case "mews_unreachable":
      return t("err.unreachable");
    case "missing_or_invalid_dates":
      return t("err.dates");
    case "end_before_start":
      return t("err.endBeforeStart");
    case "invalid_customer":
      return t("err.customer");
    case "no_valid_reservations":
      return t("err.noReservations");
    case "exceeding_availability":
      return t("err.exceeding");
    default:
      if (err.status === 401) return t("err.unauthorized");
      return t("err.generic");
  }
}
