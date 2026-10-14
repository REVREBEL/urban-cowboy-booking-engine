export type RoomResultsLayout = "card" | "photo";
let studioDefault: RoomResultsLayout = "card";
export function setStudioDefaultLayout(value: RoomResultsLayout) {
  studioDefault = value;
  window.dispatchEvent(new Event("studio-room-layout-change"));
}
export function currentStudioLayout(): RoomResultsLayout {
  const choice = new URLSearchParams(window.location.search).get("roomLayout");
  return choice === "card" || choice === "photo" ? choice : studioDefault;
}
