#!/usr/bin/env node
// Copy the small set of root-relative icon assets used by documented components
// into the docs workspace so the static export publishes them.
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const assets = [
  "assets/icons/detailed/dog_friendly.svg",
  "assets/icons/badges/features/dog_friendly.svg",
];
for (const file of readdirSync(join(root, "public", "assets", "icons", "buildings"))) {
  if (file.endsWith(".svg")) assets.push(`assets/icons/buildings/${file}`);
}
for (const asset of assets) {
  const target = join(root, "docs-app", "public", asset);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(join(root, "public", asset), target);
}
console.log(`prepared ${assets.length} docs icon assets`);
