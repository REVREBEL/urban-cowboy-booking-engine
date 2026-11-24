import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "urban-cowboy-admin",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-23",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      API_BASE_URL: bindings.text("https://urban-cowboy-booking-engine.revrebel.workers.dev"),
      TENANT_ID: bindings.text("urban-cowboy"),
      CF_ACCESS_TEAM_DOMAIN: bindings.text("revrebel.cloudflareaccess.com"),
      CF_ACCESS_AUD: bindings.text("4bf8d1515fc028e57532548fc1687b5750d68f534a7d0cee0c1542cdf99a3255"),
      ADMIN_EMAILS: bindings.text("gary@revrebel.io"),
    },
  }),
});
