import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite';

// The browser build is a static multi-page Vite app. Webflow Cloud wraps the
// project in its own SSR build, so HTML entry points must only be registered
// for the normal client/static build.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    ...(!isSsrBuild && {
      rollupOptions: {
        input: {
          main: "index.html",
          dashboard: "dashboard.html",
          components: "components.html",
        },
      },
    }),
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
      },
    },
  },
}));
