import { createRoot } from "react-dom/client";
import { BookingFooter } from "../../src/components/booking/chrome/footer";
import { ExtrasStep } from "../../src/components/booking/extras/ExtrasStep";
import { CheckoutStep } from "../../src/components/booking/summary/CheckoutStep";
import { Brand } from "../../src/components/brand/Brand";
import { AmenityWoodcutIcon } from "../../src/components/icons/AmenityWoodcutIcon";
import { BuildingWoodcut } from "../../src/components/icons/BuildingWoodcut";
import { IconBed } from "../../src/components/icons/cowboy-icons";
import { ProductionRateTray } from "../../src/components/rates/ProductionRateTray";
import { RateSelectionView } from "../../src/components/rates/RateSelectionView";
import { RoomDetailModal } from "../../src/components/rooms/RoomDetailModal";
import { RoomsListBuilding } from "../../src/components/rooms/RoomsListBuilding";
import type { MerchandisedAddOn } from "../../src/types/add-on-cms";
import type { BuildingCms } from "../../src/types/building-cms";
import type { RoomType, SearchCriteria } from "../../src/types";
import type { ShapedRate, ShapedRoom } from "../../src/types/mews";
import type { RateCardConfig } from "../../src/types/rate-card";
import { BookingProvider } from "../../src/state/booking";
import "../../src/styles/index.css";

const IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='6' viewBox='0 0 8 6'%3E%3Crect width='8' height='6' fill='%234e332d'/%3E%3C/svg%3E";
const noop = () => undefined;

const criteria: SearchCriteria = {
  property: "Urban Cowboy Catskills",
  checkIn: "2027-06-20",
  checkOut: "2027-06-23",
  nights: 3,
  guests: 2,
  rooms: 1,
};

const room: RoomType = {
  id: "alpine-bathing-suite",
  buildingId: "alpine",
  buildingName: "Alpine Haus",
  name: "Alpine Bathing Suite",
  eyebrow: "THE ICONIC INDOOR SOAK",
  tagline: "Copper clawfoot tub with forest views",
  description: "A hillside suite with a copper clawfoot tub in front of a picture window.",
  longDescription: "A king bed, a freestanding soaking tub and a forest-facing window.",
  basePrice: 425,
  squareFeet: 450,
  bedType: "King",
  maxGuests: 2,
  isDogFriendly: false,
  ageRestricted21: true,
  soakType: "clawfoot-window",
  soakHighlight: "Picture window clawfoot soak facing the hemlocks",
  images: [IMAGE, IMAGE],
  features: ["Clawfoot Tub", "Fireplace"],
  tags: ["alpine", "soak"],
};

const rate: ShapedRate = {
  rateId: "ride-easy",
  rateGroupId: "flexible-group",
  knownRateGroup: "FLEXIBLE",
  name: "Ride Easy",
  description: "Our standard flexible rate.",
  isPrivate: false,
  currency: "USD",
  totalGross: 1275,
  totalNet: 1200,
  totalTax: 75,
  perNightGross: 425,
  perNightNet: 400,
  perNightTax: 25,
  maxGross: null,
  maxNet: null,
  maxTax: null,
  citySejour: null,
  settlement: {
    type: "Automatic",
    action: "ChargeCreditCard",
    isAutomatic: true,
    trigger: "Confirmation",
    offset: null,
    value: 0.5,
    flatValue: null,
    currencyCode: "USD",
    maximumTimeUnits: null,
  },
};

const rateConfig: RateCardConfig = {
  id: "ride-easy-card",
  name: "Ride Easy",
  mewsRateId: "ride-easy",
  isDefault: true,
  active: true,
  sortOrder: 0,
  desktopArtworkUrl: null,
  mobileArtworkUrl: null,
  horizontalArtworkUrl: null,
  desktopOverlayPosition: "normal",
  mobileOverlayPosition: "normal",
  buttonStyle: "filled",
  buttonColor: "lake-forest",
  textColor: "lake-forest",
  accentColor: "bandana-red",
  borderStyle: "single",
  fontPair: "desert-bianco",
  headline: "Ride Easy",
  eyebrow: "Keep Your Options Open",
  description: "Our standard rate for guests who want a little more freedom.",
  cancellationPenaltyWindow: 14,
  cancellationPenaltyWindowPeriod: "days",
  cancellationFullForfeitWindow: 5,
  cancellationFullForfeitWindowPeriod: "days",
};

