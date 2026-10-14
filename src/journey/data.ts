/**
 * Visual Journey booking variant — mock catalogue + pure logic.
 * Real rooms come from hotelData.ts; extra room types are clearly-flagged
 * mock expansions (reusing on-file photos) so the UI can be exercised with
 * a property that sells 15+ room types.
 */
import { ROOMS, RATE_OPTIONS, EXTRAS, ROOM_IMAGE_ASSETS } from "../data/hotelData.ts";
import type { RoomType, RateOption } from "../types.ts";

export type Feature =
  | "indoor-tub"
  | "outdoor-tub"
  | "fireplace"
  | "view"
  | "gather"
  | "balcony"
  | "accessible";

export interface JourneyRoom {
  id: string;
  name: string;
  building: string;
  eyebrow: string;
  tagline: string;
  description: string;
  basePrice: number;
  squareFeet: number;
  bedType: string;
  maxGuests: number;
  dogFriendly: boolean;
  adultsOnly: boolean;
  quiet: number; // 1 (near the action) – 5 (secluded)
  features: Feature[];
  highlights: string[];
  images: string[];
  isMock: boolean;
}

const featuresFromRoom = (r: RoomType): Feature[] => {
  const f = new Set<Feature>();
  const text = (r.features.join(" ") + " " + r.tags.join(" ")).toLowerCase();
  if (r.soakType === "outdoor-cedar-tub" || r.soakType === "soaking-porch") f.add("outdoor-tub");
  else f.add("indoor-tub");
  if (text.includes("fireplace") || text.includes("hearth") || text.includes("stove")) f.add("fireplace");
  if (text.includes("view") || text.includes("vista") || text.includes("window")) f.add("view");
  if (text.includes("balcony") || text.includes("deck")) f.add("balcony");
  if (r.maxGuests >= 4 || text.includes("living")) f.add("gather");
  return [...f];
};

const BUILDING_NAME: Record<string, JourneyRoom["building"]> = {
  alpine: "Alpine",
  walden: "Walden",
  lodge: "Lodge",
};

const QUIET: Record<string, number> = { alpine: 4, walden: 5, lodge: 2 };

const realRooms: JourneyRoom[] = ROOMS.map((r) => ({
  id: r.id,
  name: r.name,
  building: BUILDING_NAME[r.buildingId] ?? "Lodge",
  eyebrow: r.eyebrow,
  tagline: r.tagline,
  description: r.description,
  basePrice: r.basePrice,
  squareFeet: r.squareFeet,
  bedType: r.bedType,
  maxGuests: r.maxGuests,
  dogFriendly: r.isDogFriendly,
  adultsOnly: r.ageRestricted21,
  quiet: QUIET[r.buildingId] ?? 3,
  features: featuresFromRoom(r),
  highlights: r.features.slice(0, 5),
  images: r.images,
  isMock: false,
}));

const A = ROOM_IMAGE_ASSETS;
const mock = (r: Omit<JourneyRoom, "isMock">): JourneyRoom => ({ ...r, isMock: true });

