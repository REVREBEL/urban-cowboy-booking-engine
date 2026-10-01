import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const SOURCE_ROOT = path.join(ROOT, "public/assets/icons");
const OUTPUT_ROOT = path.join(ROOT, "src/components/icons/generated");
const SVGR_VERSION = "8.1.0";

function relative(filePath) {
  return path.relative(ROOT, filePath) || ".";
}

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

if (!existsSync(SOURCE_ROOT)) {
  fail(`SVG source directory not found: ${relative(SOURCE_ROOT)}`);
}

// Safety guard: this script may delete OUTPUT_ROOT, so keep that target explicit.
const expectedOutput = path.join(ROOT, "src/components/icons/generated");
if (OUTPUT_ROOT !== expectedOutput) {
  fail("Refusing to clean an unexpected output directory.");
}

if (process.argv.includes("--clean")) {
  rmSync(OUTPUT_ROOT, { recursive: true, force: true });
  console.log(`🧹 Removed ${relative(OUTPUT_ROOT)}`);
  process.exit(0);
}

console.log(`🎨 SVG source: ${relative(SOURCE_ROOT)}`);
console.log(`⚛️  React output: ${relative(OUTPUT_ROOT)}`);
console.log("Source SVG filenames and files are never modified.");

rmSync(OUTPUT_ROOT, { recursive: true, force: true });
mkdirSync(OUTPUT_ROOT, { recursive: true });

const args = [
  "--yes",
  `@svgr/cli@${SVGR_VERSION}`,
  "--out-dir",
  OUTPUT_ROOT,
  "--typescript",
  "--ext",
  "tsx",
  "--filename-case",
  "pascal",
  "--icon",
  "--jsx-runtime",
  "automatic",
  "--no-prettier",
  "--no-svgo",
  "--replace-attr-values",
  "#000=currentColor",
  "--replace-attr-values",
  "#000000=currentColor",
  "--replace-attr-values",
  "black=currentColor",
  "--",
  SOURCE_ROOT,
];

const result = spawnSync("npx", args, {
  cwd: ROOT,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  fail(`SVGR could not start: ${result.error.message}`);
}

if (result.status !== 0) {
  fail(`SVGR exited with status ${result.status ?? "unknown"}`);
}

console.log("");
console.log("✅ React icon components generated.");
console.log("   Example:");
console.log(
  '   import { MarshallSpeaker, HeatedFloors } from "@/components/icons/generated/amenities/simple";',
);
