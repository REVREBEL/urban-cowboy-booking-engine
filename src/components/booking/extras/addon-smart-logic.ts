import type { MerchandisedAddOn } from "@/types/add-on-cms";
import type {
  AddonDeliveryType,
  AddonSchedulePreference,
  AddonStayCriteria,
} from "./addon-types";

export type AddOnKind =
  | "fresh-cut-flowers"
  | "celebration-cake"
  | "wine-bottle"
  | "pup-stay"
  | "hummus-crudites"
  | "chocolate-truffles"
  | "standard";

export interface AddOnStayDate {
  index: number;
  isoDate: string;
  dayName: string;
  monthDay: string;
  fullLabel: string;
  isArrival: boolean;
  isDepartureNight: boolean;
}

export interface AddOnSmartProfile {
  kind: AddOnKind;
  needsScheduling: boolean;
  supportsGift: boolean;
  supportsNoteCard: boolean;
  customizationLabel: string | null;
  dietaryLabel: string | null;
}

const DEFAULT_CHECK_IN = "2026-10-14";

export function addOnKind(addon: MerchandisedAddOn): AddOnKind {
  // Webflow aliases deliberately inherit price/bookability from a Mews product.
  // Their CMS content owns the guest-facing experience, so do not let the bound
  // product's knownAddOn key override the alias.
  if (addon.contentSource !== "webflow") {
    if (addon.knownAddOn === "DOG_INCLUSION") return "pup-stay";
    if (addon.knownAddOn === "FLOWER_BOUQUET") return "fresh-cut-flowers";
    if (addon.knownAddOn === "WELCOME_WINE") return "wine-bottle";
    if (addon.knownAddOn === "HUMMUS_AND_CRUDITES") return "hummus-crudites";
    if (addon.knownAddOn === "LETS_EAT_CHOCOLATE_TRUFFLES") return "chocolate-truffles";
  }

  const searchable = `${addon.name} ${addon.description}`.toLowerCase();
  if (/flower|bouquet|bloom/.test(searchable)) return "fresh-cut-flowers";
  if (/cake|birthday|anniversary/.test(searchable)) return "celebration-cake";
  if (/wine|bottle|sommelier/.test(searchable)) return "wine-bottle";
  if (/pup|pet|dog/.test(searchable)) return "pup-stay";
  if (/hummus|crudite/.test(searchable)) return "hummus-crudites";
  if (/chocolate|truffle/.test(searchable)) return "chocolate-truffles";
  return "standard";
}

export function addOnSmartProfile(addon: MerchandisedAddOn): AddOnSmartProfile {
  const kind = addOnKind(addon);
  return {
    kind,
    needsScheduling: kind !== "fresh-cut-flowers",
    supportsGift: kind === "fresh-cut-flowers" || kind === "celebration-cake",
    supportsNoteCard: kind === "fresh-cut-flowers" || kind === "celebration-cake",
    customizationLabel:
      kind === "celebration-cake"
        ? "Cake inscription"
        : kind === "wine-bottle"
          ? "Wine preference"
          : kind === "pup-stay"
            ? "Dog name"
            : null,
    dietaryLabel:
      kind === "pup-stay"
        ? "Breed or weight"
        : kind === "hummus-crudites" || kind === "chocolate-truffles"
          ? "Dietary preferences or allergies"
          : null,
  };
}

export function addOnStayDates(criteria: AddonStayCriteria): AddOnStayDate[] {
  const dates: AddOnStayDate[] = [];
  const [year, month, day] = (criteria.checkIn || DEFAULT_CHECK_IN)
    .split("-")
    .map(Number);
  const startDate = new Date(year, month - 1, day);
  const nights = Math.max(1, criteria.nights || 1);

  for (let i = 0; i < nights; i += 1) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    const monthDay = d.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
    });

    dates.push({
      index: i,
      isoDate: d.toISOString().split("T")[0],
      dayName,
      monthDay,
      fullLabel:
        i === 0
          ? `${dayName}, ${monthDay} (Arrival Night)`
          : i === nights - 1
            ? `${dayName}, ${monthDay} (Final Night)`
            : `${dayName}, ${monthDay}`,
      isArrival: i === 0,
      isDepartureNight: i === nights - 1,
    });
  }

  return dates;
}

