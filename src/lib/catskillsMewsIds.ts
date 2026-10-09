export const CATSKILLS_MEWS_IDS = {
  configurationId: "4725ace3-6b93-439f-a549-b4bc00ae1d10",
  hotelId: "8bd38131-c371-4625-9c29-b10600705d34",
  ageCategories: {
    adult: "8f3ceb39-5c40-417a-b9a5-b106007064f8",
    child: "db093f0b-738e-4afe-9191-b106007065ff",
  },
  fees: {
    RESORT_FEE: "bdaf2c3a-baf7-41c6-aecb-b11e016a147e",
  },
  addOns: {
    DOG_INCLUSION: "c74edf03-043c-4217-adbd-b124016a55ae",
    FLOWER_BOUQUET: "d8009b60-0580-49e7-a5dd-b12401713848",
    HUMMUS_AND_CRUDITES: "d4e2bfdd-f01f-4177-b366-b12401712a25",
    LETS_EAT_CHOCOLATE_TRUFFLES: "41f8b399-a303-40ac-bbfc-b124016e6b85",
    WELCOME_WINE: "cad13cb9-752d-49e8-b5d3-b124016d3aa8",
  },
  rateGroups: {
    FLEXIBLE: "6f436522-b845-4535-b830-b106007064f7",
    TAX_EXEMPT: "1df99a61-6b0e-4f0d-84de-b1ca016aa113",
    PACKAGE: "5c4664c1-b4e8-46a6-9f09-b4ce00e3eaab",
    NON_REFUNDABLE: "071793d0-e989-43d1-bfb0-b132010cf1d5",
    DISCOUNTED_RATES: "0bbce96f-ce84-4fd5-b61e-b13201147843",
    PROMOTIONS: "349e8a80-f303-4bd6-a74c-b128017183df",
    COMPLIMENTARY_RATE: "5e26f524-be0d-4246-850f-b14600fc009b",
    GROUP_RATE: "41578126-aeda-42ec-9490-b1500123f991",
  },
} as const;

const SYSTEM_FEE_PRODUCT_IDS = new Set<string>(Object.values(CATSKILLS_MEWS_IDS.fees));

export type KnownRateGroupKey = keyof typeof CATSKILLS_MEWS_IDS.rateGroups;
export type KnownAddOnKey = keyof typeof CATSKILLS_MEWS_IDS.addOns;

const RATE_GROUP_BY_ID = new Map<string, KnownRateGroupKey>(
  Object.entries(CATSKILLS_MEWS_IDS.rateGroups).map(([key, id]) => [
    id,
    key as KnownRateGroupKey,
  ]),
);

const ADD_ON_BY_ID = new Map<string, KnownAddOnKey>(
  Object.entries(CATSKILLS_MEWS_IDS.addOns).map(([key, id]) => [
    id,
    key as KnownAddOnKey,
  ]),
);

export function isSystemFeeProductId(id: string): boolean {
  return SYSTEM_FEE_PRODUCT_IDS.has(id);
}

export function knownRateGroupKey(id: string): KnownRateGroupKey | null {
  return RATE_GROUP_BY_ID.get(id) ?? null;
}

export function knownAddOnKey(id: string): KnownAddOnKey | null {
  return ADD_ON_BY_ID.get(id) ?? null;
}
