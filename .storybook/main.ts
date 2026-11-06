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
  // TypeScript 7 no longer exports the classic compiler API required by
  // react-docgen-typescript. Use Storybook's supported Babel-based parser
  // until that plugin supports TS7. Keep the component manifest enabled.
  typescript: {
    reactDocgen: "react-docgen",
  },
  async viteFinal(config) {
    // Match the application build: Tailwind v4 directives are processed by
    // @tailwindcss/vite before esbuild performs final CSS minification.
    config.build = { ...config.build, cssMinify: "esbuild" };
    return config;
  },
};

export default config;
