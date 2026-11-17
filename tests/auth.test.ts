// Private-route gate: shared ADMIN_TOKEN only, with no dead role-list argument.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { requireAdmin } from "../worker/auth.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const request = (authorization?: string) =>
  new Request("https://example.com/api/recovery", {
    headers: authorization ? { authorization } : {},
  });

test("rejects when no ADMIN_TOKEN is bound, even with a token header", () => {
  const denied = requireAdmin(request("Bearer secret"), {});
  assert.equal(denied?.status, 401);
});

test("rejects a missing or incorrect token", () => {
  assert.equal(requireAdmin(request(), { ADMIN_TOKEN: "secret" })?.status, 401);
  assert.equal(requireAdmin(request("Bearer wrong"), { ADMIN_TOKEN: "secret" })?.status, 401);
});

test("accepts the shared token with or without the Bearer prefix", () => {
  assert.equal(requireAdmin(request("Bearer secret"), { ADMIN_TOKEN: "secret" }), null);
  assert.equal(requireAdmin(request("secret"), { ADMIN_TOKEN: "secret" }), null);
});

test("callers no longer pass a role list", () => {
  const auth = read("worker/auth.ts");
  assert.doesNotMatch(auth, /\ballowed\b/);
  assert.doesNotMatch(auth, /\bRole\b/);
  assert.doesNotMatch(auth, /includes\(["']admin["']\)/);
  for (const file of ["worker/d1-analytics.ts", "worker/d1-recovery.ts"]) {
    const source = read(file);
    assert.match(source, /requireAdmin\(ctx\.request, ctx\.env\)/);
    assert.doesNotMatch(source, /requireRole/);
  }
});
