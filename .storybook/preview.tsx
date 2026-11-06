// .storybook/preview.tsx
/// <reference types="vite/client" />

import type { Preview } from "@storybook/react-vite";
import "../src/styles/index.css";

const preview: Preview = {
  decorators: [
    (Story, context) => context.parameters.layout === "centered"
      ? <Story />
      : (
          <div style={{ width: "100%", maxWidth: 1600, marginInline: "auto", boxSizing: "border-box" }}>
            <Story />
          </div>
        ),
  ],
  // The toolbar sets global examples without changing production booking state.
  globalTypes: {
    bookingParty: {
      description: "Example party used by stories that opt into this global",
      toolbar: {
        title: "Example party",
        icon: "user",
        dynamicTitle: true,
        items: [
          { value: "couple", title: "2 adults" },
          { value: "family", title: "2 adults + 2 children" },
          { value: "solo", title: "1 adult" },
        ],
      },
    },
  },
  initialGlobals: {
    bookingParty: "couple",
  },
  parameters: {
    layout: "fullscreen",
    github: {
      repository: "REVREBEL/urban-cowboy-booking-engine",
      branch: "main",
    },
    docs: {
      codePanel: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
