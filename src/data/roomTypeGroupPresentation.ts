import type { RoomTypeGroupKey } from "@/types/accommodations";

export type RoomTypeGroupPresentation = {
  iconPath: string;
  headline?: string;
  paragraphs: readonly string[];
  callout?: string;
  badge?: string;
  roomOrder: readonly string[];
};

export const ROOM_TYPE_GROUP_PRESENTATION: Record<
  RoomTypeGroupKey,
  RoomTypeGroupPresentation
> = {
  alpine: {
    iconPath: "/assets/icons/buildings/alpine_haus.svg",
    headline: "The Iconic Indoor Soak",
    paragraphs: [
      "Built into the hillside above the Lodge, Alpine is home to ten of the Cowboy's most iconic rooms. Every suite puts a freestanding clawfoot tub in front of a picture window, with the forest and mountains doing the decorating outside.",
    ],
    callout: "This is where you come to soak, slow down and disappear for a while.",
    badge: "Alpine is reserved for guests 21+",
    roomOrder: [
      "alpine-bathing-suite",
      "alpine-bathing-suite-den",
      "alpine-penthouse-bathing-suite",
    ],
  },
  walden: {
    iconPath: "/assets/icons/buildings/walden.svg",
    headline: "Deep in the Pines · Outdoor Soaks",
    paragraphs: [
      "Walden sits closer to the woods. Its ten cabin-style rooms trade Alpine's lodge-like romance for something quieter and more elemental: private decks, forest views and, in the bathing suites, cedar tubs made for soaking outside.",
    ],
    callout: "This is where the Cowboy gets a little wilder.",
    badge: "Walden is reserved for guests 21+",
    roomOrder: [
      "walden-king",
      "walden-forest-bathing-suite",
      "walden-forest-bathing-suite-den",
      "walden-sunrise-bathing-suite",
    ],
  },
  lodge: {
    iconPath: "/assets/icons/buildings/the_lodge.svg",
    headline: "STAY IN THE MIDDLE OF IT ALL.",
    paragraphs: [
      "The Lodge rooms sit directly above the restaurant, bar and fireside gathering spaces—the right choice for guests who want the Cowboy close at hand.",
      "Book one room or take over the floor with your people. Either way, you're never far from dinner, drinks or the fire.",
    ],
    roomOrder: [
      "lodge-king",
      "lodge-2-bedroom",
      "lodge-3-bedroom-suite",
      "lodge-penthouse-suite",
    ],
  },
  "forest-house": {
    iconPath: "/assets/icons/buildings/forest_haus.svg",
    headline: "Forest House is the quieter side of the Cowboy.",
    paragraphs: [
      "Tucked among the pines, these rooms carry more of the old Catskills spirit: warm, familiar and a little nostalgic, with just enough space to settle in without overthinking it.",
      "Downstairs, the Day Room and porch are there when you're ready for company.",
    ],
    roomOrder: ["forest-house-queen", "forest-house-king"],
  },
  cabin: {
    iconPath: "/assets/icons/buildings/cabin.svg",
    headline: "QUITE LITERALLY, YOUR CABIN IN THE WOODS.",
    paragraphs: [
      "Six hundred square feet. Your own porch. A copper clawfoot tub. A fireplace. Enough space to settle in and briefly consider never going home.",
      "The open-plan interior gives you a king bed, rain shower, leather loveseat and dining table, while the porch puts the Catskills just outside your door.",
    ],
    callout: "Coffee works out there. Cocktails work better.",
    badge: "Family-friendly · Dog-friendly",
    roomOrder: ["cabin"],
  },
  chalet: {
    iconPath: "/assets/icons/buildings/chalet.svg",
    headline: "THE MOUNTAIN-HOUSE FANTASY.",
    paragraphs: [
      "Our largest standalone suite leans into the property's Alpine past with wood-paneled cathedral ceilings, big picture windows and a private deck overlooking the landscape.",
      "Inside, there's a full kitchen, breakfast nook, fireplace and enough living space to spread out.",
      "Outside, a cedar soaking tub for two. Come for a weekend. Pretend it's yours.",
    ],
    badge: "Family-friendly · Dog-friendly",
    roomOrder: ["chalet"],
  },
  opas: {
    iconPath: "/assets/icons/buildings/opas_cabin.svg",
    headline: "OLD CATSKILLS, YOUR WAY.",
    paragraphs: [
      "Step inside a century-old cabin built for long weekends and people you actually like traveling with.",
      "Wood beams, a river-stone hearth and a vaulted living room set the pace downstairs. Four bedrooms give everyone somewhere to disappear upstairs.",
      "Cook together. Don't cook at all. Walk the trails. Sit by the fire.",
    ],
    callout: "There isn't much of a schedule here unless you bring one with you.",
    badge: "Sleeps up to 8 · Available as 2 or 4 bedrooms",
    roomOrder: ["opas-cabin-2-bedroom", "opas-cabin-4-bedroom"],
  },
  "slide-mountain": {
    iconPath: "/assets/icons/buildings/slide_mountain_haus.svg",
    headline: "THE EASYGOING WAY INTO THE CATSKILLS.",
    paragraphs: [
      "Set at the trailhead beneath Slide Mountain, these are some of our simplest rooms and our easiest way into Cowboy. Less fuss, fewer frills, and a little more room in the budget for whatever happens next.",
      "The trails start outside. Ralph's is across the street. The rest of Cowboy is just up the hill.",
    ],
    roomOrder: [
      "slide-mountain-haus-double-queen",
      "slide-mountain-haus-2-bedroom",
      "slide-mountain-haus-5-room",
    ],
  },
  "mountain-view": {
    iconPath: "/assets/icons/buildings/mountian_view_haus.svg",
    headline: "THE VIEW DOES MOST OF THE TALKING.",
    paragraphs: [
      "Perched on Panther Mountain, Mountain View Haus looks across the valley toward the Big Indian Wilderness. Inside, wood beams, a river-stone hearth and a full kitchen give you the familiar pleasure of a proper mountain house.",
      "Book two bedrooms or take all four.",
      "Then put something on the fire, pour a drink and let the week loosen its grip.",
    ],
    badge: "Available as 2 or 4 bedrooms · Sleeps up to 8",
    roomOrder: ["mountain-view-haus-2-bedroom", "mountain-view-haus-4-bedroom"],
  },
};

export function orderedRoomKeysForGroup(key: RoomTypeGroupKey): readonly string[] {
  return ROOM_TYPE_GROUP_PRESENTATION[key].roomOrder;
}
