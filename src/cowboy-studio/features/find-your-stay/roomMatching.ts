import type {
  MatchInterest,
  RecommendationPreferences,
  RoomType,
  SearchCriteria
} from '../../types';

function contains(room: RoomType, pattern: RegExp) {
  return pattern.test(
    [room.name, room.tagline, room.soakHighlight, ...room.features, ...room.tags]
      .join(' ')
      .toLowerCase()
  );
}

function interestScore(room: RoomType, interest: MatchInterest): number {
  switch (interest) {
    case 'iconTub':
      return room.soakType === 'copper-tub-fireplace' || room.soakType === 'copper-den'
        ? 5
        : room.soakType === 'clawfoot-window'
          ? 4
          : 0;
    case 'outdoorSoak':
      return room.soakType === 'outdoor-cedar-tub' || room.soakType === 'soaking-porch' ? 5 : 0;
    case 'ownPlace':
      return room.maxGuests >= 6 || contains(room, /three-bedroom|full kitchen|private house|living room/) ? 5 : 1;
    case 'scenic':
      return contains(room, /mountain|forest|view|valley|balcony|deck|sunrise/) ? 5 : 2;
    case 'simpleCozy':
      return contains(room, /simple|cozy|king room|writing desk/) || room.basePrice <= 180 ? 5 : 2;
    case 'social':
      return room.maxGuests >= 4 || contains(room, /gather|living room|wet bar|three-bedroom/) ? 5 : 1;
  }
}

function partyScore(room: RoomType, preferences: RecommendationPreferences): number {
  switch (preferences.party) {
    case 'solo':
      return room.maxGuests <= 2 ? 5 : 2;
    case 'partner':
      return room.maxGuests >= 2 && room.maxGuests <= 3 ? 5 : 3;
    case 'friends':
      return room.maxGuests >= 4 ? 5 : room.maxGuests >= 2 ? 3 : 1;
    case 'family':
      return !room.ageRestricted21 && room.maxGuests >= 3 ? 5 : !room.ageRestricted21 ? 3 : 0;
  }
}

export function isRoomRecommendationEligible(
  room: RoomType,
  preferences: RecommendationPreferences,
  search: SearchCriteria
) {
  const partySize = search.guests + (search.children ?? 0);
  if (room.maxGuests < partySize) return false;
  if ((search.children ?? 0) > 0 && room.ageRestricted21) return false;
  if (preferences.dog && !room.isDogFriendly) return false;
  return true;
}

export function recommendationScore(room: RoomType, preferences: RecommendationPreferences) {
  const [primary, secondary] = preferences.interests;
  const primaryFit = interestScore(room, primary);
  let score = primaryFit * 10 + partyScore(room, preferences) * 2;

  if (secondary) {
    const secondaryFit = interestScore(room, secondary);
    score += secondaryFit * 10;

    const high = Math.max(primaryFit, secondaryFit);
    const low = Math.min(primaryFit, secondaryFit);
    if (primaryFit >= 4 && secondaryFit >= 4) score += 50;
    else if (high >= 4 && low >= 2) score += 20;
  }

  return score;
}

export function rankRecommendedRooms(
  rooms: RoomType[],
  preferences: RecommendationPreferences,
  search: SearchCriteria
) {
  return rooms
    .filter((room) => isRoomRecommendationEligible(room, preferences, search))
    .map((room, index) => ({ room, index, score: recommendationScore(room, preferences) }))
    .sort((a, b) => b.score - a.score || a.room.basePrice - b.room.basePrice || a.index - b.index)
    .map(({ room }) => room);
}

