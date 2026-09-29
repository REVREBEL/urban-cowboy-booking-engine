import { useState } from "react";
import { BookingShell } from "@/components/booking/BookingShell";
import { DogToggleButton } from "@/components/booking/DogToggleButton";
import { MatchBenefitsCard } from "@/components/booking/MatchBenefitsCard";
import { PreferenceIconButton } from "@/components/booking/PreferenceIconButton";
import { RateList } from "@/components/booking/RateList";
import { RoomCard } from "@/components/booking/RoomCard";
import { RoomDetailsFull } from "@/components/booking/RoomDetailsFull";
import { RoomGallery } from "@/components/booking/RoomGallery";
import { SearchBar } from "@/components/booking/SearchBar";
import { StaySummary } from "@/components/booking/StaySummary";
import { BookingProvider } from "@/lib/booking/store";
import type { BookingState } from "@/lib/booking/store";
import { PREFERENCES, ROOMS, type PreferenceId, type RateId } from "@/lib/booking/rooms";
import { roomPhotos } from "@/lib/booking/photos";

const sampleRoom = ROOMS.find((room) => room.id === "walden-forest-bathing-suite") ?? ROOMS[0]!;

function Canvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="booking-source min-h-[720px] bg-background p-6 md:p-10">
      {children}
    </div>
  );
}

function SearchBarPreview() {
  const [promo, setPromo] = useState("");
  return (
    <BookingProvider>
      <div className="mx-auto max-w-6xl py-24">
        <SearchBar
          promo={promo}
          onPromoChange={setPromo}
          onSearch={() => undefined}
        />
      </div>
    </BookingProvider>
  );
}

function DogPreview() {
  const [left, setLeft] = useState(false);
  const [right, setRight] = useState(true);
  return (
    <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-12 py-24">
      <DogToggleButton selected={left} onToggle={() => setLeft((value) => !value)} />
      <DogToggleButton selected={right} onToggle={() => setRight((value) => !value)} />
    </div>
  );
}

function PreferencePreview() {
  const [selected, setSelected] = useState<PreferenceId[]>(["iconic-tub"]);

  function toggle(id: PreferenceId) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id].slice(-2),
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-5 py-10 md:grid-cols-3">
      {PREFERENCES.map((preference) => (
        <PreferenceIconButton
          key={preference.id}
          id={preference.id}
          label={preference.label}
          description={preference.description}
          selected={selected.includes(preference.id)}
          onToggle={() => toggle(preference.id)}
        />
      ))}
    </div>
  );
}

function RatePreview() {
  const [rateId, setRateId] = useState<RateId | null>("ride-easy");
  return (
    <div className="mx-auto max-w-2xl py-12">
      <RateList
        room={sampleRoom}
        nights={2}
        selectedRateId={rateId}
        onChooseRate={setRateId}
      />
    </div>
  );
}

function RoomCardPreview() {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <RoomCard
        room={sampleRoom}
        label="Top match"
        reasons={[
          sampleRoom.reasons["bathe-outside"] ?? sampleRoom.headline,
          sampleRoom.reasons["my-own-place"] ?? sampleRoom.blurb,
        ]}
        featured
        onViewDetails={() => undefined}
        onSelect={() => undefined}
      />
    </div>
  );
}

function DetailsPreview() {
  const [open, setOpen] = useState(true);
  const [rateId, setRateId] = useState<RateId | null>("ride-easy");

  if (!open) {
    return (
      <div className="grid min-h-[720px] place-items-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="font-button rounded-full bg-primary px-6 py-3 text-primary-foreground"
        >
          Reopen room details
        </button>
      </div>
    );
  }

  return (
    <RoomDetailsFull
      room={sampleRoom}
      reasons={[
        sampleRoom.reasons["bathe-outside"] ?? sampleRoom.headline,
        sampleRoom.reasons["my-own-place"] ?? sampleRoom.blurb,
      ]}
      nights={2}
      selectedRateId={rateId}
      onClose={() => setOpen(false)}
      onChooseRate={setRateId}
    />
  );
}

const summaryBooking: BookingState = {
  stay: {
    arrival: "2026-10-16",
    departure: "2026-10-18",
    adults: 2,
    children: 0,
    pets: true,
    accessible: false,
  },
  party: "partner",
  preferences: ["bathe-outside"],
  roomId: sampleRoom.id,
  rateId: "ride-easy",
  guest: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  },
  addonIds: [],
  termsAccepted: false,
  confirmationCode: null,
  helpOpen: true,
};

export function BookingSourcePreview({ component }: { component: string }) {
  switch (component) {
    case "BookingShell.tsx":
      return (
        <div className="booking-source">
          <BookingShell current="room">
            <div className="mx-auto grid min-h-[500px] max-w-6xl place-items-center px-5 py-12">
              <div className="text-center">
                <p className="eyebrow text-xs text-muted-foreground">Room step</p>
                <h2 className="font-display mt-3 text-4xl text-umber">Choose your stay</h2>
              </div>
            </div>
          </BookingShell>
        </div>
      );

    case "DogToggleButton.tsx":
      return <Canvas><DogPreview /></Canvas>;

    case "MatchBenefitsCard.tsx":
      return (
        <Canvas>
          <div className="mx-auto max-w-sm py-6">
            <MatchBenefitsCard
              room={sampleRoom}
              reasons={[
                sampleRoom.reasons["bathe-outside"] ?? sampleRoom.headline,
                sampleRoom.reasons["my-own-place"] ?? sampleRoom.blurb,
              ]}
            />
          </div>
        </Canvas>
      );

    case "PreferenceIconButton.tsx":
      return <Canvas><PreferencePreview /></Canvas>;

    case "RateList.tsx":
      return <Canvas><RatePreview /></Canvas>;

    case "RoomCard.tsx":
      return <Canvas><RoomCardPreview /></Canvas>;

    case "RoomDetailsFull.tsx":
      return <div className="booking-source"><DetailsPreview /></div>;

    case "RoomGallery.tsx":
      return (
        <Canvas>
          <div className="mx-auto max-w-5xl py-10">
            <RoomGallery
              photos={roomPhotos(sampleRoom.id)}
              className="h-[520px] w-full"
              contain
              priority
              onExpand={() => undefined}
            />
          </div>
        </Canvas>
      );

    case "SearchBar.tsx":
      return <Canvas><SearchBarPreview /></Canvas>;

    case "StaySummary.tsx":
      return (
        <Canvas>
          <div className="mx-auto max-w-sm py-12">
            <StaySummary booking={summaryBooking} />
          </div>
        </Canvas>
      );

    default:
      return (
        <Canvas>
          <div className="grid min-h-[600px] place-items-center text-sm text-muted-foreground">
            No source preview configured for {component}.
          </div>
        </Canvas>
      );
  }
}
