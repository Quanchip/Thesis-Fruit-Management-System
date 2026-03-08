import { describe, expect, it } from "vitest";
import {
  buildAuthPayload,
  buildAuthUser,
  issueAuthTokens,
  rotateFromRefreshToken,
} from "../../src/services/tokenService.js";

describe("tokenService", () => {
  it("builds auth payload and user object", () => {
    const user = {
      user_id: 1,
      user_name: "john",
      email: "john@mail.com",
      role_id: 2,
    };

    expect(buildAuthPayload(user)).toEqual({
      user_id: 1,
      role_id: 2,
      user_name: "john",
    });

    expect(buildAuthUser(user)).toEqual({
      user_id: 1,
      user_name: "john",
      email: "john@mail.com",
      role_id: 2,
    });
  });

  it("issues access and refresh tokens", () => {
    const tokens = issueAuthTokens({
      user_id: 1,
      role_id: 2,
      user_name: "john",
    });

    expect(typeof tokens.access_token).toBe("string");
    expect(typeof tokens.refresh_token).toBe("string");
    expect(tokens.access_token.length).toBeGreaterThan(20);
    expect(tokens.refresh_token.length).toBeGreaterThan(20);
  });

  it("rotates tokens from a valid refresh token", () => {
    const original = issueAuthTokens({
      user_id: 1,
      role_id: 2,
      user_name: "john",
    });

    const rotated = rotateFromRefreshToken(original.refresh_token);
    expect(rotated).not.toBeNull();
    expect(typeof rotated.access_token).toBe("string");
    expect(typeof rotated.refresh_token).toBe("string");
  });

  it("returns null for invalid refresh token", () => {
    expect(rotateFromRefreshToken("invalid-token")).toBeNull();
  });
});