const mockRooms: JourneyRoom[] = [
  mock({ id: "alpine-accessible-king", name: "Alpine Accessible King", building: "Alpine", eyebrow: "EVERY COMFORT, AT GROUND LEVEL.", tagline: "Step-free entry, roll-in rain shower, forest-facing window", description: "Ground-floor Alpine suite with step-free access, a roll-in shower and the same picture window onto the hemlocks.", basePrice: 185, squareFeet: 440, bedType: "1 King", maxGuests: 2, dogFriendly: true, adultsOnly: true, quiet: 4, features: ["view", "accessible", "fireplace"], highlights: ["Step-free entry", "Roll-in rain shower", "Forest picture window", "Cast-iron stove"], images: [A.ALPINE_HEADBOARD, A.ALPINE_BATHING_SUITE] }),
  mock({ id: "alpine-twin-bunk", name: "Alpine Bunk Room", building: "Alpine", eyebrow: "FOR THE FRIENDS TRIP.", tagline: "Two queens under timber beams, clawfoot tub in the corner", description: "Two queen beds, a clawfoot tub and room for four friends who intend to stay up late.", basePrice: 210, squareFeet: 480, bedType: "2 Queens", maxGuests: 4, dogFriendly: false, adultsOnly: true, quiet: 3, features: ["indoor-tub", "gather"], highlights: ["Two queen beds", "Clawfoot tub", "Timber beams"], images: [A.ALPINE_BATHING_SUITE, A.ALPINE_HEADBOARD] }),
  mock({ id: "walden-sunrise-bathing", name: "Walden Sunrise Bathing Suite", building: "Walden", eyebrow: "FIRST LIGHT, FIRST SOAK.", tagline: "East-facing deck and cedar tub that catches the morning sun", description: "Faces east over the pines so the cedar tub fills with sunrise. Coffee on the deck is non-negotiable.", basePrice: 255, squareFeet: 460, bedType: "1 King", maxGuests: 2, dogFriendly: true, adultsOnly: false, quiet: 5, features: ["outdoor-tub", "view", "balcony"], highlights: ["Outdoor cedar tub", "East-facing deck", "Sunrise views"], images: [A.WALDEN_SUNRISE_BATHING_SUITE, A.WALDEN_FOREST_BATHING_SUITE] }),
  mock({ id: "walden-forest-den", name: "Walden Forest Den", building: "Walden", eyebrow: "A CABIN INSIDE A CABIN.", tagline: "Wood stove, reading den and a cedar tub out back", description: "A deeper Walden cabin with a reading den, wood stove and outdoor cedar tub under the trees.", basePrice: 285, squareFeet: 560, bedType: "1 King + Daybed", maxGuests: 3, dogFriendly: true, adultsOnly: false, quiet: 5, features: ["outdoor-tub", "fireplace", "gather"], highlights: ["Wood stove", "Reading den", "Outdoor cedar tub"], images: [A.WALDEN_FOREST_BATHING_SUITE, A.WALDEN_SUNRISE_BATHING_SUITE] }),
  mock({ id: "walden-queen-cabin", name: "Walden Queen Cabin", building: "Walden", eyebrow: "SIMPLE, COZY, IN THE WOODS.", tagline: "Our most easygoing room — queen bed and forest deck", description: "Small, warm and honest. A queen bed, a private deck and the woods doing the rest.", basePrice: 145, squareFeet: 300, bedType: "1 Queen", maxGuests: 2, dogFriendly: true, adultsOnly: false, quiet: 4, features: ["balcony"], highlights: ["Queen bed", "Private deck", "Walk-in shower"], images: [A.WALDEN_SUNRISE_BATHING_SUITE] }),
  mock({ id: "walden-family-cabin", name: "Walden Family Cabin", building: "Walden", eyebrow: "ROOM FOR THE WHOLE CREW.", tagline: "King plus bunk nook, outdoor tub, space for the kids to roam", description: "A king bedroom, a bunk nook for little ones and a cedar tub for after bedtime.", basePrice: 295, squareFeet: 620, bedType: "1 King + Bunks", maxGuests: 5, dogFriendly: true, adultsOnly: false, quiet: 4, features: ["outdoor-tub", "gather", "balcony"], highlights: ["Bunk nook", "Outdoor cedar tub", "Family-friendly"], images: [A.WALDEN_FOREST_BATHING_SUITE] }),
  mock({ id: "lodge-double-queen", name: "Lodge Double Queen", building: "Lodge", eyebrow: "STEPS FROM THE BAR.", tagline: "Two queens above the parlor and the evening whiskey bar", description: "Above the heart of the Lodge — dinner, whiskey and live music are a staircase away.", basePrice: 185, squareFeet: 400, bedType: "2 Queens", maxGuests: 4, dogFriendly: false, adultsOnly: false, quiet: 1, features: ["gather", "accessible"], highlights: ["Two queens", "Elevator access", "Above the parlor"], images: [A.LODGE_PENTHOUSE_BEDROOM, A.LODGE_PENTHOUSE_LIVING_ROOM] }),
  mock({ id: "lodge-loft-suite", name: "Lodge Vaulted Loft", building: "Lodge", eyebrow: "UNDER THE OLD RAFTERS.", tagline: "1800s timber frame, sleeping loft, copper tub below", description: "Sleep in the rafters of an 1800s timber frame, soak in copper downstairs.", basePrice: 275, squareFeet: 540, bedType: "1 King (loft)", maxGuests: 2, dogFriendly: false, adultsOnly: true, quiet: 2, features: ["indoor-tub", "fireplace"], highlights: ["Sleeping loft", "Copper tub", "Historic beams"], images: [A.LODGE_PENTHOUSE_LIVING_ROOM, A.LODGE_PENTHOUSE_BEDROOM] }),
  mock({ id: "creekside-cabin", name: "Creekside Cabin", building: "Creekside", eyebrow: "FALL ASLEEP TO THE ESOPUS.", tagline: "Standalone cabin on the creek with a soaking porch", description: "A standalone cabin on the Esopus with a screened soaking porch and fire pit.", basePrice: 365, squareFeet: 650, bedType: "1 King", maxGuests: 2, dogFriendly: true, adultsOnly: false, quiet: 5, features: ["outdoor-tub", "fireplace", "view", "balcony"], highlights: ["Standalone cabin", "Soaking porch", "Private fire pit", "Creek views"], images: [A.WALDEN_FOREST_BATHING_SUITE, A.WALDEN_SUNRISE_BATHING_SUITE] }),
  mock({ id: "creekside-two-bedroom", name: "Creekside Two-Bedroom House", building: "Creekside", eyebrow: "YOUR OWN PLACE ON THE WATER.", tagline: "Two bedrooms, full kitchen, outdoor tub and a long table", description: "A whole house for six on the creek — full kitchen, long dining table and outdoor tub.", basePrice: 520, squareFeet: 1100, bedType: "1 King + 2 Queens", maxGuests: 6, dogFriendly: true, adultsOnly: false, quiet: 5, features: ["outdoor-tub", "fireplace", "gather", "view"], highlights: ["Full kitchen", "Sleeps six", "Outdoor tub", "Long dining table"], images: [A.LODGE_PENTHOUSE_LIVING_ROOM, A.WALDEN_FOREST_BATHING_SUITE] }),
];

