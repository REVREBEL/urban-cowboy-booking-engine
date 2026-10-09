export const BOOKING_FEATURES = {
  // Temporarily disabled for the client demo. Keep the Upgrade step implementation
  // intact so it can be restored without rebuilding the flow.
  roomUpgradeStep: false,
  // Catskills does not currently offer airport transfer. Keep the existing
  // service UI/state available for a future property or later rollout.
  airportTransfer: false,
} as const;
