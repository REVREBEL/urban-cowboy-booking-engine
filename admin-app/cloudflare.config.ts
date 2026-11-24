import { bindings, defineConfig, defineWorker } from "cf/config";

const ADMIN_ACCESS_AUD = "4bf8d1515fc028e57532548fc1687b5750d68f534a7d0cee0c1542cdf99a3255";

const textBinding = (name: string, fallback?: string) => {
  const value = process.env[name]?.trim() || fallback;
  return value === undefined ? undefined : bindings.text(value);
};

export default defineConfig({
  worker: defineWorker({
    name: "urban-cowboy-admin",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-23",
    compatibilityFlags: ["nodejs_compat", "global_fetch_strictly_public"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      // Deployed nonsecret defaults keep preview builds usable. The root deploy
      // wrapper pins the production values before uploading a version.
      CF_ACCESS_TEAM_DOMAIN: textBinding("CF_ACCESS_TEAM_DOMAIN", "revrebel.cloudflareaccess.com"),
      CF_ACCESS_AUD: textBinding("CF_ACCESS_AUD", ADMIN_ACCESS_AUD),
      ADMIN_EMAILS: textBinding("ADMIN_EMAILS", "gary@revrebel.io"),
      ADMIN_GROUPS: textBinding("ADMIN_GROUPS", ""),
      TENANT_ID: textBinding("TENANT_ID", "urban-cowboy"),
      // Server-only. The same-origin proxy forwards the verified assertion to
      // this origin, so the booking Worker must use the same Access AUD.
      API_BASE_URL: textBinding("API_BASE_URL"),
      API_REQUEST_TIMEOUT_MS: textBinding("API_REQUEST_TIMEOUT_MS"),
    },
  }),
});
