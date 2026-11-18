// COW-37 session token caching contract.
import assert from "node:assert/strict";
import test from "node:test";
import { createSessionTokenProvider, type TokenSession } from "../src/dashboard/sessionToken.ts";

const future = () => Math.floor(Date.now() / 1000) + 3600;

test("caches a live token until its expiry approaches", async () => {
  let calls = 0;
  const session: TokenSession = { access_token: "jwt-1", expires_at: future() };
  const provider = createSessionTokenProvider(async () => {
    calls += 1;
    return session;
  });

  assert.equal(await provider.getToken(), "jwt-1");
  assert.equal(await provider.getToken(), "jwt-1");
  assert.equal(calls, 1);
});

test("refreshes an expired token and clears on auth change", async () => {
  let token = "jwt-expired";
  let calls = 0;
  const provider = createSessionTokenProvider(async () => {
    calls += 1;
    return { access_token: token, expires_at: Math.floor(Date.now() / 1000) + 10 };
  });

  assert.equal(await provider.getToken(), "jwt-expired");
  token = "jwt-fresh";
  assert.equal(await provider.getToken(), "jwt-fresh");
  assert.equal(calls, 2);

  provider.clear();
  assert.equal(await provider.getToken(), "jwt-fresh");
  assert.equal(calls, 3);
});

test("returns null without a session and does not cache it as a token", async () => {
  let calls = 0;
  const provider = createSessionTokenProvider(async () => {
    calls += 1;
    return null;
  });
  assert.equal(await provider.getToken(), null);
  assert.equal(await provider.getToken(), null);
  assert.equal(calls, 2);
});
