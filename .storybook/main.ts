// .storybook/main.ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../src/stories/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/stories/examples/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "!../src/stories/**/dist/**",
    "!../src/stories/**/build/**",
  ],
  // Storybook must serve the same public icon URLs as the application.
  staticDirs: ["../public"],
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
  // Temporary historical Storybook gate (COW-70): TypeScript 7 removed
  // ts.sys.fileExists, which the react-docgen-typescript Vite plugin requires.
  // Use the Babel/AST-based react-docgen parser until Fumadocs completely
  // replaces the historical Storybook runtime. Keep TypeScript 7 for the app.
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