const shapedRoom: ShapedRoom = {
  roomTypeId: room.id,
  categoryId: room.id,
  name: room.name,
  description: room.description,
  imageIds: [IMAGE],
  normalBedCount: 1,
  extraBedCount: 0,
  roomClass: "suite",
  spaceType: "suite",
  availableRoomCount: 2,
  capacity: 2,
  rates: [rate],
  fromGross: rate.totalGross,
  property: "hotel",
  merchandising: null,
  merchandisingSource: null,
};

const building: BuildingCms = {
  id: "alpine-building",
  groupKey: "alpine",
  name: "Alpine Haus",
  slug: "alpine-haus",
  subheading: "Indoor soaking",
  shortDescription: "A hillside collection of suites with forest views.",
  featureBenefits: "Freestanding tubs and stone fireplaces.",
  policy: [],
};

const addon: MerchandisedAddOn = {
  id: "sauna-pass",
  displayId: "sauna-pass",
  cmsItemId: "sauna-pass",
  name: "Estonian Sauna Session",
  description: "Private wood-fired sauna and cedar cold plunge access.",
  price: 45,
  currency: "USD",
  chargingMode: "perPerson",
  imageId: "sauna",
  imageUrl: IMAGE,
  contentSource: "webflow",
  knownAddOn: null,
  property: "Urban Cowboy Catskills",
};

function RateSelectionCase() {
  return (
    <div data-testid="rate-selection">
      <RateSelectionView
        room={room}
        criteria={criteria}
        selectedRate={null}
        onSelectRate={noop}
        onChangeRoom={noop}
      />
    </div>
  );
}

function ProductionRateTrayCase() {
  return (
    <div data-testid="production-rate-tray">
      <ProductionRateTray
        roomName={room.name}
        checkIn={criteria.checkIn}
        nights={criteria.nights}
        rates={[rate]}
        configs={[rateConfig]}
        selectedRateId={null}
        onSelectRate={noop}
        onChangeRoom={noop}
      />
    </div>
  );
}

function RoomDetailCase() {
  return (
    <RoomDetailModal
      room={room}
      criteria={criteria}
      review={null}
      onClose={noop}
      onProceedToRates={noop}
    />
  );
}

function RoomsListBuildingCase() {
  return (
    <RoomsListBuilding
      building={building}
      rooms={[shapedRoom]}
      imageBaseUrl=""
      onSelectRoom={noop}
      onOpenRoomDetails={noop}
    />
  );
}

function CheckoutCase() {
  return (
    <BookingProvider>
      <CheckoutStep eyebrow="Reserve your stay" title="Guest details" onBack={noop}>
        <label>
          Fixture guest field
          <input name="fixture-guest" />
        </label>
      </CheckoutStep>
      <BookingFooter />
    </BookingProvider>
  );
}

function ExtrasCase() {
  return (
    <ExtrasStep
      products={[addon]}
      imageBaseUrl=""
      selectedProductIds={[]}
      selectedDisplayByProduct={{}}
      preferences={{}}
      lockedProductIds={new Set()}
      nightsCount={criteria.nights}
      guestsCount={criteria.guests}
      checkIn={criteria.checkIn}
      checkOut={criteria.checkOut}
      roomName={room.name}
      rateName={rate.name}
      extrasTotal={0}
      currency="USD"
      airportTransfer={false}
      onToggleAirportTransfer={noop}
      onToggle={noop}
      onSavePreference={noop}
      onProceedToPay={noop}
      onBack={noop}
    />
  );
}

function BrandCase() {
  return (
    <div data-testid="brand-artwork" className="flex items-center gap-8">
      <Brand alt />
      <AmenityWoodcutIcon type="clawfoot-tub" />
      <BuildingWoodcut group="alpine" />
      <IconBed aria-label="Bed icon" />
    </div>
  );
}

const cases = {
  "rate-selection": RateSelectionCase,
  "production-rate-tray": ProductionRateTrayCase,
  "room-detail": RoomDetailCase,
  "rooms-list-building": RoomsListBuildingCase,
  checkout: CheckoutCase,
  extras: ExtrasCase,
  brand: BrandCase,
};

const requestedCase = new URLSearchParams(window.location.search).get("case") ?? "rate-selection";
const Component = cases[requestedCase as keyof typeof cases] ?? RateSelectionCase;

createRoot(document.getElementById("root")!).render(
  <main className="min-h-screen bg-paper p-6 text-smoke">
    <Component />
  </main>,
);
