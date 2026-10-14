export interface BookingLocationCms {
  id: string;
  fullLocationName: string;
  productionLayout?: 'card' | 'photo';
  demoLayout?: 'card' | 'photo';
  enableDemoEngine?: boolean;
  city: string | null;
  state: string | null;
  privacyPolicyUrl: string | null;
  termsConditionsUrl: string | null;
  accessibilityUrl: string | null;
}

export type BookingLocationCmsMap = Record<string, BookingLocationCms>;
