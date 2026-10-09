export type PreferenceArtworkId =
  "your_own_hideaway"
  "spaces_to_gather"
  "spaces_for_connection"
  "simple_comforts"
  "scenic_mountain_views"
  "minimal_distractions"
  "indoor_sancuaries.svg"
  "connection_with_nature";

type FeatureKind =
  | "kitchen"
  | "heating"
  | "water"
  | "room"
  | "bed"
  | "basic"
  | "building"
  | "badge";

type PreferenceId = PreferenceArtworkId;

const RAW =
  "./assets";

const asset = (path: string) => `${RAW}/${path}`;

export const BRAND = {
  wordmarkForest: asset("/brand/logos/logo-wordmark.svg"),
  wordmarkLinen: asset("/brand/logos/logo-light.svg"),
  logoLinen: asset("/brand/logos/logo-stacked.svg"),
  star: asset("/simple-logo/best-rate-dark.svg"),
  lodge: asset("icons/simple-logo/lodge.svg"),
  slide_mountain: asset("icons/simple-logo/slide_mountain_haus.svg"),
  ralphs: asset("icons/simple-logo/ralphs_bar_bowling.svg"),
  opas: asset("icons/simple-logo/opas_cabin.svg"),
  mountian_view: asset("icons/simple-logo/mountian_view_haus.svg"),
  forest: asset("icons/simple-logo/forest_haus.svg"),
  sauna: asset("icons/simple-logo/estonian_sauna.svg"),
  walden: asset("icons/simple-logo/walden.svg"),
  chalet: asset("icons/simple-logo/chalet.svg"),
  cabin: asset("icons/simple-logo/cabin.svg"),
  alpine: asset("icons/simple-logo/alpine.svg"),
};

export const PREFERENCE_ICON: Record<PreferenceId, string> = {
your_own_hideaway: asset("illustrations/interaction/find-your-stay/your_own_hideaway.svg"),
spaces_to_gather: asset("illustrations/interaction/find-your-stay/spaces_to_gather.svg"),
spaces_for_connection: asset("/illustrations/interaction/find-your-stay/spaces_for_connection.svg"),
simple_comforts: asset("illustrations/interaction/find-your-staycsimple_comforts.svg"),
scenic_mountain_views: asset("illustrations/interaction/find-your-stay/scenic_mountain_views.svg"),
minimal_distractions: asset("illustrations/interaction/find-your-stay/minimal_distractions.svg"),
indoor_sancuaries: asset("illustrations/interaction/find-your-stay/indoor_sancuaries.svg"),
connection_with_nature: asset("illustrations/interaction/find-your-staycconnection_with_nature.svg"),
};


export const BADGE_ICON = {
  adultsOnly: asset("icons/badges/simple-icons/adults-only-filled.svg"),
  wifi: asset("icons/badges/wifi_badge.svg"),
  dogFriendly: asset("icons/badges//dog_friendly.svg"),
};

export const INTERESTS = [];
