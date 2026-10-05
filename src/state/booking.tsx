import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api";
import { getLang } from "../lib/lang";
import { getUtms } from "../lib/utm";
import { nights as countNights } from "../lib/format";
import { buildRooms, shapeProducts, cheapestDrinkProduct, mandatoryReveillon, isReveillonProduct } from "../lib/shaping";
import { rankRecommendedRooms } from "../lib/roomMatching";
import { parseRecommendationPreferences } from "../lib/topMatch";
import { BOOKING_FEATURES } from "../config/bookingFeatures";
import type { AddonSchedulePreference } from "../components/booking/extras/addon-types";
import type {
  HotelConfig,
  ReservationCreateResult,
  ReservationQuoteResult,
  ShapedProduct,
  ShapedRate,
  ShapedRoom,
} from "../types/mews";

export type Step = "dates" | "results" | "rates" | "guest" | "upgrade" | "extras" | "payment" | "confirmation";
export const STEP_ORDER: Step[] = ["dates", "results", "rates", "guest", "upgrade", "extras", "payment", "confirmation"];

// Statuts de panier poussés vers n8n (base des paniers).
// Events de suivi (funnel) → n8n → Supabase.
//  • etape           : une étape atteinte (dates → confirmation), le `step` précise laquelle
//  • paiement_initie : « Payer » cliqué (réservation créée + demande de paiement Mews)
//  • paiement_valide : paiement encaissé (confirmé par Mews)
// « Paiement non abouti » = paiement_initie SANS paiement_valide (dérivé côté Supabase).
export type CartStatus = "etape" | "paiement_initie" | "paiement_valide";

// Identifiant de panier — persistant (localStorage) pour survivre à la redirection
// paiement (Mews → /confirmation). Régénéré à chaque nouvelle recherche (resetAll).
const CART_ID_KEY = "urban_cowboy_cart_id";
function newCartId(): string {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  try {
    localStorage.setItem(CART_ID_KEY, id);
  } catch {
    /* localStorage indispo (navigation privée) — id éphémère, ok */
  }
  return id;
}
function loadCartId(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(CART_ID_KEY) || newCartId();
  } catch {
    return newCartId();
  }
}

export interface Guest {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  nationalityCode: string;
  sendMarketingEmails: boolean;
  notes: string;
}

const emptyGuest: Guest = {
  firstName: "",
  lastName: "",
  email: "",
  telephone: "",
  nationalityCode: "FR",
  sendMarketingEmails: false,
  notes: "",
};

// Hébergements sélectionnables (Booking Engine configs) — cf. worker _lib PROPERTIES.
export const DEFAULT_PROPERTIES = ["hotel", "creole", "villas"];

interface BookingState {
  step: Step;
  checkIn: string; // yyyy-mm-dd
  checkOut: string;
  adults: number;
  children: number;
  infants: number; // bébés en berceau (0-3) — gratuits ET non décomptés de l'occupation
  voucherCode: string;
  properties: string[]; // hébergements cochés (hotel/creole/villas)
  roomTypeId: string | null;
  rateId: string | null;
  productIds: string[];
  // Extra HORS Mews : simple intérêt « transfert aéroport » (booléen). N'affecte ni le
  // prix ni la réservation Mews — envoyé à n8n pour déclencher une relance post-paiement.
  airportTransfer: boolean;
  rgid: string | null; // reservation group id (retour paiement)
}

