// COW-85 M4: the live verifier must fail when a promised check cannot run.
import assert from "node:assert/strict";
import test from "node:test";
import { brokenImages, recordCheck, requireControl } from "../scripts/fumadocs/live-check-core.mjs";

test("recordCheck records a failure and returns a result object", () => {
  const failures = [];
  assert.deepEqual(recordCheck(failures, "images", false, "broken"), { ok: false, detail: "broken" });
  assert.deepEqual(failures, ["images: broken"]);
  assert.deepEqual(recordCheck(failures, "images", true, "ok"), { ok: true, detail: "ok" });
  assert.equal(failures.length, 1);
});

test("an image with no natural width is reported even without a 404", () => {
  assert.deepEqual(
    brokenImages([
      { src: "/assets/ok.png", ok: true },
      { src: "/assets/empty.png", ok: false },
      { ok: false },
    ]),
    ["/assets/empty.png", "(no src)"],
  );
  assert.deepEqual(brokenImages([{ src: "/assets/ok.png", ok: true }]), []);
});

test("a missing demo control is a failure, never a skipped check", () => {
  assert.deepEqual(requireControl(1, "rail toggle"), { ok: true, detail: "rail toggle present" });
  assert.deepEqual(requireControl(0, "rail toggle"), { ok: false, detail: "rail toggle control missing" });
});
