/**
 * Photo Journey Step 3: production RateCardLab cards with a full-width details tray.
 * Rates and descriptions come from the selected Mews room and Webflow rate-card CMS.
 * Keep Photo Journey's rate -> extras transition (the standard flow differs).
 */
import { useEffect, useState } from "react";
import { ProductionRateTray } from "@/components/rates/ProductionRateTray";
import type { RateCardConfig } from "@/types/rate-card";
import type { PolicyLanguage } from "@/types/policy-language";
import { useBooking } from "../state/booking";
import { api } from "../lib/api";
import { toPhotoTourRoom } from "@/data/photoTourRooms";
import { photoGalleryForRoom } from "@/data/photoGalleries";

export function PhotoRateStep() {
  const booking = useBooking();
  const [configs, setConfigs] = useState<RateCardConfig[]>([]);
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
    void api.rateCards()
      .then((cards) => {
        if (active) setConfigs(cards);
      })
      .catch(() => {
        // Keep live Mews rates selectable if optional CMS merchandising fails.
        if (active) setConfigs([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const room = booking.selectedRoom;
  if (!room) return null;

  const photo = toPhotoTourRoom(
    room,
    booking.imageBaseUrl,
    photoGalleryForRoom(room.roomTypeId),
  );
  const image = photo.images[photo.images.length > 1 ? 1 : 0];

  return (
    <section className="relative min-h-dvh overflow-hidden bg-smoke text-paper" data-photo-rate-step>
      {image && (
        <>
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-linear-to-t from-smoke via-smoke/70 to-smoke/15" />
        </>
      )}
      <div className="relative z-10 pt-44 sm:pt-60 lg:pt-72">
        <ProductionRateTray
          roomName={room.name}
          checkIn={booking.checkIn}
          nights={booking.nightsCount}
          rates={room.rates}
          configs={configs}
          policyLanguage={policyLanguage}
          selectedRateId={booking.selectedRate?.rateId ?? null}
          showChangeRoomAction={false}
          onSelectRate={(rate) => {
            booking.selectRoomRate(room, rate);
            booking.goTo("extras");
          }}
          onChangeRoom={() => booking.goTo("results")}
        />
      </div>
    </section>
  );
}
