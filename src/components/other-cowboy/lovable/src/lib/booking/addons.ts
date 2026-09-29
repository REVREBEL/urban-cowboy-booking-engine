export type AddonUnit = "stay" | "night";

export type Addon = {
  id: string;
  name: string;
  blurb: string;
  price: number;
  unit: AddonUnit;
};

export const ADDONS: Addon[] = [
  {
    id: "firewood",
    name: "Firewood bundle",
    blurb: "Split hardwood and kindling, stacked by your door.",
    price: 35,
    unit: "stay",
  },
  {
    id: "breakfast",
    name: "Breakfast basket",
    blurb: "Pastries, fruit and coffee left out each morning.",
    price: 32,
    unit: "night",
  },
  {
    id: "bath-ritual",
    name: "Bathing ritual kit",
    blurb: "Mineral soak, cedar oil and two thick robes.",
    price: 48,
    unit: "stay",
  },
  {
    id: "dog-kit",
    name: "Good dog kit",
    blurb: "Bed, bowls, towel and a treat from the bar.",
    price: 40,
    unit: "stay",
  },
  {
    id: "late-checkout",
    name: "Late checkout",
    blurb: "Stay until 2pm on your last day.",
    price: 55,
    unit: "stay",
  },
];

export function addonTotal(addon: Addon, nights: number) {
  return addon.unit === "night" ? addon.price * Math.max(nights, 1) : addon.price;
}
