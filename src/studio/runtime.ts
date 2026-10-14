/** Studio is route-scoped. Never infer demo mode from a public query parameter. */
export const isStudioRoute = () =>
  typeof window !== "undefined" && /^\\/booking\\/studio\\/?$/.test(window.location.pathname);

export type DemoScenario = "standard" | "soldout" | "family" | "dog" | "member" | "nonrefundable" | "error";
let selectedScenario: DemoScenario = "standard";
export const getDemoScenario = () => selectedScenario;
export const setDemoScenario = (value: DemoScenario) => { selectedScenario = value; };
