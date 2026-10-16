export interface BookingLocationFeatureCms {
  iconUrl: string | null;
  headline: string;
  paragraph: string;
}

export interface BookingLocationCms {
  id: string;
  fullLocationName: string;
  productionLayout?: 'card' | 'photo';
  demoLayout?: 'card' | 'photo';
  enableDemoEngine?: boolean;
  featureSectionEnabled: boolean;
  features: BookingLocationFeatureCms[];
  city: string | null;
  state: string | null;
  privacyPolicyUrl: string | null;
  termsConditionsUrl: string | null;
  accessibilityUrl: string | null;
}

export type BookingLocationCmsMap = Record<string, BookingLocationCms>;
