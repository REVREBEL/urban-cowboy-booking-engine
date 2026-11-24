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
      // Non-secret identifiers from the deployed booking Worker. Overridable at
      // build time; committed defaults keep preview deploys fail-closed but usable.
      CF_ACCESS_TEAM_DOMAIN: bindings.text(
        process.env.CF_ACCESS_TEAM_DOMAIN ?? "revrebel.cloudflareaccess.com",
      ),
      // AUD of the Access application protecting urban-cowboy-admin.workers.dev
      // (the booking Worker has a different application/AUD).
      CF_ACCESS_AUD: bindings.text(
        process.env.CF_ACCESS_AUD ??
          "4bf8d1515fc028e57532548fc1687b5750d68f534a7d0cee0c1542cdf99a3255",
      ),
      ADMIN_EMAILS: bindings.text(process.env.ADMIN_EMAILS ?? "gary@revrebel.io"),
      ADMIN_GROUPS: bindings.text(process.env.ADMIN_GROUPS ?? ""),
      TENANT_ID: bindings.text(process.env.TENANT_ID ?? "urban-cowboy"),
      API_BASE_URL: bindings.text(
        process.env.API_BASE_URL ??
          "https://urban-cowboy-booking-engine.revrebel.workers.dev",
      ),
    },
  }),
});
