import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetSignupRateLimiter,
  signupRateLimit,
} from "../../src/middlewares/authRateLimit.js";

const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return res;
};

describe("signupRateLimit", () => {
  beforeEach(() => {
    __resetSignupRateLimiter();
  });

  it("allows requests within the rate limit", () => {
    const req = { ip: "127.0.0.1", headers: {} };
    const next = vi.fn();

    for (let i = 0; i < 5; i += 1) {
      const res = createMockRes();
      signupRateLimit(req, res, next);
      expect(res.statusCode).toBe(200);
    }

    expect(next).toHaveBeenCalledTimes(5);
  });

  it("blocks requests over the rate limit", () => {
    const req = { ip: "127.0.0.1", headers: {} };
    const next = vi.fn();

    for (let i = 0; i < 5; i += 1) {
      signupRateLimit(req, createMockRes(), next);
    }

    const blockedRes = createMockRes();
    signupRateLimit(req, blockedRes, next);

    expect(blockedRes.statusCode).toBe(429);
    expect(blockedRes.body.message).toBe(
      "Too many signup attempts. Please try again later."
    );
    expect(next).toHaveBeenCalledTimes(5);
  });
});
