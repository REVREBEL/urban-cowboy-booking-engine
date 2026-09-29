export type RoomPhoto = { url: string; alt: string };

const RAW =
  "https://raw.githubusercontent.com/REVREBEL/urban-cowboy-booking-engine/d77a9f16cb2f99624f730bbb63cd340c74a6fdb5/src/components/other-cowboy/figma/public/assets";

const photo = (n: number, alt: string): RoomPhoto => ({
  url: `${RAW}/room-photo-${n}.png`,
  alt,
});

export const ROOM_PHOTOS: Record<string, RoomPhoto[]> = {
  "alpine-bathing-suite": [
    photo(1, "Alpine Bathing Suite"),
    photo(2, "Alpine Bathing Suite"),
    photo(3, "Alpine Bathing Suite"),
  ],
  "walden-forest-bathing-suite": [
    photo(4, "Walden Forest Bathing Suite"),
    photo(5, "Walden Forest Bathing Suite"),
    photo(6, "Walden Forest Bathing Suite"),
  ],
  "lodge-room": [photo(7, "Lodge Room"), photo(8, "Lodge Room")],
  cabin: [photo(9, "The Cabin"), photo(10, "The Cabin")],
  chalet: [photo(11, "The Chalet"), photo(12, "The Chalet")],
  "forest-house": [photo(13, "Forest House"), photo(14, "Forest House")],
  "slide-mountain-suite": [photo(15, "Slide Mountain Suite"), photo(3, "Slide Mountain Suite")],
  "walden-room": [photo(5, "Walden Room"), photo(6, "Walden Room")],
};

export function roomPhotos(roomId: string): RoomPhoto[] {
  return ROOM_PHOTOS[roomId] ?? [];
}
