import { useEffect, useState } from "react";
import { ProductionRateTray } from "@/components/rates/ProductionRateTray";
import type { RateCardConfig } from "@/types/rate-card";
import type { PolicyLanguage } from "@/types/policy-language";
import { api } from "../lib/api";
import { useBooking } from "../state/booking";

export function Rates() {
  const {
    selectedRoom,
    selectedRate,
    roomTypeId,
    hydrating,
    checkIn,
    nightsCount,
    selectRoomRate,
    goTo,
  } = useBooking();
  const [rateCardConfigs, setRateCardConfigs] = useState<RateCardConfig[]>([]);
  const [policyLanguage, setPolicyLanguage] = useState<Partial<PolicyLanguage>>({});

  useEffect(() => {
    let active = true;
    void api.policyLanguage().then((labels) => {
      if (active) setPolicyLanguage(labels);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    void api.rateCards().then((cards) => {
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

  if (!selectedRoom) return null;

  return (
    <ProductionRateTray
      roomName={selectedRoom.name}
      checkIn={checkIn}
      nights={nightsCount}
      rates={selectedRoom.rates}
      configs={rateCardConfigs}
      policyLanguage={policyLanguage}
      selectedRateId={selectedRate?.rateId ?? null}
      onSelectRate={(rate) => {
        selectRoomRate(selectedRoom, rate);
        goTo("guest");
      }}
      onChangeRoom={() => goTo("results")}
    />
  );
}
