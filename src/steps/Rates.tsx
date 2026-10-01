import { useEffect, useMemo } from "react";
import { RateSelectionView } from "@/components/rates/RateSelectionView";
import type { RoomType } from "@/types";
import { imgUrl } from "../lib/format";
import { useBooking } from "../state/booking";

function toProductRoom(room: NonNullable<ReturnType<typeof useBooking>["selectedRoom"]>, imageBaseUrl: string): RoomType {
  const merchandising = room.merchandising;
  const images = room.imageIds
    .map((id) => imgUrl(imageBaseUrl, id, 1600))
    .filter((value): value is string => Boolean(value));
  return {
    id: room.categoryId,
    buildingId: room.property || "catskills",
    buildingName: room.property || "Catskills",
    name: room.name,
    eyebrow: merchandising?.family || "A distinct room experience",
    tagline: merchandising?.family || "Stay a little differently",
    description: room.description,
    longDescription: room.description,
    basePrice: room.rates[0]?.perNightGross ?? room.fromGross ?? 0,
    squareFeet: 0,
    bedType: room.normalBedCount > 1 ? `${room.normalBedCount} beds` : "1 bed",
    maxGuests: room.capacity,
    isDogFriendly: merchandising?.dogPolicy === "allowed",
    ageRestricted21: merchandising?.agePolicy === "adultsOnly21",
    soakType: merchandising?.features.outdoorSoak ? "outdoor-cedar-tub" : "clawfoot-window",
    soakHighlight: "Private bathing experience",
    images: images.length ? images : [],
    features: [],
    tags: [],
  };
}

export function Rates() {
  const { selectedRoom, roomId, hydrating, imageBaseUrl, checkIn, checkOut, nightsCount, adults, children, selectRoomRate, goTo } = useBooking();

  useEffect(() => {
    // During URL rehydration the room id is available before the ShapedRoom is
    // restored. Do not bounce a valid Rates deep link back to Results in that gap.
    if (!hydrating && !selectedRoom && !roomId) goTo("results");
  }, [hydrating, selectedRoom, roomId, goTo]);

  const productRoom = useMemo(
    () => (selectedRoom ? toProductRoom(selectedRoom, imageBaseUrl) : null),
    [selectedRoom, imageBaseUrl],
  );

  if (!selectedRoom || !productRoom) return null;

  return (
    <RateSelectionView
      room={productRoom}
      criteria={{
        property: selectedRoom.property || "catskills",
        checkIn,
        checkOut,
        nights: nightsCount,
        guests: adults,
        children,
        rooms: 1,
      }}
      selectedRate={null}
      liveRates={selectedRoom.rates}
      onSelectRate={() => undefined}
      onSelectLiveRate={(rate) => {
        selectRoomRate(selectedRoom, rate);
        goTo("guest");
      }}
      onChangeRoom={() => goTo("results")}
      activeVersion="v2"
    />
  );
}
