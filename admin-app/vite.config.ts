import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  // Share the booking engine's design system and controls. The `@/` alias in
  // those components resolves to the repository's src/ tree, not to admin-app.
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("../src", import.meta.url)),
    },
  },
  build: {
    // vinext's RSC transforms do not emit sourcemaps; asking for them produces
    // SOURCEMAP_BROKEN warnings on every build. The root browser build already
    // ships without sourcemaps, so keep the admin build consistent.
    sourcemap: false,
  },
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
