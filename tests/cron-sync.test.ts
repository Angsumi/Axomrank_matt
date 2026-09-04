import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isAuthorizedCronRequest } from "../lib/cron-auth";

describe("Cron Authorization Service", () => {
  it("allows all requests when CRON_SECRET is not set", () => {
    assert.equal(isAuthorizedCronRequest(null, undefined), true);
    assert.equal(isAuthorizedCronRequest("", undefined), true);
    assert.equal(isAuthorizedCronRequest("Bearer foo", undefined), true);
  });

  it("rejects unauthorized requests when CRON_SECRET is configured", () => {
    const secret = "super-secret-key";
    assert.equal(isAuthorizedCronRequest(null, secret), false);
    assert.equal(isAuthorizedCronRequest("", secret), false);
    assert.equal(isAuthorizedCronRequest("Bearer wrong-secret", secret), false);
    assert.equal(isAuthorizedCronRequest("wrong-secret", secret), false);
  });

  it("permits authorized requests when valid Bearer CRON_SECRET is supplied", () => {
    const secret = "super-secret-key";
    assert.equal(isAuthorizedCronRequest("Bearer super-secret-key", secret), true);
  });
});
