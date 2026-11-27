"use client";

import { useState } from "react";
import { BuildingExperienceList } from "../../src/components/rooms/BuildingExperienceList";
import { MultiRoomViewBuilding } from "../../src/components/rooms/MultiRoomViewBuilding";
import { MultiRoomViewList } from "../../src/components/rooms/RoomTypeList";
import { MultiRoomViewListItem } from "../../src/components/rooms/MultiRoomViewListItem";
import { MultiRoomViewRoomTypeCard } from "../../src/components/rooms/MultiRoomViewRoomTypeCard";
import { GuestReviewQuoteCard } from "../../src/components/rooms/GuestReviewQuoteCard";
import { BuildingIcon } from "../../src/components/rooms/BuildingIcon";
import type { SearchCriteria } from "../../src/types";
import type { ShapedRoom, ShapedRate } from "../../src/types/mews";
import type { RoomMerchandising } from "../../src/types/merchandising";
import { ROOM_IMAGE_ASSETS } from "../../src/data/roomImagePlaceholders";
import { defineStory } from "../lib/story";

// Shared mock data
const mockCriteria: SearchCriteria = {
  property: "Urban Cowboy Catskills",
  checkIn: "2026-10-14",
  checkOut: "2026-10-17",
  nights: 3,
  guests: 2,
  rooms: 1,
};

const mockRate1: ShapedRate = {
  rateId: "rate-1",
  rateGroupId: "group-1",
  knownRateGroup: "FLEXIBLE",
  name: "Best Flexible Rate",
  description: "Flexible rate",
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
    type: "automatic",
    action: "charge",
    isAutomatic: true,
    trigger: null,
    offset: null,
    value: null,
    flatValue: null,
    currencyCode: null,
    maximumTimeUnits: null,
  },
};

const mockRate2: ShapedRate = {
  ...mockRate1,
  rateId: "rate-2",
  perNightGross: 395,
  totalGross: 1185,
};

const mockMerchandisingAlpine: RoomMerchandising = {
  key: "alpine-bathing-suite",
  mewsRoomTypeId: "alpine-bathing-suite",
  legacyNames: ["Alpine Bathing Suite"],
  roomTypeGroupKey: "alpine",
  cardTagline: "THE ICONIC INDOOR SOAK",
  cardDescription: "A hillside suite with a copper clawfoot tub in front of a picture window.",
  dogPolicy: "notAllowed",
  agePolicy: "adultsOnly21",
  partyScores: { partner: 10, friends: 5, family: 0, solo: 8 },
  interestScores: {},
  interestPriority: {},
  features: { indoorTub: true, outdoorSoak: false, fireplace: true, scenicView: true },
  matchReasons: {},
};

const mockMerchandisingAlpineBathingSuiteDen: RoomMerchandising = {
  key: "alpine-bathing-suite",
  mewsRoomTypeId: "alpine-bathing-suite-with-den",
  legacyNames: ["Alpine Bathing Suite with Den"],
  roomTypeGroupKey: "alpine",
  cardTagline: "THE ICONIC INDOOR SOAK",
  cardDescription: "Tucked beneath the eaves at the top of Alpine, these are the building's biggest and most playful suites—dormered ceilings, exposed beams, unexpected angles and a balcony made for two. There's a copper clawfoot tub, naturally. And a fireplace for everything that comes after.",
  dogPolicy: "notAllowed",
  agePolicy: "adultsOnly21",
  partyScores: { partner: 10, friends: 5, family: 0, solo: 8 },
  interestScores: {},
  interestPriority: {},
  features: { indoorTub: true, outdoorSoak: false, fireplace: true, scenicView: true },
  matchReasons: {},
};