// ── URL <-> state ────────────────────────────────────────────────────────────
function readUrl(): Partial<BookingState> {
  if (typeof window === "undefined") return {};
  const q = new URLSearchParams(window.location.search);
  const num = (k: string, d: number) => {
    const v = parseInt(q.get(k) ?? "", 10);
    return Number.isFinite(v) ? v : d;
  };
  const stepRaw = q.get("step") as Step | null;
  const requestedStep = stepRaw && STEP_ORDER.includes(stepRaw) ? stepRaw : undefined;
  const step =
    requestedStep === "upgrade" && !BOOKING_FEATURES.roomUpgradeStep
      ? "extras"
      : requestedStep;
  const out: Partial<BookingState> = {};
  if (q.get("in")) out.checkIn = q.get("in")!;
  if (q.get("out")) out.checkOut = q.get("out")!;
  if (q.has("adults")) out.adults = num("adults", 2);
  if (q.has("children")) out.children = num("children", 0);
  if (q.has("babies")) out.infants = num("babies", 0);
  if (q.get("voucher")) out.voucherCode = q.get("voucher")!;
  if (q.get("props")) out.properties = q.get("props")!.split(",").filter(Boolean);
  if (q.get("cat")) out.roomTypeId = q.get("cat");
  if (q.get("rate")) out.rateId = q.get("rate");
  if (q.get("products")) out.productIds = q.get("products")!.split(",").filter(Boolean);
  if (q.has("transfer")) out.airportTransfer = q.get("transfer") === "1";
  if (q.get("rgid")) out.rgid = q.get("rgid");
  // un retour paiement (?rgid=…) force l'étape confirmation
  if (out.rgid) out.step = "confirmation";
  else if (step) out.step = step;
  return out;
}

// Guest PII intentionally stays out of the URL. Shareable/deep links only contain
// booking criteria and non-personal selection state.
function writeUrl(s: BookingState) {
  if (typeof window === "undefined") return;
  const current = new URLSearchParams(window.location.search);
  const q = new URLSearchParams();
  if (s.checkIn) q.set("in", s.checkIn);
  if (s.checkOut) q.set("out", s.checkOut);
  q.set("adults", String(s.adults));
  if (s.children) q.set("children", String(s.children));
  if (s.infants) q.set("babies", String(s.infants));
  if (s.voucherCode) q.set("voucher", s.voucherCode);
  if (s.properties.length && s.properties.length < DEFAULT_PROPERTIES.length) q.set("props", s.properties.join(","));
  if (s.step !== "dates") q.set("step", s.step);
  if (s.roomTypeId) q.set("cat", s.roomTypeId);
  if (s.rateId) q.set("rate", s.rateId);
  if (s.productIds.length) q.set("products", s.productIds.join(","));
  if (s.airportTransfer) q.set("transfer", "1");
  if (s.rgid) q.set("rgid", s.rgid);
  // Préserve la langue non-défaut dans l'URL (writeUrl reconstruit les params à zéro).
  if (getLang() === "fr") q.set("lang", "fr");
  // REV-102 recommendation inputs are owned by the quiz/ranking layer. Preserve
  // them while this booking state serializes its own fields so REV-103 can explain
  // the actual ranked result without losing the guest's choices.
  for (const key of ["party", "dog", "interest", "interest2"] as const) {
    const value = current.get(key);
    if (value) q.set(key, value);
  }
  const qs = q.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", url);
}

