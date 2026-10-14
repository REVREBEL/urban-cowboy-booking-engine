/** Studio is route-scoped. Never infer demo mode from public query parameters. */
export const isStudioRoute = () =>
  typeof window !== "undefined" &&
  (window.location.pathname === "/booking/studio" || window.location.pathname === "/booking/studio/");

export type DemoScenario = "standard" | "soldout" | "family" | "dog" | "member" | "nonrefundable" | "error";
let selectedScenario: DemoScenario = "standard";
export const getDemoScenario = () => selectedScenario;
export const setDemoScenario = (value: DemoScenario) => { selectedScenario = value; };
