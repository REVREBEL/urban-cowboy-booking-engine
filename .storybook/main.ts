// .storybook/main.ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../src/stories/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/stories/examples/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "!../src/stories/**/dist/**",
    "!../src/stories/**/build/**",
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
  ],
  framework: "@storybook/react-vite",
  // The MCP docs toolset needs a generated component manifest.
  features: {
    componentsManifest: true,
  },
  // Provide complete TS prop signatures to Docs/Controls and the MCP manifest.
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      // Keep inherited HTML/React props (e.g. disabled, onClick) visible
      // in Docs, Controls and the MCP component manifest.
      propFilter: () => true,
    },
  },
  async viteFinal(config) {
    // Match the application build: Tailwind v4 directives are processed by
    // @tailwindcss/vite before esbuild performs final CSS minification.
    config.build = { ...config.build, cssMinify: "esbuild" };
    return config;
  },
};

export default config;
