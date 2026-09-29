import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Le front est un build statique pur (→ dist/). Les appels Mews passent par les
// Pages Functions (functions/api/mews/*), servies par wrangler sur la même origine.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@/components/booking",
        replacement: fileURLToPath(new URL("./src/components/Booking", import.meta.url)),
      },
      {
        find: "@/components/ui/button",
        replacement: fileURLToPath(new URL("./src/evaluation/shims/button.tsx", import.meta.url)),
      },
      {
        find: "lucide-react",
        replacement: fileURLToPath(new URL("./src/evaluation/shims/lucide-react.tsx", import.meta.url)),
      },
      {
        find: "@tanstack/react-router",
        replacement: fileURLToPath(new URL("./src/evaluation/shims/tanstack-react-router.tsx", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    // Multi-page : le moteur de résa (index) + le back-office funnel (dashboard).
    rollupOptions: {
      input: {
        main: "index.html",
        dashboard: "dashboard.html",
        evaluation: "evaluation.html",
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    // En dev : Vite sert le front (HMR) et proxie /api/* vers le Worker lancé en
    // parallèle par `wrangler dev` sur le port 8787.
    // En prod (Cloudflare Workers) le Worker sert le front ET /api sur la même origine.
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
      },
    },
  },
});
