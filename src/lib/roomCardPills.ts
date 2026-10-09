import type { ShapedRoom } from "../types/mews";

export type RoomCardPillSource = "mews" | "cowboy";
export type RoomCardPillEmphasis = "default" | "highlight";

export interface RoomCardPill {
  key: string;
  label: string;
  source: RoomCardPillSource;
  emphasis: RoomCardPillEmphasis;
}

function bedLabel(normalBeds: number, extraBeds: number): string {
  const base = `${normalBeds} ${normalBeds === 1 ? "Bed" : "Beds"}`;
  if (extraBeds <= 0) return base;
  return `${base} + ${extraBeds} Extra`;
}

/**
 * Build the compact facts shown on room-list cards.
 *
 * Mews owns inventory facts such as bed counts and remaining room count.
 * Urban Cowboy merchandising owns guest-facing policy and feature facts.
 *
 * Deliberately excluded for now:
 * - guest capacity / "Sleeps X": the current API adapter only derives this from
 *   bed count, which is not a reliable max-occupancy contract;
 * - building/location labels: deferred until the live Catskills Mews
 *   configuration model is verified.
 */
export function buildRoomCardPills(room: ShapedRoom): RoomCardPill[] {
  const pills: RoomCardPill[] = [];

  if (room.normalBedCount > 0) {
    pills.push({
      key: "beds",
      label: bedLabel(room.normalBedCount, room.extraBedCount),
      source: "mews",
      emphasis: "default",
    });
  }

  if (room.availableRoomCount > 0 && room.availableRoomCount <= 3) {
    pills.push({
      key: "availability",
      label: `Only ${room.availableRoomCount} Left`,
      source: "mews",
      emphasis: "highlight",
    });
  }

  const merchandising = room.merchandising;
  if (!merchandising) return pills;

  if (merchandising.dogPolicy === "allowed") {
    pills.push({
      key: "dog",
      label: "Dogs Welcome",
      source: "cowboy",
      emphasis: "highlight",
    });
  }

  if (merchandising.agePolicy === "adultsOnly21") {
    pills.push({
      key: "21plus",
      label: "21+ Only",
      source: "cowboy",
      emphasis: "highlight",
    });
  } else if (merchandising.agePolicy === "adult21Required") {
    pills.push({
      key: "adult21",
      label: "Adult 21+ Required",
      source: "cowboy",
      emphasis: "highlight",
    });
  }

  const featurePills: Array<[keyof typeof merchandising.features, string]> = [
    ["indoorTub", "Indoor Soaking Tub"],
    ["outdoorSoak", "Outdoor Soak"],
    ["privateDeck", "Private Deck"],
    ["scenicView", "Scenic Views"],
    ["fireplace", "Fireplace"],
    ["fullKitchen", "Full Kitchen"],
    ["heatedFloors", "Heated Floors"],
    ["ownPlace", "Your Own Place"],
    ["simpleCozy", "Simple + Cozy"],
  ];

  for (const [feature, label] of featurePills) {
    if (!merchandising.features[feature]) continue;
    pills.push({
      key: feature,
      label,
      source: "cowboy",
      emphasis: "default",
    });
  }

  return pills;
}
