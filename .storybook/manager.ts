import { addons } from "storybook/manager-api";

// Set readable defaults without hiding Storybook controls, tools, or panels.
addons.setConfig({
  navSize: 300,
  bottomPanelHeight: 300,
  rightPanelWidth: 360,
  panelPosition: "bottom",
  enableShortcuts: true,
  showToolbar: true,
  sidebar: { showRoots: true },
});
