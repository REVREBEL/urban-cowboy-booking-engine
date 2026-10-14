/**
 * Photo-only journey navigation state. The original Lovable route keeps the
 * Journal profile as in-route state; retain it across canonical step mounts.
 * No credentials, payment data, or guest contact details live here.
 */
import type { MatchProfile } from "./data";

export type PhotoPath = "journal" | "rooms";
let activeProfile: MatchProfile | null = null;

export function getPhotoProfile(): MatchProfile | null {
  return activeProfile;
}
export function savePhotoProfile(value: MatchProfile | null) {
  activeProfile = value;
}
export function resetPhotoJourney() {
  activeProfile = null;
}
export function setPhotoPath(path: PhotoPath) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("photoPath", path);
  window.history.replaceState(null, "", url);
}
