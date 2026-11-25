import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const exists = (path: string) => existsSync(new URL(path, root));

const rootPackage = JSON.parse(read("package.json")) as {
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  allowScripts: Record<string, boolean>;
};
const adminPackage = JSON.parse(read("admin-app/package.json")) as {
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

test("root package excludes retired Storybook and Chromatic tooling", () => {
  for (const name of ["storybook", "build-storybook", "test:storybook:runtime", "chromatic"]) {
    assert.equal(rootPackage.scripts[name], undefined, `${name} script remains`);
  }
  for (const group of [rootPackage.dependencies, rootPackage.devDependencies]) {
    for (const name of Object.keys(group)) {
      assert.doesNotMatch(name, /storybook|chromatic|vitest|testing-library/i, `${name} dependency remains`);
    }
  }
  assert.equal(rootPackage.allowScripts["addon-designs"], undefined);
  assert.ok(rootPackage.devDependencies.playwright);
  assert.ok(rootPackage.dependencies["@playwright/test"]);
  assert.ok(rootPackage.scripts["docs:build"]);
  assert.ok(rootPackage.scripts["docs:smoke"]);
});

test("Admin Portal keeps its operational commands without visual-tool dependencies", () => {
  for (const name of ["dev", "build", "start", "deploy", "typecheck"]) {
    assert.ok(adminPackage.scripts[name], `${name} script missing`);
  }
  for (const group of [adminPackage.dependencies, adminPackage.devDependencies]) {
    for (const name of Object.keys(group)) {
      assert.doesNotMatch(name, /storybook|chromatic|vitest|testing-library/i, `${name} dependency remains`);
    }
  }
  assert.ok(adminPackage.dependencies.vinext);
  assert.ok(adminPackage.dependencies["@vinext/cloudflare"]);
});

test("Vite, TypeScript and CI retain app checks without Storybook wiring", () => {
  const vite = read("vite.config.ts");
  assert.doesNotMatch(vite, /storybook|vitest/i);
  assert.match(vite, /plugins: \[tailwindcss\(\), react\(\)\]/);
  assert.match(vite, /components: "components\.html"/);

  const tsconfig = read("tsconfig.json");
  assert.doesNotMatch(tsconfig, /storybook|@stories/i);
  assert.match(tsconfig, /"include": \["src\/\*\*\/\*"\]/);

  const ci = read(".github/workflows/ci.yml");
  assert.doesNotMatch(ci, /storybook|chromatic/i);
  assert.match(ci, /npm run build/);
  assert.match(ci, /npm test/);
  assert.match(ci, /playwright install --with-deps chromium/);

  const docsWorkflow = read(".github/workflows/docs-pages.yml");
  assert.doesNotMatch(docsWorkflow, /storybook|chromatic|docs:inventory/i);
  assert.match(docsWorkflow, /npm run test:docs/);
  assert.match(docsWorkflow, /npm run docs:build/);
});

test("retired Storybook files and historical inventory artifacts are absent", () => {
  for (const path of [
    ".storybook",
    "src/stories",
    "scripts/check-storybook-runtime.mjs",
    "tests/storybookConfig.test.ts",
    "chromatic.config.json",
    ".storybook-deployer.json",
    "docs/storybook-layout.md",
    "src/styles/documentation-layout.ts",
    "vitest.shims.d.ts",
    "scripts/fumadocs/inventory-stories.mjs",
    "tests/fumadocsInventory.test.mjs",
    "docs/component-library/inventory.json",
    "docs/component-library/coverage-matrix.json",
  ]) {
    assert.equal(exists(path), false, `${path} remains`);
  }
  assert.doesNotMatch(read("docs-app/components/rates-stage3.story.tsx"), /storybook\/test/);
});

test("lockfile contains no Storybook or Chromatic packages", () => {
  const lock = read("package-lock.json");
  assert.doesNotMatch(lock, /"node_modules\/(?:@storybook\/|storybook\/|chromatic\/|@chromatic-com\/)/);
});
