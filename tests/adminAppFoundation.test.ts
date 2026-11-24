// COW-90: the standalone Cloudflare Next.js (vinext) admin foundation.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { BOOKING_API_ORIGIN, getAdminRuntimeConfig } from "../admin-app/lib/env.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const json = (path: string) => JSON.parse(read(path)) as Record<string, unknown>;
const withEnv = <T>(key: string, value: string | undefined, run: () => T): T => {
  const previous = process.env[key];
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
  try {
    return run();
  } finally {
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  }
};

test("admin app is an npm workspace with delegation scripts", () => {
  const rootPkg = json("package.json");
  const workspaces = rootPkg.workspaces as string[];
  const scripts = rootPkg.scripts as Record<string, string>;
  assert.ok(workspaces.includes("admin-app"));
  for (const script of ["admin:dev", "admin:build", "admin:typecheck"]) {
    assert.match(scripts[script], /-w admin-app/);
  }
  assert.equal(scripts["admin:deploy"], "node scripts/deploy-admin.mjs");
  assert.equal(scripts["admin:deploy:check"], "node scripts/deploy-admin.mjs --check");
});

test("admin app dependencies are pinned, not floating on latest", () => {
  const pkg = json("admin-app/package.json");
  for (const group of ["dependencies", "devDependencies"]) {
    const deps = pkg[group] as Record<string, string>;
    assert.ok(deps && Object.keys(deps).length > 0, `${group} is populated`);
    for (const [name, version] of Object.entries(deps)) {
      assert.notEqual(version, "latest", `${name} must be pinned`);
    }
  }
  assert.equal(pkg.type, "module");
  assert.equal(pkg.private, true);
});

test("admin runtime config fails closed on malformed environment", () => {
  withEnv("API_BASE_URL", undefined, () => {
    withEnv("API_REQUEST_TIMEOUT_MS", undefined, () => {
      assert.deepEqual(getAdminRuntimeConfig(), {
        apiBaseUrl: "",
        requestTimeoutMs: 8_000,
      });
    });
  });

  withEnv("API_BASE_URL", `${BOOKING_API_ORIGIN}///`, () => {
    assert.equal(getAdminRuntimeConfig().apiBaseUrl, BOOKING_API_ORIGIN);
  });

  assert.throws(
    () => withEnv("API_BASE_URL", "api.example.com", () => getAdminRuntimeConfig()),
    /absolute http\(s\) origin/,
  );
  for (const invalid of [
    `https://user:pass@${new URL(BOOKING_API_ORIGIN).host}`,
    `${BOOKING_API_ORIGIN}/v1`,
    `${BOOKING_API_ORIGIN}?tenant=x`,
    `${BOOKING_API_ORIGIN}/#fragment`,
    "ftp://api.example.com",
    "https://unrelated.example",
  ]) {
    assert.throws(
      () => withEnv("API_BASE_URL", invalid, () => getAdminRuntimeConfig()),
      undefined,
      `${invalid} must be rejected`,
    );
  }
  assert.throws(
    () => withEnv("API_REQUEST_TIMEOUT_MS", "5", () => getAdminRuntimeConfig()),
    /between 1000 and 60000/,
  );
});

test("Cloudflare worker config stays cache-free and keeps proxy ahead of assets", () => {
  const config = read("admin-app/cloudflare.config.ts");
  assert.match(config, /name: "urban-cowboy-admin"/);
  assert.match(config, /compatibilityFlags: \["nodejs_compat"\]/);
  assert.match(config, /runWorkerFirst: \["\/\*", "!\/_next\/static\/\*", "!\/\*\/_next\/static\/\*"\]/);
  for (const name of [
    "CF_ACCESS_TEAM_DOMAIN",
    "CF_ACCESS_AUD",
    "ADMIN_EMAILS",
    "ADMIN_GROUPS",
    "TENANT_ID",
    "API_BASE_URL",
    "API_REQUEST_TIMEOUT_MS",
  ]) {
    assert.match(config, new RegExp(`${name}: textBinding\\("${name}"`), `${name} is a deployable text binding`);
  }
  assert.doesNotMatch(config, /bindings\.secret\(/);
  const deploy = read("scripts/deploy-admin.mjs");
  assert.ok(deploy.includes(`trustedBookingApiOrigin = "${BOOKING_API_ORIGIN}"`));
  assert.match(deploy, /expectedAdminAud = "[a-f0-9]{64}"/);
});

test("admin route group owns error, loading and not-found boundaries", () => {
  for (const file of ["layout.tsx", "page.tsx", "loading.tsx", "error.tsx", "not-found.tsx"]) {
    assert.ok(read(`admin-app/app/(admin)/${file}`).length > 0, `${file} exists`);
  }
  assert.match(read("admin-app/app/(admin)/error.tsx"), /"use client"/);
  assert.match(read("admin-app/proxy.ts"), /no-store, private/);
  assert.match(read("admin-app/app/api/health/route.ts"), /no-store, private/);
});

test("admin app reuses the shared design system instead of a second token set", () => {
  assert.match(read("admin-app/app/globals.css"), /@import "\.\.\/\.\.\/src\/styles\/index\.css"/);
  assert.match(read("admin-app/app/globals.css"), /@source "\.\.\/\.\.\/src"/);
  assert.match(read("admin-app/vite.config.ts"), /new URL\("\.\.\/src", import\.meta\.url\)/);
  const paths = (json("admin-app/tsconfig.json").compilerOptions as {
    paths: Record<string, string[]>;
  }).paths;
  assert.deepEqual(paths, { "@/*": ["../src/*"] });
});