const mockMerchandisingAlpinePenthouse: RoomMerchandising = {
  key: "alpine-bathing-suite",
  mewsRoomTypeId: "alpine-penthouse-bathing-suite",
  legacyNames: ["Alpine Penthouse Bathing Suite"],
  roomTypeGroupKey: "alpine",
  cardTagline: "THE ICONIC INDOOR SOAK",
  cardDescription: "There's only one like this. Stretch out in the built-in chaise den by the fire, or climb into the copper clawfoot tub and take in one of Alpine's best mountain views. It's part bathing suite, part hideaway, and exactly the kind of room that makes leaving for dinner feel optional.",
  dogPolicy: "notAllowed",
  agePolicy: "adultsOnly21",
  partyScores: { partner: 10, friends: 5, family: 0, solo: 8 },
  interestScores: {},
  interestPriority: {},
  features: { indoorTub: true, outdoorSoak: false, fireplace: true, scenicView: true },
  matchReasons: {},
};

const mockMerchandisingWalden: RoomMerchandising = {
  key: "walden-king",
  mewsRoomTypeId: "walden-king",
  legacyNames: ["Walden King"],
  roomTypeGroupKey: "walden",
  cardTagline: "BATHING OUTSIDE AMONG THE TREES",
  cardDescription: "Simple, warm and tucked into the woods, the Walden King is for guests who want the forest outside and just enough Cowboy inside. Take your coffee to the deck. Write something at the desk. Wander off for the day. Or don't.",
  dogPolicy: "allowed",
  agePolicy: "adultsOnly21",
  partyScores: { partner: 9, friends: 6, family: 0, solo: 7 },
  interestScores: {},
  interestPriority: {},
  features: { indoorTub: false, outdoorSoak: true, fireplace: false, scenicView: true },
  matchReasons: {},
};

const mockMerchandisingWaldenBathingSuiteDen: RoomMerchandising = {
  key: "walden-king",
  mewsRoomTypeId: "walden-forest-bathing-suite-with-den",
  legacyNames: ["Walden Forest Bathing Suite with Den"],
  roomTypeGroupKey: "walden",
  cardTagline: "BATHING OUTSIDE AMONG THE TREES",
  cardDescription: "Walden's largest suite gives you more room inside and your own cedar soaking tub outside. Start slow in the lounge. Take the afternoon to the deck. Stay in the water until the stars come out. There is, technically, a desk too. We prefer the original purpose: writing letters to your lover.",
  dogPolicy: "allowed",
  agePolicy: "adultsOnly21",
  partyScores: { partner: 9, friends: 6, family: 0, solo: 7 },
  interestScores: {},
  interestPriority: {},
  features: { indoorTub: false, outdoorSoak: true, fireplace: false, scenicView: true },
  matchReasons: {},
};

const mockMerchandisingWaldenSunriseBathingSuite: RoomMerchandising = {
  key: "walden-king",
  mewsRoomTypeId: "walden-sunrise-bathing-suite",
  legacyNames: ["Walden Sunrise Bathing Suite"],
  roomTypeGroupKey: "walden",
  cardTagline: "BATHING OUTSIDE AMONG THE TREES",
  cardDescription: "Some of the best sunrise views on the property belong to this room. Watch the first light arrive through the diamond-shaped window or, better yet, from the cedar soaking tub on your private porch. Two leather loungers inside give you somewhere to do very little afterward.",
  dogPolicy: "allowed",
  agePolicy: "adultsOnly21",
  partyScores: { partner: 9, friends: 6, family: 0, solo: 7 },
  interestScores: {},
  interestPriority: {},
  features: { indoorTub: false, outdoorSoak: true, fireplace: false, scenicView: true },
  matchReasons: {},
};

const makeMockRoom = ({
  roomTypeId,
  name,
  description,
  imageIds,
  rate,
  merchandising,
}: {
  roomTypeId: string;
  name: string;
  description?: string;
  imageIds: string[];
  rate: ShapedRate;
  merchandising: RoomMerchandising;
}): ShapedRoom => ({
  roomTypeId,
  categoryId: roomTypeId,
  name,
  description: description ?? "",
  cmsShortDescription: description ?? "",
  cmsLongDescription: description ?? "",
  imageIds,
  normalBedCount: 1,
  extraBedCount: 0,
  roomClass: "Suite",
  spaceType: "Suite",
  availableRoomCount: 3,
  capacity: 2,
  rates: [rate],
  fromGross: rate.perNightGross,
  property: "Urban Cowboy Catskills",
  merchandising,
  merchandisingSource: "mewsRoomTypeId",
});

