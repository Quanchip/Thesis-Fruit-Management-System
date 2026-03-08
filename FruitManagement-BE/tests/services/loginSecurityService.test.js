import { describe, expect, it } from "vitest";
import {
  __resetLoginSecurityStore,
  clearLoginAttempts,
  getLoginLockStatus,
  recordFailedLoginAttempt,
} from "../../src/services/loginSecurityService.js";

describe("loginSecurityService", () => {
  it("locks account after repeated failed attempts", () => {
    const user = "john";
    const ip = "127.0.0.1";
    __resetLoginSecurityStore();

    for (let i = 0; i < 5; i += 1) {
      recordFailedLoginAttempt(user, ip);
    }

    const status = getLoginLockStatus(user, ip);
    expect(status.locked).toBe(true);
    expect(status.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("clears attempts after successful login", () => {
    const user = "john";
    const ip = "127.0.0.1";
    __resetLoginSecurityStore();
    recordFailedLoginAttempt(user, ip);
    clearLoginAttempts(user, ip);

    const status = getLoginLockStatus(user, ip);
    expect(status.locked).toBe(false);
  });
});
