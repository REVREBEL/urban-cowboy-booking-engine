// Single source of truth for the approved Urban Cowboy D1 target.
// Used by both scripts/deploy-d1.mjs and scripts/migrate-d1.mjs so the
// production-account guard cannot drift between data and schema operations.
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

export const D1_TARGET = Object.freeze({
  dbName: "urban-cowboy-content",
  accountId: "4c154709ffe87621073f9ecfa86a57dd",
  databaseId: "0d09ca5a-74fe-4e83-a058-b8aa5fb21562",
});

/**
 * Read the shared .env and refuse to proceed unless it (and the shell) agree
 * with the approved REVREBEL account. Returns the API token and account ID to
 * pass to Wrangler; never puts the token into a Worker binding.
 */
export function assertApprovedTarget(envPath) {
  const fromFile = parseEnv(readFileSync(envPath, "utf8"));
  const accountId = fromFile.CLOUDFLARE_ACCOUNT_ID?.trim();
  if (accountId !== D1_TARGET.accountId) {
    throw new Error("Shared .env Cloudflare account does not own Urban Cowboy D1");
  }
  const shellAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (shellAccount && shellAccount !== D1_TARGET.accountId) {
    throw new Error("Shell CLOUDFLARE_ACCOUNT_ID conflicts with Urban Cowboy's account");
  }
  const token = (process.env.CLOUDFLARE_API_TOKEN || fromFile.CLOUDFLARE_API_TOKEN || "")
    .replace(/^Bearer\s+/i, "")
    .trim();
  if (!token) throw new Error("Missing Cloudflare API token for remote D1 access");
  return { accountId: D1_TARGET.accountId, token };
}