const mockRooms: ShapedRoom[] = [
  makeMockRoom({
    roomTypeId: "alpine-bathing-suite",
    name: "Alpine Bathing Suite",
    description: mockMerchandisingAlpine.cardDescription,
    imageIds: [ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE, ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD],
    rate: mockRate1,
    merchandising: mockMerchandisingAlpine,
  }),
  makeMockRoom({
    roomTypeId: "alpine-bathing-suite-with-den",
    name: "Alpine Bathing Suite with Den",
    description: mockMerchandisingAlpineBathingSuiteDen.cardDescription,
    imageIds: [ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD, ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE],
    rate: mockRate1,
    merchandising: mockMerchandisingAlpineBathingSuiteDen,
  }),
  makeMockRoom({
    roomTypeId: "alpine-penthouse-bathing-suite",
    name: "Alpine Penthouse Bathing Suite",
    description: mockMerchandisingAlpinePenthouse.cardDescription,
    imageIds: [ROOM_IMAGE_ASSETS.ALPINE_PENTHOUSE_COPPER_TUB, ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD],
    rate: mockRate1,
    merchandising: mockMerchandisingAlpinePenthouse,
  }),
  makeMockRoom({
    roomTypeId: "walden-king",
    name: "Walden King",
    description: mockMerchandisingWalden.cardDescription,
    imageIds: [ROOM_IMAGE_ASSETS.WALDEN_SUNRISE_BATHING_SUITE],
    rate: mockRate2,
    merchandising: mockMerchandisingWalden,
  }),
  makeMockRoom({
    roomTypeId: "walden-forest-bathing-suite-with-den",
    name: "Walden Forest Bathing Suite with Den",
    description: mockMerchandisingWaldenBathingSuiteDen.cardDescription,
    imageIds: [ROOM_IMAGE_ASSETS.WALDEN_FOREST_BATHING_SUITE],
    rate: mockRate2,
    merchandising: mockMerchandisingWaldenBathingSuiteDen,
  }),
  makeMockRoom({
    roomTypeId: "walden-sunrise-bathing-suite",
    name: "Walden Sunrise Bathing Suite",
    description: mockMerchandisingWaldenSunriseBathingSuite.cardDescription,
    imageIds: [ROOM_IMAGE_ASSETS.WALDEN_SUNRISE_BATHING_SUITE, ROOM_IMAGE_ASSETS.WALDEN_FOREST_BATHING_SUITE],
    rate: mockRate2,
    merchandising: mockMerchandisingWaldenSunriseBathingSuite,
  }),
];

// Room type card data for MultiRoomViewListItem
const makeRoomTypeCardData = (room: ShapedRoom, index: number) => {
  const perNightGross = room.rates?.[0]?.perNightGross ?? 0;
  // Fixture assertion: verify expected price labels
  if (room.roomTypeId === "alpine-bathing-suite") {
    if (perNightGross !== 425) throw new Error(`Expected Alpine rate 425, got ${perNightGross}`);
  }
  if (room.roomTypeId === "walden-king") {
    if (perNightGross !== 395) throw new Error(`Expected Walden rate 395, got ${perNightGross}`);
  }
  return {
    id: `card-${room.roomTypeId}-${index}`,
    buildingName: room.merchandising?.roomTypeGroupKey === "alpine" ? "Alpine" : "Walden",
    numberOfBeds: `${room.normalBedCount + room.extraBedCount} beds`,
    price: `$${perNightGross}`,
    roomTypeName: room.name,
    state: (index === 0 ? "Focus" : "Default") as "Focus" | "Default",
  };
};

// BuildingExperienceList
function BuildingExperienceListDemo() {
  const [last, setLast] = useState("none");
  return (
    <div className="w-full min-h-[800px] rounded-xl bg-smoke p-4 sm:p-6">
      <BuildingExperienceList
        criteria={mockCriteria}
        rooms={mockRooms}
        imageBaseUrl={process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? ""}
        onUpdateCriteria={() => setLast("updateCriteria")}
        onSelectRoom={() => setLast("selectRoom")}
        onOpenRoomDetails={() => setLast("openRoomDetails")}
        onOpenHelpMeChoose={() => setLast("openHelpMeChoose")}
        onBackToSearch={() => setLast("backToSearch")}
      />
      <p className="sr-only" role="status">{`Last action: ${last}`}</p>
    </div>
  );
}

