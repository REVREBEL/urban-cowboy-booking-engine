import { Building, RoomType, RateOption, ExtraItem } from '../types';
import {
  ROOM_IMAGE_ASSETS,
  ROOM_IMAGE_PLACEHOLDERS,
  getRoomImagesByRoomId,
  getBuildingPlaceholderHero
} from './roomImagePlaceholders';

export {
  ROOM_IMAGE_ASSETS,
  ROOM_IMAGE_PLACEHOLDERS,
  getRoomImagesByRoomId,
  getBuildingPlaceholderHero
};

export const BUILDINGS: Building[] = [
  {
    id: 'alpine',
    number: 'BUILDING 01',
    name: 'ALPINE',
    tagline: 'Hillside Soaking Suites & Picture Windows',
    description: "Built into the hillside above the Lodge, Alpine is home to ten of The Cowboy's most iconic rooms. Every suite pairs a freestanding clawfoot tub in front of a picture window, with the forest and mountains doing the decorating outside.",
    ethos: 'THIS IS WHERE YOU COME TO SOAK, SLOW DOWN AND DISAPPEAR FOR A WHILE.',
    badge: '✦ ALPINE IS RESERVED FOR GUESTS 21+',
    heroImage: ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE,
    roomIds: ['alpine-bathing-suite', 'alpine-bathing-suite-den', 'alpine-penthouse']
  },
  {
    id: 'walden',
    number: 'BUILDING 02',
    name: 'WALDEN',
    tagline: 'Deep in the Pines with Outdoor Cedar Tubs',
    description: "Walden sits closer to the woods. Its ten cabin-style rooms trade Alpine's lodge-like romance for something quieter and more elemental: private decks, forest views and, in the bathing suites, cedar tubs made for soaking outside.",
    ethos: 'THIS IS WHERE THE COWBOY GETS A LITTLE WILDER. DEEP IN THE PINES →',
    heroImage: ROOM_IMAGE_ASSETS.WALDEN_FOREST_BATHING_SUITE,
    roomIds: ['walden-king', 'walden-forest-bathing', 'walden-forest-den', 'walden-sunrise-bathing']
  },
  {
    id: 'lodge',
    number: 'BUILDING 03',
    name: 'THE LODGE',
    tagline: 'Historic Timber, Stone Hearths & Gathering Spaces',
    description: "The beating heart of Urban Cowboy Catskills. An authentic 1800s timber frame building where the dining parlor, evening whiskey bar, and wood-burning stoves live below, while grand vaulted soaking lofts nestle quietly above.",
    ethos: 'ARRIVE AS STRANGERS. LEAVE AS FRIENDS.',
    badge: 'COMMUNAL HEARTH & EASY DINING ACCESS',
    heroImage: ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_LIVING_ROOM,
    roomIds: ['lodge-penthouse', 'lodge-three-bedroom', 'lodge-king']
  }
];