// ── Context ───────────────────────────────────────────────────────────────────
interface BookingContextValue extends BookingState {
  // config hôtel
  hotel: HotelConfig | null;
  imageBaseUrl: string;
  products: ShapedProduct[];
  hotelLoading: boolean;
  hotelError: boolean;
  // vrai pendant la réhydratation d'un lien profond (App gèle l'étape le temps du chargement)
  hydrating: boolean;
  reloadHotel: () => void;
  // sélection runtime (hydratée depuis les résultats)
  selectedRoom: ShapedRoom | null;
  selectedRate: ShapedRate | null;
  availableRooms: ShapedRoom[]; // liste des résultats (pour le surclassement)
  guest: Guest;
  created: ReservationCreateResult | null;
  quote: ReservationQuoteResult | null;
  quoteLoading: boolean;
  quoteError: boolean;
  refreshQuote: () => void;
  // dérivés
  nightsCount: number;
  guestsCount: number;
  selectedProducts: ShapedProduct[];
  addonPreferences: Record<string, AddonSchedulePreference>;
  selectedAddOnDisplayByProduct: Record<string, string>;
  productsTotal: number;
  roomTotal: number;
  grandTotal: number;
  currency: string;
  totalNet: number | null;
  totalTax: number | null;
  amountDueNow: number | null;
  remainingBalance: number | null;
  // actions
  setSearch: (
    p: Partial<
      Pick<BookingState, "checkIn" | "checkOut" | "adults" | "children" | "infants" | "voucherCode" | "properties">
    >,
  ) => void;
  selectRoomRate: (room: ShapedRoom, rate: ShapedRate) => void;
  selectRoom: (room: ShapedRoom) => void;
  hydrateSelection: (room: ShapedRoom | null, rate: ShapedRate | null) => void;
  setAvailableRooms: (rooms: ShapedRoom[]) => void;
  // Filtre d'affichage des hébergements (page résultats) : change `properties`
  // SANS invalider la recherche/sélection (contrairement à setSearch) → bascule
  // instantanée quand on ajoute un hébergement depuis un teaser.
  setProperties: (keys: string[]) => void;
  clearSelection: () => void;
  toggleProduct: (id: string) => void;
  setProductPresentation: (
    id: string,
    presentation: { name: string; description: string } | null,
  ) => void;
  setAddonPreference: (displayId: string, preference: AddonSchedulePreference | null) => void;
  setSelectedAddOnDisplay: (productId: string, displayId: string | null) => void;
  setAirportTransfer: (v: boolean) => void; // extra hors Mews (relance n8n)
  setGuest: (p: Partial<Guest>) => void;
  setCreated: (r: ReservationCreateResult | null) => void;
  goTo: (step: Step) => void;
  resetAll: () => void;
  // suivi panier → n8n
  cartId: string;
  track: (status: CartStatus, extra?: Record<string, unknown>) => Promise<{ ok: boolean }>;
}

const Ctx = createContext<BookingContextValue | null>(null);