export const buildingExperienceListStory = defineStory({
  Component: BuildingExperienceListDemo,
  args: { initial: {} },
});

// MultiRoomViewBuilding
const alpineIcon = <BuildingIcon buildingName="Alpine" />;

function MultiRoomViewBuildingDemo({ layout, displayBuildingIcon }: { layout: "Row" | "Row Reverse" | "StackedCenter" | "StackedLeft"; displayBuildingIcon: boolean }) {
  return (
    <div className="w-full min-h-[400px] rounded-xl bg-smoke p-4 sm:p-6">
      <MultiRoomViewBuilding
        buildingName="Alpine"
        buildingDescription="Built into the hillside above the Lodge, Alpine is home to ten of The Cowboy's most iconic rooms. Every suite pairs a freestanding clawfoot tub in front of a picture window, with the forest and mountains doing the decorating outside."
        buildingTagline="This is Where you Come to Soak, Slow Down and Disappear for a While."
        layout={layout}
        displayBuildingIcon={displayBuildingIcon}
        buildingIconSlot={displayBuildingIcon ? alpineIcon : undefined}
      />
    </div>
  );
}

export const multiRoomViewBuildingStory = defineStory({
  Component: MultiRoomViewBuildingDemo,
  args: { initial: { layout: "Row", displayBuildingIcon: false } },
});

export const multiRoomViewBuildingWithIconStory = defineStory({
  Component: MultiRoomViewBuildingDemo,
  args: { initial: { layout: "Row", displayBuildingIcon: true } },
});

export const multiRoomViewBuildingRowReverseStory = defineStory({
  Component: MultiRoomViewBuildingDemo,
  args: { initial: { layout: "Row Reverse", displayBuildingIcon: false } },
});

export const multiRoomViewBuildingStackedCenterStory = defineStory({
  Component: MultiRoomViewBuildingDemo,
  args: { initial: { layout: "StackedCenter", displayBuildingIcon: false } },
});

export const multiRoomViewBuildingStackedLeftStory = defineStory({
  Component: MultiRoomViewBuildingDemo,
  args: { initial: { layout: "StackedLeft", displayBuildingIcon: false } },
});

// MultiRoomViewList (uses slot-based building groups)
function MultiRoomViewListDemo() {
  const alpineRooms = mockRooms.filter(r => r.merchandising?.roomTypeGroupKey === "alpine").slice(0, 3);
  const waldenRooms = mockRooms.filter(r => r.merchandising?.roomTypeGroupKey === "walden").slice(0, 3);
  
  const buildingGroup1 = (
    <MultiRoomViewListItem
      layout="Row"
      roomTypes={alpineRooms.map((r, i) => makeRoomTypeCardData(r, i))}
      buildingSectionSlot={
        <MultiRoomViewBuilding
          buildingName="Alpine"
          buildingDescription="Built into the hillside above the Lodge, Alpine is home to ten of The Cowboy's most iconic rooms."
          buildingTagline="This is Where you Come to Soak, Slow Down and Disappear for a While."
          layout="StackedCenter"
        />
      }
    />
  );
  
  const buildingGroup2 = (
    <MultiRoomViewListItem
      layout="Row"
      roomTypes={waldenRooms.map((r, i) => makeRoomTypeCardData(r, i))}
      buildingSectionSlot={
        <MultiRoomViewBuilding
          buildingName="Walden"
          buildingDescription="Simple, warm and tucked into the woods, Walden is for guests who want the forest outside."
          buildingTagline="Bathing Outside Among the Trees."
          layout="StackedCenter"
        />
      }
    />
  );

  return (
    <div className="w-full min-h-[600px] rounded-xl bg-smoke p-4 sm:p-6">
      <MultiRoomViewList
        buildingGroup1={buildingGroup1}
        buildingGroup2={buildingGroup2}
      />
    </div>
  );
}