export const ROOMS: RoomType[] = [
  {
    id: 'alpine-bathing-suite-den',
    buildingId: 'alpine',
    buildingName: 'Alpine Haus',
    name: 'Alpine Bathing Suite with Den',
    eyebrow: 'A LITTLE MORE ROOM TO DISAPPEAR.',
    tagline: 'Hand-hammered copper soaking tub and built-in chaise den by the fire',
    description: "There's only one like this. Stretch out in the built-in chaise den by the fire, or climb into the copper clawfoot tub and take in one of Alpine's best mountain views. It's part bathing suite, part hideaway, and exactly the kind of room that makes leaving for dinner feel optional.",
    longDescription: "The ultimate private Catskill retreat. With a moodier, dark timber palette, this suite features a hand-hammered double-slipper copper soaking tub and an integrated alcove daybed for deep reading and afternoon naps. When dusk falls, warm lantern light washes over the exposed hand-hewn logs and the mountain breeze fills the room.",
    basePrice: 245,
    squareFeet: 520,
    bedType: 'King Bed + Built-in Chaise Den',
    maxGuests: 2,
    isDogFriendly: true,
    ageRestricted21: true,
    soakType: 'copper-den',
    soakHighlight: 'Panoramic Mountain & Forest Vista',
    images: [
      ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD,
      ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE,
      ROOM_IMAGE_ASSETS.ALPINE_PENTHOUSE_COPPER_TUB
    ],
    features: [
      'Copper Clawfoot Soaking Tub',
      'Walk-in Rain Shower',
      'Built-in Reading Chaise Den',
      'Panoramic Mountain & Forest Vista',
      'Marshall Bluetooth Sound System',
      'Cast Iron Wood Stove',
      'Pendleton Robes & Blankets',
    ],
    tags: ['21+', 'Dog-friendly', 'Copper Tub', 'Chaise Den']
  },
  {
    id: 'alpine-penthouse',
    buildingId: 'alpine',
    buildingName: 'Alpine Haus',
    name: 'Alpine Penthouse Bathing Suite',
    eyebrow: 'UP WHERE THE ROOFTOPS MEET THE MOUNTAIN.',
    tagline: 'Cathedral ceilings, private balcony, copper tub and crackling fireplace',
    description: "Tucked beneath the eaves at the top of Alpine, these are the building's biggest and most playful suites—dormered ceilings, exposed beams, unexpected angles and a balcony made for two. There's a copper clawfoot tub, naturally. And a fireplace for everything that comes after.",
    longDescription: "Reigning over the crest of Alpine, the Penthouse commands an unobstructed panoramic view across the valley canopy. Vaulted cathedral ceilings soar overhead with rough-sawn pine rafters. Soak in the copper clawfoot tub warmed by the glow of an authentic gas fireplace, then step onto your private cedar balcony for stargazing under crystal mountain skies.",
    basePrice: 320,
    squareFeet: 680,
    bedType: '1 King',
    maxGuests: 2,
    isDogFriendly: false,
    ageRestricted21: true,
    soakType: 'copper-tub-fireplace',
    soakHighlight: 'Private High-Valley Cedar Balcony',
    images: [
      ROOM_IMAGE_ASSETS.ALPINE_PENTHOUSE_COPPER_TUB,
      ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD,
      ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE
    ],
    features: [
      'Copper Clawfoot Soaking Tub',
      'Walk-in Rain Shower',
      'Private High-Valley Cedar Balcony',
      'River Stone Hearth Fireplace',
      'Dramatic Cathedral Timber Ceilings',
      'Pendleton Robes & Blankets'
    ],
    tags: ['21+', 'Dog-friendly', 'Fireplace', 'Balcony', 'Penthouse']
  },
  {
    id: 'alpine-bathing-suite',
    buildingId: 'alpine',
    buildingName: 'Alpine Haus',
    name: 'Alpine Bathing Suite',
    eyebrow: 'THE ICONIC SOAK.',
    tagline: 'Clawfoot tub by the window overlooking the changing woods',
    description: 'out into the woods. Fill the tub. Put on a robe. Watch the mountain change with the light. Dinner can wait a minute. Signature details include a king bed, cast-iron stove, private deck, heated bathroom floors, hand-printed wallpaper and walk-in shower.',
    longDescription: 'Perched along the tree line, the Alpine Bathing Suite is designed around the ritual of soaking. A deep cast-iron clawfoot tub sits squarely before a floor-to-ceiling glass panel looking into the Catskill birch and hemlocks. Features custom Pendleton wool accents, a King custom mattress, rain shower, and curated vinyl turntable with vintage records.',
    basePrice: 195,
    squareFeet: 420,
    bedType: '1 King',
    maxGuests: 2,
    isDogFriendly: false,
    ageRestricted21: true,
    soakType: 'clawfoot-window',
    soakHighlight: 'Private Deck',
    images: [
      ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE,
      ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD,
      ROOM_IMAGE_ASSETS.ALPINE_PENTHOUSE_COPPER_TUB
    ],
    features: [
      'Copper Clawfoot Soaking Tub',
      'Walk-in Rain Shower',
      'Cast Iron Wood Stove',
      'Private Deck',
      'Marshall Bluetooth Sound System',
      'Pendleton Robes & Blankets'
    ],
    tags: ['21+', 'Dog-friendly', 'Clawfoot Tub', 'Cast-iron Stove']
  },
  {
    id: 'walden-forest-bathing',
    buildingId: 'walden',
    buildingName: 'Walden Haus',
    name: 'Walden Forest Bathing Suite',
    eyebrow: 'FOR MORNING PEOPLE. AND PEOPLE WHO MIGHT BECOME MORNING PEOPLE.',
    tagline: 'Hand-built cedar soaking tub on private deck with sunrise diamond window',
    description: 'Some of the best sunrise views on the property belong to this room. Watch the first light arrive through the diamond-shaped window or, better yet, from the cedar soaking tub on your private porch. Two leather loungers inside give you somewhere to do very little afterward.',
    longDescription: 'The quintessential Walden experience. Walden Forest Bathing Suite dissolves the border between indoor luxury and wild nature. Your private outdoor cedar deck houses a custom round cedar soaking tub, constantly steaming in the crisp mountain air. Complete with an open-air seasonal outdoor shower, plush terry robes, and woodland seclusion.',
    basePrice: 265,
    squareFeet: 460,
    bedType: '1 King',
    maxGuests: 2,
    isDogFriendly: false,
    ageRestricted21: true,
    soakType: 'outdoor-cedar-tub',
    soakHighlight: 'Esopus Creek Access',
    images: [
      ROOM_IMAGE_ASSETS.WALDEN_FOREST_BATHING_SUITE,
      ROOM_IMAGE_ASSETS.WALDEN_SUNRISE_BATHING_SUITE,
      ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE
    ],
    features: [
      'Outdoor Cedar Soaking Tub',
      'Letter-Writing Desk',
      'Private Deck or Porch',
      'Leather Loungers',
      'Cast Iron Wood Stove',
      'Radiant Heated Floors',
      'Pendleton Robes & Blankets',
      'Esopus Creek Access',
    ],
    tags: ['21+', 'Dog-friendly', 'Outdoor Cedar Tub', 'Sunrise Views']
  },
  {
    id: 'walden-king',
    buildingId: 'walden',
    buildingName: 'Walden Haus',
    name: 'Walden King',
    eyebrow: 'YOUR CABIN-ERA BEGINS HERE',
    tagline: 'Simple, warm, tucked into the woods with private morning deck',
    description: "Simple, warm and tucked into the woods, the Walden King is for guests who want the forest outside and just enough Cowboy inside. Take your coffee to the deck. Write something at the desk. Wander off for the day. Or don't.",
    longDescription: "Rooted deeply in the hemlocks, Walden King captures the contemplative spirit of Henry David Thoreau with a rugged, tactile Cowboy finish. Step out with freshly brewed Chemex onto your secluded forest porch. Inside, reclaimed timber walls, a custom writing desk, and artisanal ironwork create a warm, grounding haven.",
    basePrice: 175,
    squareFeet: 360,
    bedType: '1 King',
    maxGuests: 2,
    isDogFriendly: false,
    ageRestricted21: true,
    soakType: 'clawfoot-window',
    soakHighlight: 'Esopus Creek Access',
    images: [
      ROOM_IMAGE_ASSETS.WALDEN_SUNRISE_BATHING_SUITE,
      ROOM_IMAGE_ASSETS.WALDEN_FOREST_BATHING_SUITE,
      ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD
    ],
    features: [
      'Outdoor Cedar Soaking Tub',
      'Letter-Writing Desk',
      'Private Deck or Porch',
      'Leather Loungers',
      'Cast Iron Wood Stove',
      'Radiant Heated Floors',       
      'Pendleton Robes & Blankets',
      'Esopus Creek Access'
    ],
    tags: ['21+', 'Dog-friendly', 'Cabin Retreat', 'Writing Desk']
  },
  {
    id: 'lodge-penthouse',
    buildingId: 'lodge',
    buildingName: 'The Lodge',
    name: 'Lodge Penthouse',
    eyebrow: 'THE HONEYMOON SUITE. OFFICIALLY UNOFFICIAL.',
    tagline: 'Handcrafted exposed branch headboard, copper clawfoot tub, private deck and wet bar',
    description: "The biggest single room in the Lodge gives you a bedroom, living room, private deck and some of the property's most dramatic views. The handcrafted black-willow headboard turns the bedroom into its own little forest. The copper clawfoot tub makes a strong argument for staying there. Your private living room and wet bar handle the rest.",
    longDescription: "Spanning the crown of The Lodge, this is the romantic pinnacle of Urban Cowboy. Exposed 19th-century pine joists frame a king bed anchored by a wild sculpted black-willow headboard. Step through french doors to your private sunset deck, or draw a warm bath in the double copper tub with a cocktail poured from your wet bar.",
    basePrice: 345,
    squareFeet: 720,
    bedType: '1 King',
    maxGuests: 2,
    isDogFriendly: true,
    ageRestricted21: false,
    soakType: 'copper-tub-fireplace',
    soakHighlight: 'Seperate Living Room',
    images: [
      ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_BEDROOM,
      ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_LIVING_ROOM,
      ROOM_IMAGE_ASSETS.ALPINE_PENTHOUSE_COPPER_TUB
    ],
    features: [
      'Copper Clawfoot Soaking Tub',  
      'Walk-in Rain Shower',  
      'Handcrafted Branch Headboard',
      'Architectural Diamond Window',
      'Wrap-Around Porch',
      'Separate Living Room',
      'Cast Iron Wood Stove',
      'Pendleton Robes & Blankets'
    ],
    tags: ['Family-friendly', 'Dog-friendly', 'Wet Bar', 'Penthouse']
  },
  {
    id: 'lodge-three-bedroom',
    buildingId: 'lodge',
    buildingName: 'The Lodge',
    name: 'Lodge Three-Bedroom Suite',
    eyebrow: 'BRING YOUR PEOPLE.',
    tagline: 'Three bedrooms, generous shared living parlor, stone fireplace and deck',
    description: "Three bedrooms plus a generous shared living space make this one for families, old friends and celebrations that deserve more than adjoining hotel rooms. You've got a fireplace, wet bar, deck and plenty of room to gather. And when everyone needs a little distance, that's what the bedrooms are for.",
    longDescription: "The ultimate gathering retreat. Take over an entire wing of The Lodge with three separate private bedrooms joined by an authentic timber parlor. Gather around the stone hearth for board games, pour drinks at the wet bar, or sit on the wraparound veranda taking in the mountain breeze.",
    basePrice: 580,
    squareFeet: 1100,
    bedType: '3 Kings',
    maxGuests: 6,
    isDogFriendly: true,
    ageRestricted21: false,
    soakType: 'clawfoot-window',
    soakHighlight: 'In-suite Wet Bar & Lounge',
    images: [
      ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_LIVING_ROOM,
      ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_BEDROOM,
      ROOM_IMAGE_ASSETS.ALPINE_HEADBOARD
    ],
    features: [
      'Copper Clawfoot Soaking Tub',
      'Walk-in Rain Shower',
      'Three Independent Private King Bedrooms',
      'River Stone Hearth Fireplace',
      'In-suite Wet Bar & Lounge',
      'Private Wraparound Cedar Deck',
      'Pendleton Robes & Blankets'
    ],
    tags: ['Family-friendly', 'Dog-friendly', 'Three Bedrooms', 'Fireplace', 'Gathering']
  },
  {
    id: 'lodge-king',
    buildingId: 'lodge',
    buildingName: 'The Lodge',
    name: 'Lodge King',
    eyebrow: 'THE EASIEST WAY INTO LODGE LIFE.',
    tagline: 'Comfortable King room directly above the dining parlor and evening fire',
    description: "A comfortable King room directly above the heart of the Cowboy. Dinner downstairs. Drinks around the corner. The sauna and trails just beyond the front door. When you want the action close and your room simple, this is your spot.",
    longDescription: "Positioned directly on the second floor of the historic Lodge, this room puts you steps away from the buzz of the dining parlor and evening cocktails while providing a quiet timber sanctuary with heated bathroom floors, rainfall shower, and custom Pendleton wool blankets.",
    basePrice: 165,
    squareFeet: 340,
    bedType: '1 King',
    maxGuests: 2,
    isDogFriendly: true,
    ageRestricted21: false,
    soakType: 'clawfoot-window',
    soakHighlight: 'Private Balcony for Two',
    images: [
      ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_BEDROOM,
      ROOM_IMAGE_ASSETS.LODGE_PENTHOUSE_LIVING_ROOM,
      ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE
    ],
    features: [
      'Copper Clawfoot Soaking Tub',
      'Walk-in Rain Shower',
      'Private Balcony for Two',
      'Pendleton Robes & Blankets'
    ],
    tags: ['Family-friendly', 'Dog-friendly', 'King Bed']
  }
];

