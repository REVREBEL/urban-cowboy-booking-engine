#!/usr/bin/env node
// Enforce shared Button/Pill presentation contracts without blocking legacy debt.
import { parse } from "@babel/parser";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const COMPONENTS = new Set(["Button", "Pill", "PillButton"]);
const CONTROL_IMPORT = /(?:^|\/)(?:Button|Pill)(?:\.[cm]?[jt]sx?)?$/;
const LAYOUT_CLASS = /^(?:w-full|w-auto|max-w-full|min-w-0|shrink-0|shrink|grow|grow-0|self-(?:auto|start|end|center|stretch|baseline)|justify-self-(?:auto|start|end|center|stretch)|order-(?:first|last|none|\d+)|col-span-\d+|row-span-\d+)$/;
const SOURCE_PATH = /^src\/(?!stories\/).+\.tsx$/;

function canonical(value) { return value.replace(/\s+/g, " ").trim(); }

export function violations(file, content) {
  let ast;
  try {
    ast = parse(content, { sourceType: "module", plugins: ["jsx", "typescript"] });
  } catch {
    return [];
  }
  const controls = new Set(COMPONENTS);
  for (const statement of ast.program.body) {
    if (statement.type === "ImportDeclaration" && CONTROL_IMPORT.test(statement.source.value)) {
      for (const spec of statement.specifiers) {
        if (spec.type === "ImportSpecifier") {
          const imported = spec.imported.type === "Identifier" ? spec.imported.name : spec.imported.value;
          if (COMPONENTS.has(imported)) {
            controls.add(spec.local.name);
          }
        }
      }
    }
  }

  const findings = [];
  function walk(node) {
    if (!node || typeof node !== "object") return;
    if (node.type === "JSXOpeningElement") {
      const tag = node.name.type === "JSXIdentifier" ? node.name.name : "";
      if (controls.has(tag)) {
        const line = node.loc?.start?.line ?? 1;
        for (const attr of node.attributes) {
          if (attr.type === "JSXSpreadAttribute") {
            const raw = content.slice(attr.start, attr.end);
            findings.push({ file, line, tag, kind: "spread", value: canonical(raw) });
            continue;
          }
          if (attr.type === "JSXAttribute" && attr.name.type === "JSXIdentifier") {
            const name = attr.name.name;
            if (name === "style") {
              const expr = attr.value?.type === "JSXExpressionContainer" ? attr.value.expression : attr.value;
              const raw = expr ? content.slice(expr.start, expr.end) : "";
              findings.push({ file, line, tag, kind: "style", value: canonical(raw) });
            }
            if (name === "className") {
              if (attr.value?.type === "StringLiteral") {
                const val = attr.value.value;
                for (const token of val.split(/\s+/).filter(Boolean)) {
                  if (!LAYOUT_CLASS.test(token)) findings.push({ file, line, tag, kind: "class", value: token });
                }
              } else if (attr.value?.type === "JSXExpressionContainer") {
                const expr = attr.value.expression;
                if (expr.type === "StringLiteral") {
                  for (const token of expr.value.split(/\s+/).filter(Boolean)) {
                    if (!LAYOUT_CLASS.test(token)) findings.push({ file, line, tag, kind: "class", value: token });
                  }
                } else {
                  const raw = content.slice(expr.start, expr.end);
                  findings.push({ file, line, tag, kind: "dynamic-class", value: canonical(raw) });
                }
              }
            }
          }
        }
      }
    }
    for (const key of Object.keys(node)) {
      if (key !== "loc" && key !== "start" && key !== "end") {
        const child = node[key];
        if (Array.isArray(child)) child.forEach(walk);
        else if (child && typeof child === "object") walk(child);
      }
    }
  }
  walk(ast);
  return findings;
}

function git(args) { return execFileSync("git", args, { encoding: "utf8", maxBuffer: 10_000_000 }); }
function baseRevision() {
  if (process.env.GITHUB_EVENT_NAME === "pull_request") return "origin/" + (process.env.GITHUB_BASE_REF || "main");
  if (process.env.GITHUB_EVENT_NAME === "push") return "HEAD^";
  try { git(["rev-parse", "--verify", "origin/main"]); return "origin/main"; }
  catch { return "HEAD^"; }
}
function priorSource(rev, file) {
  try { return git(["show", rev + ":" + file]); } catch { return ""; }
}
function fingerprint(finding) { return [finding.tag, finding.kind, finding.value].join("|"); }
function run() {
  const all = process.argv.includes("--all");
  const base = baseRevision();
  const paths = all
    ? git(["ls-files", "src"]).split("\n")
    : git(["diff", "--name-only", "--diff-filter=ACMR", base + "...HEAD", "--", "src"]).split("\n");
  const files = paths.filter(file => SOURCE_PATH.test(file) && existsSync(file));
  const added = [];
  for (const file of files) {
    const before = new Map();
    if (!all) for (const finding of violations(file, priorSource(base, file))) {
      const key = fingerprint(finding);
      before.set(key, (before.get(key) || 0) + 1);
    }
    for (const finding of violations(file, readFileSync(file, "utf8"))) {
      const key = fingerprint(finding);
      const remaining = before.get(key) || 0;
      if (remaining) { before.set(key, remaining - 1); continue; }
      added.push(finding);
    }
  }
  for (const f of added) console.error(f.file + ":" + f.line + " <" + f.tag + "> " + f.kind + ": " + f.value);
  if (added.length) {
    console.error("\n" + added.length + " new shared-control override(s). Use Button/Pill props; only approved layout classes are allowed.");
    process.exitCode = 1;
  } else {
    console.log("Control contract passed (" + files.length + " files, " + (all ? "full audit" : "no new overrides") + ").");
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) run();
