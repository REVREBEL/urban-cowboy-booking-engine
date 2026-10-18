// .storybook/main.tsx
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
  async viteFinal(config) {
    // Match the application build: Tailwind v4 directives are processed by
    // @tailwindcss/vite before esbuild performs final CSS minification.
    config.build = { ...config.build, cssMinify: "esbuild" };
    return config;
  },
};

export default config;