export const RATE_OPTIONS: RateOption[] = [
  {
    id: 'ride-easy',
    title: 'RIDE EASY',
    subtitle: 'Keep Your Options Open.',
    eyebrow: 'BEST FLEXIBLE RATE',
    tagline: 'Keep Your Options Open.',
    description: 'Our standard rate for guests who want a little more freedom around their plans.',
    badge: 'THE COWBOY BEST RATE GUARANTEE',
    badgeIcon: '★',
    cancellationPolicy: 'Free Cancellation until 7 days prior to arrival',
    rateMultiplier: 1.0,
    theme: {
      cardBg: '#FFFFFF',
      border: '4px solid #343833',
      headlineColor: '#343833',
      eyebrowColor: '#D65241',
      bodyColor: '#343833',
      ctaBg: 'transparent',
      ctaText: '#343833',
      ctaBorder: '3px solid #343833'
    },
    inclusions: [
      'Full flexibility with 7-day cancellation window',
      'Pay upon arrival with zero lock-in deposit',
      'Complimentary access to property trails & cedar sauna',
      'Nightly campfire gathering & s\'mores'
    ]
  },
  {
    id: 'sunup',
    title: 'SUNUP BEFORE THE TRAIL',
    subtitle: 'Start Slow. Eat Well.',
    eyebrow: 'ROOM + BREAKFAST',
    description: 'Start the day slowly with your room and breakfast wrapped into one easy stay.',
    cancellationPolicy: 'Free Cancellation until 7 days prior to arrival',
    rateMultiplier: 1.14,
    isBreakfastIncluded: true,
    theme: {
      cardBg: '#EBE8E0',
      border: '4px solid #9A5636',
      headlineColor: '#9A5636',
      eyebrowColor: '#69253A',
      bodyColor: '#9A5636',
      ctaBg: '#9A5636',
      ctaText: '#EBE8E0',
      ctaBorder: '3px solid #9A5636'
    },
    inclusions: [
      'Daily farm-to-table breakfast for two at The Dining Parlor',
      'Pour-over craft coffee, house sourdough, and fresh eggs',
      'Complimentary trail snack pack for afternoon hikes',
      'Free cancellation up to 7 days before check-in'
    ]
  },
  {
    id: 'plan-ahead',
    title: 'plan ahead. save a little.',
    subtitle: 'Book Early & Save',
    eyebrow: 'COMMIT TO THE COWBOY',
    description: "Know when you're coming? Book ahead and enjoy a better rate for making the call early.",
    cancellationPolicy: 'Full Prepay. Non-Refundable.',
    isNonRefundable: true,
    rateMultiplier: 0.86,
    theme: {
      cardBg: '#F2F2F2',
      border: '4px solid #343833',
      headlineColor: '#000000',
      eyebrowColor: '#73716D',
      bodyColor: '#343833',
      ctaBg: '#343833',
      ctaText: '#F9F9F9',
      ctaBorder: '3px solid #343833'
    },
    inclusions: [
      'Guaranteed lowest non-member rate (save ~14%)',
      'Locked-in dates for high-demand mountain weekends',
      'Welcome draught cider upon arrival',
      'Immediate reservation confirmation'
    ]
  },
  {
    id: 'stay-while',
    title: 'STAY A WHILE & UNCLINCH',
    subtitle: 'Extended Mountain Immersion',
    eyebrow: 'STAY 4+ NIGHTS',
    description: 'Slip away Sunday through Thursday for slower mornings, quieter trails, and a better reason to stay out a little longer..',
    cancellationPolicy: 'Free Cancellation until 14 days prior',
    rateMultiplier: 0.80,
    minNights: 4,
    theme: {
      cardBg: '#343833',
      border: '4px solid #343833',
      headlineColor: '#FFFFFF',
      eyebrowColor: '#EBE8E0',
      bodyColor: '#EBE8E0',
      ctaBg: '#EBE8E0',
      ctaText: '#343833',
      ctaBorder: '3px solid #EBE8E0'
    },
    inclusions: [
      'Best value extended stay discount (save 20%)',
      '$75 credit toward the Dining Parlor or Bar',
      'One complimentary private 90-minute sauna session',
      'Mid-stay bath botanical refresh'
    ]
  },
  {
    id: 'member',
    title: 'WELCOME TO THE OUTFIT.',
    subtitle: 'The Cowboy Inner Circle',
    eyebrow: 'MEMBER RATE',
    tagline: 'book direct & save',
    description: 'Share your email and unlock our direct-only member rate from your very first stay.',
    cancellationPolicy: 'Free Cancellation until 5 days prior to arrival',
    rateMultiplier: 0.90,
    theme: {
      cardBg: '#0E301A',
      border: '4px solid #0E301A',
      headlineColor: '#F2AAA9',
      eyebrowColor: '#EBE8E0',
      bodyColor: '#EBE8E0',
      ctaBg: '#F2AAA9',
      ctaText: '#0E301A',
      ctaBorder: '3px solid #F2AAA9',
      footerCallout: 'A BETTER RATE, STRAIGHT FROM COWBOY.'
    },
    inclusions: [
      'Exclusive 10% direct-only member rate discount',
      'Complimentary early check-in (2pm) & late check-out (12pm) when available',
      'A bespoke welcome drink poured at the Lodge Bar',
      'Zero booking or third-party reservation fees'
    ]
  }
];

