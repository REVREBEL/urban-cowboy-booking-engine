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
function attributeValue(attribute, source) {
  if (!attribute.initializer) return "";
  const init = attribute.initializer;
  if (ts.isStringLiteral(init)) return init.text;
  if (ts.isJsxExpression(init)) {
    const expr = init.expression;
    if (!expr) return "";
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text;
    return expr.getText(source);
  }
  return init.getText(source);
}
function controlNames(source) {
  const names = new Set(COMPONENTS);
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const spec = statement.moduleSpecifier;
    if (!ts.isStringLiteral(spec) || !CONTROL_IMPORT.test(spec.text)) continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const item of bindings.elements) {
      if (COMPONENTS.has(item.propertyName?.text ?? item.name.text)) names.add(item.name.text);
    }
  }
  return names;
}
export function violations(file, content) {
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const controls = controlNames(source);
  const findings = [];
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(source);
      if (controls.has(tag)) {
        const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
        for (const attribute of node.attributes.properties) {
          if (ts.isJsxSpreadAttribute(attribute)) {
            findings.push({ file, line, tag, kind: "spread", value: canonical(attribute.getText(source)) });
            continue;
          }
          const name = attribute.name.text;
          const value = attributeValue(attribute, source);
          if (name === "style") {
            findings.push({ file, line, tag, kind: "style", value: canonical(value) });
          }
          if (name === "className") {
            // Unknown expressions are rejected: they may inject presentation classes.
            if (/[{}$()?:+]/.test(value)) {
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
    ts.forEachChild(node, visit);
  }
  visit(source);
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
