#!/usr/bin/env node
// Copy the root-relative icon/illustration assets used by documented components
// into the docs workspace so both the dev server and static export publish them.
import { copyFileSync, cpSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";

export function prepareDocsAssets(root = process.cwd()) {
  const assets = [
    "assets/icons/detailed/dog_friendly.svg",
    "assets/icons/badges/features/dog_friendly.svg",
    "assets/icons/ui/ui-arrow-up.svg",
    "assets/icons/ui/ui-arrow-down.svg",
    "assets/icons/ui/arrow-right.svg",
    "assets/icons/ui/left_hand_pointing.svg",
    "assets/brand/logos/Cowboy.svg",
    "assets/icons/badges/features/wifi_badge.svg",
    "assets/labels/top_match.svg",
    // Discovery signboard artwork used by the booking-details demo.
    "assets/decoration/backgrounds/background.png",
    "assets/decoration/backgrounds/backboard.png",
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
  // The imported typography CSS loads brand fonts from /fonts/... at runtime.
  cpSync(join(root, "public", "fonts"), join(root, "docs-app", "public", "fonts"), { recursive: true });
  console.log(`prepared ${assets.length} docs icon assets and brand fonts`);
  return assets.length;
}

if (process.argv[1]?.endsWith("prepare-docs-assets.mjs")) prepareDocsAssets();