export const JOURNEY_ROOMS: JourneyRoom[] = [...realRooms, ...mockRooms];

/** "all" plus every building that actually has rooms — scales with the property, no hardcoding. */
export function buildingList(rooms: JourneyRoom[]): string[] {
  return ["all", ...Array.from(new Set(rooms.map((r) => r.building)))];
}

export const FEATURE_LABEL: Record<Feature, string> = {
  "indoor-tub": "Tub by the window",
  "outdoor-tub": "Soak outside",
  fireplace: "Fire or wood stove",
  view: "Big views",
  gather: "Space to gather",
  balcony: "Private deck",
  accessible: "Step-free access",
};

// ---------- Matching ----------

export type Occasion = "romance" | "friends" | "family" | "solo";

export interface MatchProfile {
  occasion: Occasion;
  adults: number;
  children: number;
  dog: boolean;
  mustHaves: Feature[];
  quiet: number; // 1–5 desired seclusion
  budget: number; // max nightly
}

export interface MatchResult {
  room: JourneyRoom;
  score: number; // 0–100
  reasons: string[];
  excludedBy?: string;
}

export function matchRoom(room: JourneyRoom, p: MatchProfile): MatchResult {
  const guests = p.adults + p.children;
  if (guests > room.maxGuests) return { room, score: 0, reasons: [], excludedBy: `Sleeps ${room.maxGuests}` };
  if (p.children > 0 && room.adultsOnly) return { room, score: 0, reasons: [], excludedBy: "Guests 21+ only" };
  if (p.dog && !room.dogFriendly) return { room, score: 0, reasons: [], excludedBy: "No dogs" };
  if (p.mustHaves.includes("accessible") && !room.features.includes("accessible"))
    return { room, score: 0, reasons: [], excludedBy: "Not step-free" };

  const reasons: string[] = [];
  let score = 40;

  const wanted = p.mustHaves.filter((f) => f !== "accessible");
  if (wanted.length) {
    const hit = wanted.filter((f) => room.features.includes(f));
    score += Math.round((hit.length / wanted.length) * 30);
    hit.forEach((f) => reasons.push(FEATURE_LABEL[f]));
  } else score += 15;

  score += 15 - Math.abs(room.quiet - p.quiet) * 4;
  if (Math.abs(room.quiet - p.quiet) <= 1) reasons.push(p.quiet >= 4 ? "Tucked away" : "Close to the Lodge");

  if (room.basePrice <= p.budget) {
    score += 10;
    reasons.push("Within your budget");
  } else score -= Math.min(20, Math.round((room.basePrice - p.budget) / 10));

  if (p.occasion === "romance" && room.maxGuests <= 3 && room.features.some((f) => f.includes("tub"))) score += 5;
  if ((p.occasion === "friends" || p.occasion === "family") && room.features.includes("gather")) score += 5;
  if (p.occasion === "solo" && room.basePrice < 200) score += 5;
  if (p.dog) reasons.push("Dog-friendly");

  return { room, score: Math.max(0, Math.min(100, score)), reasons: reasons.slice(0, 4) };
}