export const EXTRAS: ExtraItem[] = [
  {
    id: 'sauna-session',
    title: 'Private Estonian Sauna & Cold Plunge',
    subtitle: '90-minute wood-fired thermal ritual',
    description: 'Exclusive private session in our barrel sauna nestled beside Esopus Creek, paired with cedar cold plunge tubs and herbal steams.',
    price: 75,
    perPerson: false,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    category: 'wellness'
  },
  {
    id: 'smores-bourbon',
    title: 'Fireside S\'mores & Hudson Bourbon Flight',
    subtitle: 'Evening fireside kit for two',
    description: 'Handcrafted vanilla bean marshmallows, dark sea-salt chocolate, graham biscuits, and two 2oz pours of local Catskill Distilling whiskey.',
    price: 48,
    perPerson: false,
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80',
    category: 'dining'
  },
  {
    id: 'bath-soak-pack',
    title: 'Wild Pine & Cedar Bath Botanical Soak Kit',
    subtitle: 'In-room tub ritual package',
    description: 'Organic Dead Sea bath salts infused with pine needle, sweet orange, dried juniper berries, and handmade cedar soap for your soaking tub.',
    price: 35,
    perPerson: false,
    image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=600&q=80',
    category: 'wellness'
  },
  {
    id: 'dog-welcome-kit',
    title: 'Cowboy Pup Hospitality Pack',
    subtitle: 'For your trail companion',
    description: 'Handmade leather leash, organic bacon trail treats, stainless field bowl, and a memory foam dog bed prepared in your suite.',
    price: 65,
    perPerson: false,
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    category: 'pets'
  }
];