export function deliveryTimeOptions(
  date: AddOnStayDate,
): string[] {
  return [
    date.isArrival
      ? "Waiting in room prior to check-in (4:00 PM)"
      : "Morning delivery (10:00 AM)",
    "Late afternoon refresh (4:30 PM)",
    "Evening service (post-dinner, 8:00 PM)",
    "Late night fireside (9:30 PM)",
    "Other custom time",
  ];
}

export const WINE_PREFERENCES = [
  "Natural Red (Earth & Fruit)",
  "Crisp Mineral White",
  "Sparkling Pet-Nat",
  "Chilled Orange Skin-Contact",
  "Dry Mountain Rosé",
] as const;

export function defaultAddOnPreference(
  addon: MerchandisedAddOn,
  criteria: AddonStayCriteria,
): AddonSchedulePreference {
  const kind = addOnKind(addon);
  const stayDates = addOnStayDates(criteria);
  const arrival = stayDates[0];
  const isOneNight = Math.max(1, criteria.nights || 1) <= 1;

  let deliveryType: AddonDeliveryType = "scheduled-day";
  let isGift = false;
  let includeCard = false;
  let selectedTime = "Waiting in suite prior to check-in";
  let itemCustomization = "";

  switch (kind) {
    case "fresh-cut-flowers":
      deliveryType = "waiting-in-room";
      selectedTime = "Waiting in suite prior to 4:00 PM arrival";
      break;
    case "celebration-cake":
      deliveryType = "scheduled-day";
      isGift = true;
      includeCard = true;
      selectedTime = "Evening service (post-dinner, 8:00 PM)";
      break;
    case "wine-bottle":
      itemCustomization = WINE_PREFERENCES[0];
      selectedTime = "Chilled & waiting in suite upon check-in";
      break;
    case "pup-stay":
      selectedTime = "Ready in room prior to arrival";
      break;
    default:
      selectedTime = "Waiting in suite prior to check-in";
      break;
  }

  return {
    deliveryType,
    selectedDate: arrival?.fullLabel,
    selectedDateIso: arrival?.isoDate,
    selectedTime,
    customTime: "",
    isGift,
    giftRecipient: "",
    includeCard,
    cardMessage: includeCard ? "" : undefined,
    itemCustomization,
    dietaryNote: "",
    ...(isOneNight && arrival
      ? {
          selectedDate: arrival.fullLabel,
          selectedDateIso: arrival.isoDate,
        }
      : {}),
  };
}

export function normalizeAddOnPreference(
  addon: MerchandisedAddOn,
  criteria: AddonStayCriteria,
  preference?: AddonSchedulePreference,
): AddonSchedulePreference {
  return {
    ...defaultAddOnPreference(addon, criteria),
    ...(preference ?? {}),
  };
}

export function addOnPreferenceSummary(
  preference?: AddonSchedulePreference,
): string {
  if (!preference) return "Ready upon arrival";
  if (preference.isGift) {
    return `Gift surprise${preference.giftRecipient ? ` for ${preference.giftRecipient}` : ""}`;
  }
  if (preference.itemCustomization) return preference.itemCustomization;
  if (preference.selectedDate) {
    return preference.selectedDate.split("(")[0].trim();
  }
  return preference.selectedTime || "Ready upon arrival";
}

export function formatAddOnPreferenceNote(
  addOnName: string,
  preference: AddonSchedulePreference | undefined,
): string | null {
  if (!preference) return null;

  const details: string[] = [];
  if (preference.selectedDate) details.push(`date: ${preference.selectedDate}`);
  if (preference.selectedTime) details.push(`time: ${preference.selectedTime}`);
  if (preference.itemCustomization) details.push(`request: ${preference.itemCustomization}`);
  if (preference.dietaryNote) details.push(`notes: ${preference.dietaryNote}`);
  if (preference.isGift) details.push("gift: yes");
  if (preference.giftRecipient) details.push(`recipient: ${preference.giftRecipient}`);
  if (preference.includeCard) details.push("handwritten card: yes");
  if (preference.cardMessage) details.push(`card message: ${preference.cardMessage}`);

  return details.length ? `${addOnName} — ${details.join("; ")}` : null;
}