export function rankRooms(rooms: JourneyRoom[], p: MatchProfile): MatchResult[] {
  return rooms.map((r) => matchRoom(r, p)).sort((a, b) => b.score - a.score);
}

// ---------- Rates ----------

export const TAX_RATE = 0.13; // mock estimate, shown to guests as such

export function ratesForStay(nights: number): RateOption[] {
  const byId = (id: RateOption["id"]) => RATE_OPTIONS.find((r) => r.id === id)!;
  const third = nights >= 5 ? byId("stay-while") : byId("plan-ahead");
  return [byId("ride-easy"), byId("sunup"), third].filter(Boolean);
}

export function priceStay(basePrice: number, multiplier: number, nights: number) {
  const nightly = Math.round(basePrice * multiplier);
  const subtotal = nightly * nights;
  const taxes = Math.round(subtotal * TAX_RATE);
  return { nightly, subtotal, taxes, total: subtotal + taxes };
}

// ---------- Add-ons ----------

export type AddOnUnit = "stay" | "night" | "person";
export type Timing = "arrival" | "during";

export interface AddOn {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  unit: AddOnUnit;
  image: string;
  timings: Timing[];
  category: "In your room" | "Wellness" | "Food & drink" | "For the dog";
  dogOnly?: boolean;
}

export const ADD_ONS: AddOn[] = [
  { id: "flowers", title: "Wildflower bundle", subtitle: "Local stems from the Phoenicia farm stand", price: 55, unit: "stay", image: "https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=900&q=80", timings: ["arrival"], category: "In your room" },
  { id: "champagne", title: "Chilled bottle of bubbles", subtitle: "On ice with two coupes", price: 85, unit: "stay", image: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?auto=format&fit=crop&w=900&q=80", timings: ["arrival", "during"], category: "Food & drink" },
  { id: "breakfast-basket", title: "Breakfast basket at the door", subtitle: "Pastries, fruit, local yogurt and coffee", price: 28, unit: "person", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=900&q=80", timings: ["during"], category: "Food & drink" },
  { id: "firewood", title: "Firewood & kindling stacked", subtitle: "Seasoned oak, ready by your stove", price: 25, unit: "night", image: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=900&q=80", timings: ["arrival", "during"], category: "In your room" },
  { id: "record-crate", title: "Curated record crate", subtitle: "Twelve records picked for your stay", price: 30, unit: "stay", image: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?auto=format&fit=crop&w=900&q=80", timings: ["arrival"], category: "In your room" },
  ...EXTRAS.map<AddOn>((e) => ({
    id: e.id,
    title: e.title,
    subtitle: e.subtitle,
    price: e.price,
    unit: e.perPerson ? "person" : "stay",
    image: e.image.replace("w=600", "w=900"),
    timings: e.category === "wellness" && e.id === "sauna-session" ? ["during"] : ["arrival", "during"],
    category: e.category === "wellness" ? "Wellness" : e.category === "dining" ? "Food & drink" : e.category === "pets" ? "For the dog" : "In your room",
    dogOnly: e.category === "pets",
  })),
];

export function addOnTotal(a: AddOn, qty: number, nights: number, guests: number) {
  const mult = a.unit === "night" ? nights : a.unit === "person" ? guests : 1;
  return a.price * qty * mult;
}

// ---------- Dates ----------

export function nightsBetween(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
