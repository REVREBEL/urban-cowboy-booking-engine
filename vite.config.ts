import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";

// The browser build is a static multi-page Vite app. Webflow Cloud wraps the
// project in its own SSR build, so HTML entry points must only be registered
// for the normal client/static build.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // Tailwind v4 custom at-rules can reach Vite 8 Lightning CSS minification.
    // Keep Tailwind compilation in @tailwindcss/vite and use esbuild for final CSS minification.
    cssMinify: "esbuild",
    outDir: "dist",
    sourcemap: false,
    ...(!isSsrBuild && {
      rollupOptions: {
        input: {
          main: "index.html",
          dashboard: "dashboard.html",
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
