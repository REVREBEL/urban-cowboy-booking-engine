// COW-70: the generated coverage matrix must map stories to real docs pages.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("inventory generation is deterministic and maps existing pages unambiguously", () => {
  const run = spawnSync(process.execPath, ["scripts/fumadocs/inventory-stories.mjs"], {
    cwd: new URL("..", import.meta.url), encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stderr);

  const first = read("docs/component-library/coverage-matrix.json");
  const again = spawnSync(process.execPath, ["scripts/fumadocs/inventory-stories.mjs"], {
    cwd: new URL("..", import.meta.url), encoding: "utf8",
  });
  assert.equal(again.status, 0, again.stderr);
  assert.equal(first, read("docs/component-library/coverage-matrix.json"));

  const matrix = JSON.parse(first);
  const byComponent = (name) => matrix.components.filter((entry) => entry.component === name);
  const preference = byComponent("PreferenceIconButton").find((entry) => entry.status === "documented");
  assert.ok(preference, "PreferenceIconButton story maps to its existing page");
  assert.equal(preference.docsPage, "docs-app/content/docs/components/preference-icon-button.mdx");
  for (const name of ["Pill", "Button", "Switch"]) {
    assert.ok(byComponent(name).some((entry) => entry.status === "documented"), `${name} documented`);
  }

  for (const entry of matrix.components) {
    if (entry.status === "documented") {
      assert.ok(existsSync(new URL(entry.docsPage, root)), `${entry.component} page exists: ${entry.docsPage}`);
    }
    if (entry.status === "excluded") assert.equal(entry.docsPage, null);
  }

  const planned = matrix.components
    .filter((entry) => entry.status === "planned")
    .map((entry) => entry.docsPage);
  assert.equal(new Set(planned).size, planned.length, "planned page paths are unique");
});