export const multiRoomViewListStory = defineStory({
  Component: MultiRoomViewListDemo,
  args: { initial: {} },
});

// MultiRoomViewListItem
function MultiRoomViewListItemDemo({ layout }: { layout: "Default" | "Row" | "RowReverse" }) {
  const alpineRooms = mockRooms.filter(r => r.merchandising?.roomTypeGroupKey === "alpine").slice(0, 3);
  return (
    <div className="w-full min-h-[300px] rounded-xl bg-smoke p-4 sm:p-6">
      <MultiRoomViewListItem
        layout={layout}
        roomTypes={alpineRooms.map((r, i) => makeRoomTypeCardData(r, i))}
        buildingSectionSlot={
          <MultiRoomViewBuilding
            buildingName="Alpine"
            buildingDescription="Built into the hillside above the Lodge..."
            buildingTagline="This is Where you Come to Soak..."
            layout="StackedCenter"
          />
        }
      />
    </div>
  );
}

export const multiRoomViewListItemStory = defineStory({
  Component: MultiRoomViewListItemDemo,
  args: { initial: { layout: "Default" } },
});

export const multiRoomViewListItemRowStory = defineStory({
  Component: MultiRoomViewListItemDemo,
  args: { initial: { layout: "Row" } },
});

export const multiRoomViewListItemRowReverseStory = defineStory({
  Component: MultiRoomViewListItemDemo,
  args: { initial: { layout: "RowReverse" } },
});

// MultiRoomViewRoomTypeCard
function MultiRoomViewRoomTypeCardDemo({ state }: { state: "Default" | "Focus" }) {
  return (
    <div className="w-full min-h-[400px] rounded-xl bg-smoke p-4 sm:p-6">
      <MultiRoomViewRoomTypeCard
        buildingName="Alpine"
        numberOfBeds="8 beds"
        price="$596"
        roomTypeName="Alpine Bathing Suite with Den"
        state={state}
      />
    </div>
  );
}

export const multiRoomViewRoomTypeCardStory = defineStory({
  Component: MultiRoomViewRoomTypeCardDemo,
  args: { initial: { state: "Default" } },
});

export const multiRoomViewRoomTypeCardFocusedStory = defineStory({
  Component: MultiRoomViewRoomTypeCardDemo,
  args: { initial: { state: "Focus" } },
});

// GuestReviewQuoteCard
function GuestReviewQuoteCardDemo({ size, hasAttribution, hasLink }: { size: "sm" | "md" | "lg"; hasAttribution: boolean; hasLink: boolean }) {
  return (
    <div className="w-full min-h-[200px] rounded-xl bg-smoke p-4 sm:p-6">
      <GuestReviewQuoteCard
        quote="The freestanding clawfoot tub facing the snow-dusted pines was magic."
        reviewer={hasAttribution ? "Sarah Jenkins" : null}
        date={hasAttribution ? "October 2025" : null}
        site={hasAttribution ? "Condé Nast Traveler" : null}
        sourceUrl={hasAttribution && hasLink ? "https://example.com/review" : null}
        size={size}
      />
    </div>
  );
}

export const guestReviewQuoteCardStory = defineStory({
  Component: GuestReviewQuoteCardDemo,
  args: { initial: { size: "md", hasAttribution: true, hasLink: true } },
});

export const guestReviewQuoteCardSmallStory = defineStory({
  Component: GuestReviewQuoteCardDemo,
  args: { initial: { size: "sm", hasAttribution: true, hasLink: true } },
});

export const guestReviewQuoteCardLargeStory = defineStory({
  Component: GuestReviewQuoteCardDemo,
  args: { initial: { size: "lg", hasAttribution: true, hasLink: true } },
});

export const guestReviewQuoteCardQuoteOnlyStory = defineStory({
  Component: GuestReviewQuoteCardDemo,
  args: { initial: { size: "md", hasAttribution: false, hasLink: false } },
});

export const guestReviewQuoteCardAttributionNoLinkStory = defineStory({
  Component: GuestReviewQuoteCardDemo,
  args: { initial: { size: "md", hasAttribution: true, hasLink: false } },
});