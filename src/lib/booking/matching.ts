import { ROOMS, type PreferenceId, type Room } from "./rooms";

export type StayCriteria = {
  arrival: string;
  departure: string;
  adults: number;
  children: number;
  pets: boolean;
  accessible: boolean;
};

/**
 * Hard eligibility. These are booking constraints, never preferences: a room
 * that does not work for the party is never shown, whatever the guest picked.
 */
export function eligibleRooms(stay: StayCriteria, rooms: Room[] = ROOMS) {
  return rooms.filter((room) => {
    if (room.maxAdults < stay.adults) return false;
    if (room.maxChildren < stay.children) return false;
    if (stay.pets && !room.petsWelcome) return false;
    if (stay.accessible && !room.accessible) return false;
    return true;
  });
}

export type MatchSlot = "best" | "alternative" | "all-in";

export type Match = {
  room: Room;
  slot: MatchSlot;
  label: string;
  reasons: string[];
};

const SLOT_LABEL: Record<MatchSlot, string> = {
  best: "Best match",
  alternative: "Another way to go",
  "all-in": "Go all in",
};

function score(room: Room, prefs: PreferenceId[]) {
  return prefs.reduce((total, pref, index) => {
    if (!room.tags.includes(pref)) return total;
    // First pick counts a little more than the second.
    const weight = index === 0 ? 3 : 2;
    // A room that is the definitive answer to a preference wins the tie.
    return total + weight + (room.signature.includes(pref) ? 1.5 : 0);
  }, 0);
}

function reasonsFor(room: Room, prefs: PreferenceId[]) {
  const matched = prefs
    .map((pref) => room.reasons[pref])
    .filter((reason): reason is string => Boolean(reason));
  return matched.length > 0 ? matched : [room.headline];
}

function alternativeLabel(room: Room, prefs: PreferenceId[]) {
  if (prefs.includes("bathe-outside") && room.tags.includes("iconic-tub")) {
    return "Another way to soak";
  }
  if (prefs.includes("iconic-tub") && room.tags.includes("bathe-outside")) {
    return "Soak outside instead";
  }
  if (prefs.includes("near-everything") && room.tags.includes("my-own-place")) {
    return "A quieter option";
  }
  return SLOT_LABEL.alternative;
}

/**
 * Three rooms worth considering: the closest read on what the guest told us,
 * a genuinely different option, and the bigger, more private one.
 */
export function bestMatches(
  stay: StayCriteria,
  prefs: PreferenceId[],
  rooms: Room[] = ROOMS,
): Match[] {
  const eligible = eligibleRooms(stay, rooms);
  if (eligible.length === 0) return [];

  const ranked = [...eligible].sort((a, b) => {
    const diff = score(b, prefs) - score(a, prefs);
    if (diff !== 0) return diff;
    return a.nightlyFrom - b.nightlyFrom;
  });

  const picked: Match[] = [];
  const best = ranked[0];
  if (!best) return [];
  picked.push({
    room: best,
    slot: "best",
    label: SLOT_LABEL.best,
    reasons: reasonsFor(best, prefs),
  });

  const remaining = ranked.filter((room) => room.id !== best.id);

  const alternative =
    remaining.find((room) => room.tags.some((tag) => !best.tags.includes(tag))) ??
    remaining[0];

  if (alternative) {
    picked.push({
      room: alternative,
      slot: "alternative",
      label: alternativeLabel(alternative, prefs),
      reasons: reasonsFor(alternative, prefs),
    });
  }

  const allIn = [...remaining]
    .filter((room) => !picked.some((match) => match.room.id === room.id))
    .sort((a, b) => b.nightlyFrom - a.nightlyFrom)[0];

  if (allIn) {
    picked.push({
      room: allIn,
      slot: "all-in",
      label: SLOT_LABEL["all-in"],
      reasons: [
        allIn.reasons["my-own-place"] ?? allIn.headline,
        ...(allIn.tags.includes("bringing-my-people") && allIn.reasons["bringing-my-people"]
          ? [allIn.reasons["bringing-my-people"]]
          : []),
      ],
    });
  }

  return picked;
}

export function nights(stay: Pick<StayCriteria, "arrival" | "departure">) {
  if (!stay.arrival || !stay.departure) return 0;
  const start = new Date(stay.arrival);
  const end = new Date(stay.departure);
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return diff > 0 ? diff : 0;
}
