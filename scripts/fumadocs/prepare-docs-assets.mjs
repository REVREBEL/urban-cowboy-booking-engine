#!/usr/bin/env node
// Copy the root-relative icon/illustration assets used by documented components
// into the docs workspace so the static export publishes them under the base path.
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const assets = [
  "assets/icons/detailed/dog_friendly.svg",
  "assets/icons/badges/features/dog_friendly.svg",
  "assets/icons/ui/ui-arrow-up.svg",
  "assets/icons/ui/ui-arrow-down.svg",
  "assets/icons/ui/arrow-right.svg",
  "assets/icons/ui/left_hand_pointing.svg",
  "assets/labels/top_match.svg",
];
for (const directory of [
  "assets/icons/buildings",
  "assets/icons/icons-simple",
  "assets/illustrations/interaction/find-your-stay",
]) {
  for (const file of readdirSync(join(root, "public", directory))) {
    if (file.endsWith(".svg")) assets.push(`${directory}/${file}`);
  }
}
for (const asset of assets) {
  const target = join(root, "docs-app", "public", asset);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(join(root, "public", asset), target);
}
console.log(`prepared ${assets.length} docs icon assets`);
