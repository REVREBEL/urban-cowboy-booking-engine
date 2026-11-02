/**
 * Photo Journey Step 3: production RateCardLab cards with a full-width details tray.
 * Rates and descriptions come from the selected Mews room and Webflow rate-card CMS.
 * Keep Photo Journey's rate -> extras transition (the standard flow differs).
 */
import { useEffect, useState } from "react";
import { ProductionRateTray } from "@/components/rates/ProductionRateTray";
import type { RateCardConfig } from "@/types/rate-card";
import { useBooking } from "../state/booking";
import { api } from "../lib/api";
import { toPhotoTourRoom } from "@/data/photoTourRooms";
import { photoGalleryForRoom } from "@/data/photoGalleries";

export function PhotoRateStep() {
  const booking = useBooking();
  const [configs, setConfigs] = useState<RateCardConfig[]>([]);

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
    <section className="min-h-dvh bg-paper text-lake-forest" data-photo-rate-step>
      {image && (
        <div className="relative h-44 overflow-hidden bg-smoke sm:h-60 lg:h-72">
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-linear-to-t from-smoke/60 to-smoke/10" />
          <p className="absolute bottom-6 left-5 font-label text-xs uppercase tracking-[0.22em] text-paper sm:left-8">
            03 — How would you like to stay?
          </p>
        </div>
      )}
      <ProductionRateTray
        roomName={room.name}
        checkIn={booking.checkIn}
        nights={booking.nightsCount}
        rates={room.rates}
        configs={configs}
        selectedRateId={booking.selectedRate?.rateId ?? null}
        onSelectRate={(rate) => {
          booking.selectRoomRate(room, rate);
          booking.goTo("extras");
        }}
        onChangeRoom={() => booking.goTo("results")}
      />
    </section>
  );
}
