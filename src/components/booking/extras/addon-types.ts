export type AddonDeliveryType = "waiting-in-room" | "scheduled-day" | "gift-surprise";

export interface AddonSchedulePreference {
  deliveryType?: AddonDeliveryType;
  selectedDate?: string;
  selectedDateIso?: string;
  selectedTime?: string;
  customTime?: string;
  isGift?: boolean;
  giftRecipient?: string;
  includeCard?: boolean;
  cardMessage?: string;
  itemCustomization?: string;
  dietaryNote?: string;
}

export interface AddonStayCriteria {
  checkIn: string;
  checkOut: string;
  nights: number;
}
