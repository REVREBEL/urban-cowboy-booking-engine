#!/usr/bin/env node
// Enforce shared Button/Pill presentation contracts without blocking legacy debt.
import { parse } from "@babel/parser";
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

function attributeValue(attribute, content) {
  if (!attribute.value) return { value: "", dynamic: false };
  const init = attribute.value;
  if (init.type === "StringLiteral") return { value: init.value, dynamic: false };
  if (init.type === "JSXExpressionContainer") {
    const expr = init.expression;
    if (!expr || expr.type === "JSXEmptyExpression") return { value: "", dynamic: false };
    if (expr.type === "StringLiteral") return { value: expr.value, dynamic: false };
    if (expr.type === "TemplateLiteral" && expr.quasis.length === 1) return { value: expr.quasis[0].value.raw, dynamic: false };
    return { value: content.slice(expr.start, expr.end), dynamic: true };
  }
  return { value: content.slice(init.start, init.end), dynamic: false };
}

function controlNames(ast) {
  const names = new Set(COMPONENTS);
  for (const statement of ast.program.body) {
    if (statement.type !== "ImportDeclaration") continue;
    const spec = statement.source;
    if (spec.type !== "StringLiteral" || !CONTROL_IMPORT.test(spec.value)) continue;
    for (const specifier of statement.specifiers) {
      if (specifier.type === "ImportSpecifier") {
        const imported = specifier.imported.type === "Identifier" ? specifier.imported.name : specifier.imported.value;
        if (COMPONENTS.has(imported)) names.add(specifier.local.name);
      }
    }
  }
  return names;
}

export function violations(file, content) {
  if (!content) return [];
  let ast;
  try {
    ast = parse(content, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
      errorRecovery: true,
    });
  } catch {
    return [];
  }
  const controls = controlNames(ast);
  const findings = [];

  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (node.type === "JSXOpeningElement") {
      const tag = node.name.type === "JSXIdentifier" ? node.name.name : "";
      if (controls.has(tag)) {
        const line = node.loc ? node.loc.start.line : 1;
        for (const attribute of node.attributes) {
          if (attribute.type === "JSXSpreadAttribute") {
            findings.push({ file, line, tag, kind: "spread", value: canonical(content.slice(attribute.start, attribute.end)) });
            continue;
          }
          if (attribute.type !== "JSXAttribute" || !attribute.name) continue;
          const name = attribute.name.name;
          const { value, dynamic } = attributeValue(attribute, content);
          if (name === "style") {
            findings.push({ file, line, tag, kind: "style", value: canonical(value) });
          }
          if (name === "className") {
            // Unknown expressions are rejected: they may inject presentation classes.
            if (dynamic || /[{}$()?:+]/.test(value)) {
              findings.push({ file, line, tag, kind: "dynamic-class", value: canonical(value) });
            } else {
              for (const token of value.split(/\s+/).filter(Boolean)) {
                if (!LAYOUT_CLASS.test(token)) findings.push({ file, line, tag, kind: "class", value: token });
              }
            }
          }
        }
      }
    }
    for (const key of Object.keys(node)) {
      if (key === "loc" || key === "start" || key === "end") continue;
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) visit(item);
      } else if (child && typeof child === "object") {
        visit(child);
      }
    }
  }

  visit(ast);
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
