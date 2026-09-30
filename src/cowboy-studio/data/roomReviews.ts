export interface RoomReview {
  id: string;
  roomIds: string[];
  buildingId: string;
  roomTypeTitle: string;
  quote: string;
  reviewer: string;
  date: string;
  site: string;
  rating: number;
  highlightTags?: string[];
  verifiedStay?: boolean;
}

export const ROOM_REVIEWS: RoomReview[] = [
  {
    id: 'review-alpine-ben',
    roomIds: ['alpine-bathing-suite', 'alpine-bathing-suite-den', 'alpine-penthouse'],
    buildingId: 'alpine',
    roomTypeTitle: 'The Alpine Suite & Alpine Rooms',
    quote:
      'We went all out and stayed in the Alpine Suite - beautiful, clean room with heated bathroom floors and a hot tub ideally located for night time star gazing.',
    reviewer: 'Ben',
    date: 'May 27, 2025',
    site: 'Google',
    rating: 5,
    highlightTags: ['Heated Floors', 'Stargazing Soak', 'Hillside Views'],
    verifiedStay: true
  },
  {
    id: 'review-walden-mel',
    roomIds: ['walden-forest-bathing', 'walden-king', 'walden-forest-den', 'walden-sunrise-bathing'],
    buildingId: 'walden',
    roomTypeTitle: 'Walden Haus & Forest Bathing Suites',
    quote:
      'Our two night stay at Walden House was special. We loved the beauty of the valley, our intentionally decorated room and cosy shared spaces, the sauna (a must), our cedar soaking tub...',
    reviewer: 'Mel',
    date: 'May 10, 2025',
    site: 'Google',
    rating: 5,
    highlightTags: ['Cedar Soaking Tub', 'Pines & Valley', 'Sauna Ritual'],
    verifiedStay: true
  },
  {
    id: 'review-lodge-cj',
    roomIds: ['lodge-penthouse', 'lodge-three-bedroom', 'lodge-king'],
    buildingId: 'lodge',
    roomTypeTitle: 'Lodge Penthouse & Grand Suites',
    quote:
      'The pent house will leave you in awe. It is a luxury... The rooms are beautiful and unique. The wood decor is a artistic masterpiece. Then add in cooper tubs, sinks, and full glass showers.',
    reviewer: 'C J',
    date: 'April 21, 2026',
    site: 'Google Reviews',
    rating: 5,
    highlightTags: ['Artistic Masterpiece', 'Copper Tubs', 'Glass Showers'],
    verifiedStay: true
  }
];

export const getReviewsForRoom = (roomId: string, buildingId: string): RoomReview[] => {
  // First look for exact room matches
  const exact = ROOM_REVIEWS.filter((r) => r.roomIds.includes(roomId));
  if (exact.length > 0) return exact;

  // Fallback to building match
  const byBuilding = ROOM_REVIEWS.filter((r) => r.buildingId === buildingId);
  if (byBuilding.length > 0) return byBuilding;

  return ROOM_REVIEWS;
};

export const getFeaturedReviewForRoom = (roomId: string, buildingId: string): RoomReview => {
  const reviews = getReviewsForRoom(roomId, buildingId);
  return reviews[0] || ROOM_REVIEWS[0];
};
