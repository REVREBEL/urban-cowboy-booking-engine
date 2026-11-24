import { bindings, defineConfig, defineWorker } from "cf/config";

const textBinding = (name: string) => {
  const value = process.env[name]?.trim();
  return value ? bindings.text(value) : undefined;
};

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
      CF_ACCESS_TEAM_DOMAIN: textBinding("CF_ACCESS_TEAM_DOMAIN"),
      CF_ACCESS_AUD: textBinding("CF_ACCESS_AUD"),
      ADMIN_EMAILS: textBinding("ADMIN_EMAILS"),
      ADMIN_GROUPS: textBinding("ADMIN_GROUPS"),
      TENANT_ID: textBinding("TENANT_ID"),
      API_BASE_URL: textBinding("API_BASE_URL"),
      API_REQUEST_TIMEOUT_MS: textBinding("API_REQUEST_TIMEOUT_MS"),
    },
  }),
});
