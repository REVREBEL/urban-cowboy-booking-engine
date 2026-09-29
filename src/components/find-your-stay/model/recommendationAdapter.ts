import type {
  RecommendationPreferences,
  RecommendationResult,
  RoomProduct,
  MatchInterest,
  Season,
  TopMatchCopy,
} from './types';
import { ROOMS } from './mockData';

function seasonForDate(dateStr: string): Season {
  if (!dateStr) return 'fall';
  const month = new Date(dateStr).getMonth();
  if (month <= 1 || month === 11) return 'winter';
  if (month <= 4) return 'spring';
  if (month <= 7) return 'summer';
  return 'fall';
}

function interestScore(room: RoomProduct, interest: MatchInterest): number {
  return room.matchScores[interest] ?? 0;
}

function partyScore(room: RoomProduct, party: string): number {
  return room.matchScores[party] ?? 0;
}

function intersectionBonus(room: RoomProduct, interests: [MatchInterest, MatchInterest?]): number {
  if (!interests[1]) return 0;
  const a = interestScore(room, interests[0]);
  const b = interestScore(room, interests[1]);
  if (a >= 4 && b >= 4) return 50;
  if ((a >= 4 && b >= 2) || (a >= 2 && b >= 4)) return 20;
  return 0;
}

function scoreRoom(room: RoomProduct, prefs: RecommendationPreferences): number {
  const { party, interests } = prefs;
  const i0 = interestScore(room, interests[0]);
  const i1 = interests[1] ? interestScore(room, interests[1]) : 0;
  const p = partyScore(room, party);
  const bonus = intersectionBonus(room, interests);
  return i0 * 10 + (interests[1] ? i1 * 10 : 0) + p * 2 + bonus;
}

function isEligible(room: RoomProduct, prefs: RecommendationPreferences, children: number): boolean {
  if (prefs.dog && !room.features.dogFriendly) return false;
  if (children > 0 && room.features.adults21Plus) return false;
  return true;
}

function matchedInterests(room: RoomProduct, interests: [MatchInterest, MatchInterest?]): MatchInterest[] {
  return interests.filter((i): i is MatchInterest => !!i && interestScore(room, i) >= 3);
}

const INTEREST_LABELS: Record<MatchInterest, string> = {
  iconTub: 'the iconic copper tub',
  outdoorSoak: 'outdoor soaking',
  ownPlace: 'having your own place',
  scenic: 'scenic views',
  simpleCozy: 'simple & cozy',
  social: 'spaces to gather',
};

const PARTY_LABELS: Record<string, string> = {
  partner: 'a couple',
  friends: 'a group of friends',
  family: 'a family',
  solo: 'a solo traveler',
};

function buildTopMatchCopy(
  room: RoomProduct,
  prefs: RecommendationPreferences,
  checkIn: string,
): TopMatchCopy {
  const season = seasonForDate(checkIn);
  const matched = matchedInterests(room, prefs.interests);
  const interestStr = matched.map((i) => INTEREST_LABELS[i]).join(' and ');
  const partyStr = PARTY_LABELS[prefs.party] ?? 'your group';

  return {
    match_badge: 'TOP MATCH',
    room_type: room.experience,
    party_summary: `Great for ${partyStr}`,
    interest_summary: interestStr ? `Matched for ${interestStr}` : 'Curated to your style',
    top_match_reason: room.tagline,
    benefit_1: room.features.indoorTub ? 'Private copper soaking tub' : room.features.outdoorSoak ? 'Private outdoor cedar tub' : 'Exclusive access',
    benefit_2: room.features.scenicView ? 'Valley & ridge views' : room.features.fireplace ? 'Wood-burning fireplace' : 'Full privacy',
    benefit_3: room.features.dogFriendly ? 'Dog-friendly' : room.features.ownPlace ? 'Your own private place' : `${room.features.sleeps ?? 2} guests max`,
    season_label: season,
    alternate_match_heading: 'ALSO A STRONG FIT',
  };
}

export function rank(params: {
  availableRooms: RoomProduct[];
  preferences: RecommendationPreferences;
  children: number;
  checkIn: string;
}): RecommendationResult[] {
  const { availableRooms, preferences, children, checkIn } = params;

  const eligible = availableRooms.filter((r) => isEligible(r, preferences, children));

  const scored = eligible.map((room) => ({
    room,
    score: scoreRoom(room, preferences),
    matchedInterests: matchedInterests(room, preferences.interests),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((item, idx) => ({
    ...item,
    explanation: idx === 0 ? buildTopMatchCopy(item.room, preferences, checkIn) : undefined,
  }));
}

export function rankFromState(
  preferences: RecommendationPreferences,
  children: number,
  checkIn: string,
): RecommendationResult[] {
  const allRooms = ROOMS.filter((r) => r.available);
  return rank({ availableRooms: allRooms, preferences, children, checkIn });
}
