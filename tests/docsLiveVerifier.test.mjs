// COW-85 M4: the live verifier must fail when a promised check cannot run.
import assert from "node:assert/strict";
import test from "node:test";
import {
  brokenImages,
  checkFinalUrl,
  recordCheck,
  requireControl,
} from "../scripts/fumadocs/live-check-core.mjs";

test("recordCheck records a failure and returns a result object", () => {
  const failures = [];
  assert.deepEqual(recordCheck(failures, "images", false, "broken"), { ok: false, detail: "broken" });
  assert.deepEqual(failures, ["images: broken"]);
  assert.deepEqual(recordCheck(failures, "images", true, "missing marker"), { ok: true, detail: "ok" });
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

test("final URL checks reject foreign hosts, path changes and HTTPS downgrades", () => {
  const path = "/urban-cowboy-booking-engine/components/search-bar/";
  assert.equal(
    checkFinalUrl(`https://revrebel.github.io${path}`, path).ok, true,
  );
  assert.equal(
    checkFinalUrl(`https://cowboy-components.revrebel.io${path}`, path).ok, true,
  );
  assert.match(
    checkFinalUrl(`https://evil.example${path}`, path).detail, /unexpected host/,
  );
  assert.match(
    checkFinalUrl(`https://revrebel.github.io/wrong`, path).detail, /path changed/,
  );
  assert.match(
    checkFinalUrl(`http://cowboy-components.revrebel.io${path}`, path).detail, /HTTPS downgrade/,
  );
  assert.equal(
    checkFinalUrl(`http://cowboy-components.revrebel.io${path}`, path, { requireHttps: false }).ok, true,
  );
});

test("a missing demo control is a failure, never a skipped check", () => {
  assert.deepEqual(requireControl(1, "rail toggle"), { ok: true, detail: "rail toggle present" });
  assert.deepEqual(requireControl(0, "rail toggle"), { ok: false, detail: "rail toggle control missing" });
});