const defaults: BookingState = {
  step: "dates",
  checkIn: "",
  checkOut: "",
  adults: 2,
  children: 0,
  infants: 0,
  voucherCode: "",
  properties: DEFAULT_PROPERTIES,
  roomTypeId: null,
  rateId: null,
  productIds: [],
  airportTransfer: false,
  rgid: null,
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(() => ({ ...defaults, ...readUrl() }));
  const [selectedRoom, setSelectedRoom] = useState<ShapedRoom | null>(null);
  const [selectedRate, setSelectedRate] = useState<ShapedRate | null>(null);
  const [availableRooms, setAvailableRoomsState] = useState<ShapedRoom[]>([]);
  // Réhydratation d'un lien profond partagé : vrai tant que la sélection (chambre/tarif)
  // encodée dans l'URL n'est pas reconstruite, pour ne pas afficher (et faire rebondir)
  // une étape > résultats avant que les données soient chargées.
  const [hydrating, setHydrating] = useState<boolean>(() => {
    const u = readUrl();
    const deep = u.step === "guest" || u.step === "upgrade" || u.step === "extras" || u.step === "payment";
    return !!(deep && u.roomTypeId && u.checkIn && u.checkOut);
  });
  const [guest, setGuestState] = useState<Guest>(() => ({ ...emptyGuest }));
  const [created, setCreatedState] = useState<ReservationCreateResult | null>(null);
  const [quote, setQuote] = useState<ReservationQuoteResult | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(false);
  const [quoteRefreshKey, setQuoteRefreshKey] = useState(0);
  const [productPresentation, setProductPresentationState] = useState<
    Record<string, { name: string; description: string }>
  >({});
  const [addonPreferences, setAddonPreferences] = useState<
    Record<string, AddonSchedulePreference>
  >({});
  const [selectedAddOnDisplayByProduct, setSelectedAddOnDisplayByProduct] =
    useState<Record<string, string>>({});
  const [cartId, setCartId] = useState<string>(loadCartId);

  const [hotel, setHotel] = useState<HotelConfig | null>(null);
  const [hotelLoading, setHotelLoading] = useState(true);
  const [hotelError, setHotelError] = useState(false);

  // Keep only non-personal booking state in the shareable URL.
  useEffect(() => writeUrl(state), [state]);

  const loadHotel = useCallback(() => {
    setHotelLoading(true);
    setHotelError(false);
    api
      .hotel()
      .then((h) => setHotel(h))
      .catch(() => setHotelError(true))
      .finally(() => setHotelLoading(false));
  }, []);

  useEffect(loadHotel, [loadHotel]);

  // Lien profond partagé (?step=upgrade&cat&rate&in&out) : on arrive sur une étape
  // qui exige une chambre choisie, mais seule l'URL est chargée. On récupère la dispo
  // et on reconstruit selectedRoom/selectedRate + availableRooms AVANT d'afficher
  // l'étape (App gèle le rendu tant que `hydrating`). Ne tourne qu'une fois, au boot.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    if (hotelError) {
      setHydrating(false);
      return;
    }
    if (!hotel) return; // attendre le catalogue (buildRooms en dépend)
    hydratedRef.current = true;
    const deep = ["rates", "guest", "upgrade", "extras", "payment"].includes(state.step);
    if (!deep || selectedRoom || availableRooms.length || !state.roomTypeId || !state.checkIn || !state.checkOut) {
      setHydrating(false);
      return;
    }
    let alive = true;
    setHydrating(true);
    api
      .availability({
        checkIn: state.checkIn,
        checkOut: state.checkOut,
        adults: state.adults,
        children: state.children,
        infants: state.infants,
        voucherCode: state.voucherCode,
        currencyCode: hotel.DefaultCurrencyCode,
      })
      .then((res) => {
        if (!alive) return;
        const shapedRooms = buildRooms(res, hotel);
        const recommendationSearch = window.location.search;
        const preferences = parseRecommendationPreferences(recommendationSearch, {
          adults: state.adults,
          children: state.children,
        });
        const dogValue = new URLSearchParams(recommendationSearch).get("dog");
        const rooms = rankRecommendedRooms(shapedRooms, preferences, {
          children: state.children,
          infants: state.infants,
          dogRequested: dogValue === "yes" || dogValue === "1",
        });
        setAvailableRoomsState(rooms);
        const room = rooms.find((r) => r.roomTypeId === state.roomTypeId);
        // A Rates deep link may intentionally have a room but no rate yet. Do not
        // silently select the first Mews rate; only rehydrate a rate when its id is
        // present in the URL.
        const rate = state.rateId ? room?.rates.find((rt) => rt.rateId === state.rateId) ?? null : null;
        if (room) {
          setSelectedRoom(room);
          setSelectedRate(rate);
        }
      })
      .catch(() => void 0)
      .finally(() => alive && setHydrating(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotel, hotelError]);

  const products = useMemo(() => shapeProducts(hotel), [hotel]);
  const imageBaseUrl = hotel?.ImageBaseUrl ?? "";

  const patch = useCallback((p: Partial<BookingState>) => setState((s) => ({ ...s, ...p })), []);

  const setSearch: BookingContextValue["setSearch"] = useCallback(
    (p) =>
      setState((s) => {
        // un changement de dates/occupants invalide la sélection
        const searchChanged =
          (p.checkIn !== undefined && p.checkIn !== s.checkIn) ||
          (p.checkOut !== undefined && p.checkOut !== s.checkOut) ||
          (p.adults !== undefined && p.adults !== s.adults) ||
          (p.children !== undefined && p.children !== s.children) ||
          (p.infants !== undefined && p.infants !== s.infants) ||
          (p.properties !== undefined && p.properties.join(",") !== s.properties.join(","));
        if (searchChanged) {
          setSelectedRoom(null);
          setSelectedRate(null);
          setAvailableRoomsState([]);
          setQuote(null);
          setQuoteError(false);
        }
        return {
          ...s,
          ...p,
          ...(searchChanged ? { roomTypeId: null, rateId: null, productIds: [] } : {}),
        };
      }),
    [],
  );

  // Ne garde que les extras compatibles avec l'hébergement de la chambre : un produit
  // d'une autre config Mews est refusé à la création (« product invalid »).
  const validProductsFor = useCallback(
    (ids: string[], roomProperty: string | null | undefined) =>
      ids.filter((id) => {
        const p = products.find((pr) => pr.id === id);
        return !p || !p.property || !roomProperty || p.property === roomProperty;
      }),
    [products],
  );

  const selectRoomRate: BookingContextValue["selectRoomRate"] = useCallback(
    (room, rate) => {
      setSelectedRoom(room);
      setSelectedRate(rate);
      setQuote(null);
      setQuoteError(false);
      setState((s) => ({
        ...s,
        roomTypeId: room.roomTypeId,
        rateId: rate.rateId,
        productIds: validProductsFor(s.productIds, room.property),
      }));
    },
    [validProductsFor],
  );

  const selectRoom: BookingContextValue["selectRoom"] = useCallback((room) => {
    setSelectedRoom(room);
    setSelectedRate(null);
    setQuote(null);
    setQuoteError(false);
    setState((s) => ({
      ...s,
      roomTypeId: room.roomTypeId,
      rateId: null,
      productIds: validProductsFor(s.productIds, room.property),
    }));
  }, [validProductsFor]);

  const hydrateSelection: BookingContextValue["hydrateSelection"] = useCallback(
    (room, rate) => {
      setSelectedRoom(room);
      setSelectedRate(rate);
      if (room)
        setState((s) => {
          const kept = validProductsFor(s.productIds, room.property);
          return kept.length === s.productIds.length ? s : { ...s, productIds: kept };
        });
    },
    [validProductsFor],
  );

  const setAvailableRooms: BookingContextValue["setAvailableRooms"] = useCallback(
    (rooms) => setAvailableRoomsState(rooms),
    [],
  );

  const setProperties: BookingContextValue["setProperties"] = useCallback(
    (keys) => patch({ properties: keys }),
    [patch],
  );

  const clearSelection = useCallback(() => {
    setSelectedRoom(null);
    setSelectedRate(null);
    setQuote(null);
    setQuoteError(false);
    setState((s) => ({ ...s, roomTypeId: null, rateId: null }));
  }, []);

  const toggleProduct: BookingContextValue["toggleProduct"] = useCallback(
    (id) =>
      setState((s) => ({
        ...s,
        productIds: s.productIds.includes(id) ? s.productIds.filter((x) => x !== id) : [...s.productIds, id],
      })),
    [],
  );

  const setProductPresentation: BookingContextValue["setProductPresentation"] = useCallback(
    (id, presentation) =>
      setProductPresentationState((current) => {
        if (!presentation) {
          if (!(id in current)) return current;
          const next = { ...current };
          delete next[id];
          return next;
        }
        return { ...current, [id]: presentation };
      }),
    [],
  );

  const setAddonPreference: BookingContextValue["setAddonPreference"] = useCallback(
    (displayId, preference) =>
      setAddonPreferences((current) => {
        if (!preference) {
          if (!(displayId in current)) return current;
          const next = { ...current };
          delete next[displayId];
          return next;
        }
        return { ...current, [displayId]: preference };
      }),
    [],
  );

  const setSelectedAddOnDisplay: BookingContextValue["setSelectedAddOnDisplay"] =
    useCallback((productId, displayId) => {
      setSelectedAddOnDisplayByProduct((current) => {
        if (!displayId) {
          if (!(productId in current)) return current;
          const next = { ...current };
          delete next[productId];
          return next;
        }
        return { ...current, [productId]: displayId };
      });
    }, []);

  const setAirportTransfer: BookingContextValue["setAirportTransfer"] = useCallback(
    (v) => patch({ airportTransfer: v }),
    [patch],
  );

  const setGuest: BookingContextValue["setGuest"] = useCallback((p) => setGuestState((g) => ({ ...g, ...p })), []);

  const setCreated: BookingContextValue["setCreated"] = useCallback((r) => {
    setCreatedState(r);
    if (r) setState((s) => ({ ...s, rgid: r.id }));
  }, []);

  const refreshQuote = useCallback(() => {
    setQuoteRefreshKey((key) => key + 1);
  }, []);

  const goTo: BookingContextValue["goTo"] = useCallback(
    (step) =>
      patch({
        step:
          step === "upgrade" && !BOOKING_FEATURES.roomUpgradeStep
            ? "extras"
            : step,
      }),
    [patch],
  );

  const resetAll = useCallback(() => {
    setSelectedRoom(null);
    setSelectedRate(null);
    setGuestState(emptyGuest);
    setCreatedState(null);
    setQuote(null);
    setQuoteError(false);
    setProductPresentationState({});
    setAddonPreferences({});
    setSelectedAddOnDisplayByProduct({});
    setState({ ...defaults });
    setCartId(newCartId()); // nouveau panier
  }, []);

  // ── Géolocalisation IP (best-effort) ─────────────────────────────────────────
  // Sur une visite FRAÎCHE (pas un lien partagé/restauré), pré-remplit l'indicatif
  // téléphonique (nationalité) selon le pays de l'IP. Visiteurs US/Canada : précoche la
  // navette aéroport + pré-sélectionne le forfait boisson 1er prix de l'hébergement choisi.
  const geoDoneRef = useRef(false);
  const naPresetRef = useRef(false); // visiteur US/CA → presets à appliquer
  const naDrinkDoneRef = useRef(false); // forfait boisson déjà pré-sélectionné (une fois)
  useEffect(() => {
    if (geoDoneRef.current) return;
    geoDoneRef.current = true;
    const u = readUrl();
    // Fresh visit: no room/payment/deep-link state to preserve. Guest nationality is
    // intentionally not restored from the URL because personal data is never serialized.
    const fresh = !u.roomTypeId && !u.rgid && (!u.step || u.step === "dates");
    let alive = true;
    // On appelle toujours /geo (léger, no-store) pour tracer le pays détecté en debug.
    void api.geo().then((r) => {
      // eslint-disable-next-line no-console
      console.log(
        `[geo] pays détecté (IP): ${r.country ?? "—"} · visite fraîche: ${fresh}`,
      );
      if (!alive || !fresh || !r.country) return;
      // Indicatif : on n'écrase pas un choix explicite (uniquement si encore défaut FR).
      setGuestState((gg) => (gg.nationalityCode === "FR" ? { ...gg, nationalityCode: r.country as string } : gg));
      if (r.country === "US" || r.country === "CA") {
        naPresetRef.current = true;
        patch({ airportTransfer: true });
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preset boisson US/CA : dès qu'une chambre est choisie ET le catalogue chargé, ajoute
  // le forfait boisson 1er prix de son hébergement (une seule fois — pas de réécrasement).
  useEffect(() => {
    if (!naPresetRef.current || naDrinkDoneRef.current || !selectedRoom || !products.length) return;
    const drink = cheapestDrinkProduct(products, selectedRoom.property ?? null);
    if (!drink) return;
    naDrinkDoneRef.current = true;
    setState((s) => (s.productIds.includes(drink.id) ? s : { ...s, productIds: [...s.productIds, drink.id] }));
  }, [selectedRoom, products]);

  // Réveillons OBLIGATOIRES : Noël (nuit du 24/12) et Saint-Sylvestre (nuit du 31/12)
  // sont auto-inclus & non décochables si le séjour couvre la soirée, et retirés sinon.
  // Rattachés à l'hébergement de la chambre choisie → réconcilié à chaque changement.
  useEffect(() => {
    if (!products.length) return;
    const prop = selectedRoom?.property ?? null;
    const forced = [
      mandatoryReveillon(products, prop, "noel", state.checkIn, state.checkOut),
      mandatoryReveillon(products, prop, "sylvestre", state.checkIn, state.checkOut),
    ]
      .filter((p): p is ShapedProduct => !!p)
      .map((p) => p.id);
    const allReveillonIds = products.filter(isReveillonProduct).map((p) => p.id);
    setState((s) => {
      // Retire tout réveillon NON forcé (dates/hébergement KO) ; ajoute les forcés manquants.
      const kept = s.productIds.filter((id) => !allReveillonIds.includes(id) || forced.includes(id));
      const merged = [...kept, ...forced.filter((id) => !kept.includes(id))];
      const same = merged.length === s.productIds.length && merged.every((id, i) => id === s.productIds[i]);
      return same ? s : { ...s, productIds: merged };
    });
  }, [products, selectedRoom, state.checkIn, state.checkOut]);

  // Prune CMS presentation aliases whenever their underlying Mews product is no
  // longer selected. Presentation never changes the booking identity.
  useEffect(() => {
    setProductPresentationState((current) => {
      const entries = Object.entries(current).filter(([id]) => state.productIds.includes(id));
      if (entries.length === Object.keys(current).length) return current;
      return Object.fromEntries(entries);
    });
  }, [state.productIds]);

  // Prune smart add-on session state when its underlying Mews product is removed.
  useEffect(() => {
    setSelectedAddOnDisplayByProduct((current) => {
      const entries = Object.entries(current).filter(([id]) => state.productIds.includes(id));
      return entries.length === Object.keys(current).length ? current : Object.fromEntries(entries);
    });
  }, [state.productIds]);

  // ── dérivés ────────────────────────────────────────────────────────────────
  const nightsCount = useMemo(
    () => (state.checkIn && state.checkOut ? countNights(state.checkIn, state.checkOut) : 0),
    [state.checkIn, state.checkOut],
  );
  const guestsCount = state.adults + state.children;

  const selectedProducts = useMemo(
    () =>
      products
        .filter((p) => state.productIds.includes(p.id))
        .map((product) => {
          const presentation = productPresentation[product.id];
          return presentation ? { ...product, ...presentation } : product;
        }),
    [products, state.productIds, productPresentation],
  );

  const productsTotal = useMemo(
    () => selectedProducts.reduce((sum, p) => sum + productLineTotal(p, nightsCount, guestsCount), 0),
    [selectedProducts, nightsCount, guestsCount],
  );

  // Final selected-rate quote. Mews reservations/price is authoritative for the
  // complete reservation total and AmountToChargeOnConfirmation.
  useEffect(() => {
    if (
      !selectedRoom ||
      !selectedRate ||
      !state.checkIn ||
      !state.checkOut
    ) {
      setQuote(null);
      setQuoteLoading(false);
      setQuoteError(false);
      return;
    }

    let alive = true;
    setQuoteLoading(true);
    setQuoteError(false);
    api
      .reservationPrice({
        checkIn: state.checkIn,
        checkOut: state.checkOut,
        roomCategoryId: selectedRoom.roomTypeId,
        rateId: selectedRate.rateId,
        adults: state.adults,
        children: state.children,
        infants: state.infants,
        property: selectedRoom.property,
        productIds: state.productIds,
        voucherCode: state.voucherCode,
        currencyCode: selectedRate.currency || hotel?.DefaultCurrencyCode,
      })
      .then((result) => {
        if (alive) setQuote(result);
      })
      .catch(() => {
        if (!alive) return;
        setQuote(null);
        setQuoteError(true);
      })
      .finally(() => {
        if (alive) setQuoteLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [
    selectedRoom,
    selectedRate,
    state.checkIn,
    state.checkOut,
    state.adults,
    state.children,
    state.infants,
    state.productIds,
    state.voucherCode,
    hotel?.DefaultCurrencyCode,
    quoteRefreshKey,
  ]);

  const roomTotal = selectedRate?.totalGross ?? 0;
  const fallbackGrandTotal = roomTotal + productsTotal;
  const grandTotal = quote?.total?.gross ?? fallbackGrandTotal;
  const currency =
    quote?.total?.currency ??
    selectedRate?.currency ??
    hotel?.DefaultCurrencyCode ??
    "EUR";
  // Once a final quote exists, never mix its values with availability pricing.
  // If a quoted field is missing, keep it missing rather than silently falling back
  // to a different pricing response.
  const totalNet = quote ? quote.total?.net ?? null : selectedRate?.totalNet ?? null;
  const totalTax = quote ? quote.total?.taxTotal ?? null : selectedRate?.totalTax ?? null;
  const amountDueNow = quote?.amountToChargeOnConfirmation?.gross ?? null;
  const remainingBalance =
    quote?.total?.gross != null && amountDueNow != null
      ? Math.max(0, +(quote.total.gross - amountDueNow).toFixed(2))
      : null;

  // ── Suivi de panier → n8n (via /api/mews/track) ──────────────────────────────
  // Snapshot whitelisté de l'état courant du panier.
  const buildCartPayload = (status: CartStatus): Record<string, unknown> => ({
    cartId,
    status,
    step: state.step,
    stay: {
      checkIn: state.checkIn,
      checkOut: state.checkOut,
      nights: nightsCount,
      adults: state.adults,
      children: state.children,
      infants: state.infants,
    },
    room: selectedRoom ? { categoryId: selectedRoom.roomTypeId, name: selectedRoom.name } : null,
    rate: selectedRate
      ? { rateId: selectedRate.rateId, name: selectedRate.name, totalGross: selectedRate.totalGross }
      : null,
    products: selectedProducts.map((p) => ({ id: p.id, name: p.name, price: p.price, currency: p.currency })),
    // Extra hors Mews : intérêt « transfert aéroport » (booléen) → n8n déclenche la relance.
    airportTransfer: state.airportTransfer,
    totals: { room: roomTotal, products: productsTotal, grand: grandTotal, currency },
    customer: {
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      telephone: guest.telephone,
      nationalityCode: guest.nationalityCode,
    },
    reservationGroupId: created?.id ?? state.rgid ?? null,
    paymentRequestId: created?.paymentRequestId ?? null,
    // Attribution marketing capturée à l'arrivée (utm_*, gclid, fbclid) + langue.
    utm: getUtms(),
    lang: getLang(),
  });

  const track: BookingContextValue["track"] = (status, extra = {}) =>
    cartId ? api.track({ ...buildCartPayload(status), ...extra }) : Promise.resolve({ ok: false });

  // Réf. toujours à jour (évite de refaire tourner l'effet à chaque rendu).
  const trackRef = useRef(track);
  trackRef.current = track;

  // Funnel : on pousse un event « etape » à CHAQUE changement d'étape (dès `dates`,
  // même sans e-mail) → n8n → Supabase. Permet de mesurer le drop-off complet,
  // les paniers abandonnés et les sources (UTM) à chaque niveau. paiement_initie /
  // paiement_valide sont émis en plus depuis Payment / Confirmation.
  useEffect(() => {
    void trackRef.current("etape");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step]);

  const value: BookingContextValue = {
    ...state,
    hotel,
    imageBaseUrl,
    products,
    hotelLoading,
    hotelError,
    hydrating,
    reloadHotel: loadHotel,
    selectedRoom,
    selectedRate,
    availableRooms,
    guest,
    created,
    quote,
    quoteLoading,
    quoteError,
    refreshQuote,
    nightsCount,
    guestsCount,
    selectedProducts,
    addonPreferences,
    selectedAddOnDisplayByProduct,
    productsTotal,
    roomTotal,
    grandTotal,
    currency,
    totalNet,
    totalTax,
    amountDueNow,
    remainingBalance,
    setSearch,
    selectRoomRate,
    selectRoom,
    hydrateSelection,
    setAvailableRooms,
    setProperties,
    clearSelection,
    toggleProduct,
    setProductPresentation,
    setAddonPreference,
    setSelectedAddOnDisplay,
    setAirportTransfer,
    setGuest,
    setCreated,
    goTo,
    resetAll,
    cartId,
    track,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBooking(): BookingContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useBooking must be used within BookingProvider");
  return v;
}

// Total d'une ligne produit selon son mode de facturation.
export function productLineTotal(p: ShapedProduct, nights: number, guests: number): number {
  const n = Math.max(1, nights);
  const g = Math.max(1, guests);
  switch (p.chargingMode) {
    case "PerNight":
    case "PerTimeUnit": // TimeUnit = nuit sur un hébergement
      return p.price * n;
    case "PerPerson":
      return p.price * g;
    case "PerPersonPerNight":
    case "PerNightPerPerson":
    case "PerPersonPerTimeUnit": // ex. « Déjeuner (Pension complète) »
      return p.price * g * n;
    default: // Once / inconnu
      return p.price;
  }
}
