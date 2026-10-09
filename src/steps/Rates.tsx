import { useEffect, useMemo, useState } from "react";
import { RateSelectionView } from "@/components/rates/RateSelectionView";
import type { RoomType } from "@/types";
import type { RateCardConfig } from "@/types/rate-card";
import { imgUrl } from "../lib/format";
import { api } from "../lib/api";
import { useBooking } from "../state/booking";
import { roomTypeGroupName } from "@/data/roomTypeGroups";

function toProductRoom(room: NonNullable<ReturnType<typeof useBooking>["selectedRoom"]>, imageBaseUrl: string): RoomType {
  const merchandising = room.merchandising;
  const roomTypeGroupKey = merchandising?.roomTypeGroupKey ?? "other";
  const groupName = roomTypeGroupName(roomTypeGroupKey);
  const images = room.imageIds
    .map((id) => imgUrl(imageBaseUrl, id, 1600))
    .filter((value): value is string => Boolean(value));
  return {
    id: room.roomTypeId,
    buildingId: roomTypeGroupKey,
    buildingName: groupName,
    name: room.name,
    eyebrow: groupName,
    tagline: merchandising?.cardTagline || "Stay a little differently",
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
  const { selectedRoom, roomTypeId, hydrating, imageBaseUrl, checkIn, checkOut, nightsCount, adults, children, selectRoomRate, goTo } = useBooking();
  const [rateCardConfigs, setRateCardConfigs] = useState<RateCardConfig[]>([]);

  useEffect(() => {
    let active = true;

    api.rateCards().then((cards) => {
      if (active) setRateCardConfigs(cards);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    // During URL rehydration the room id is available before the ShapedRoom is
    // restored. Do not bounce a valid Rates deep link back to Results in that gap.
    if (!hydrating && !selectedRoom && !roomTypeId) goTo("results");
  }, [hydrating, selectedRoom, roomTypeId, goTo]);

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
      rateCardConfigs={rateCardConfigs}
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
