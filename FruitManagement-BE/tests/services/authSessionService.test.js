import { describe, expect, it, vi } from "vitest";
import {
  findActiveRefreshToken,
  hashToken,
  revokeAllUserRefreshTokens,
  revokeRefreshToken,
  storeRefreshToken,
} from "../../src/services/authSessionService.js";
import { issueAuthTokens } from "../../src/services/tokenService.js";

describe("authSessionService", () => {
  it("hashes token deterministically", () => {
    const token = "abc";
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toBe(token);
  });

  it("stores refresh token with hash and expiry", async () => {
    const create = vi.fn(async (payload) => payload);
    const tokens = issueAuthTokens({
      user_id: 1,
      role_id: 2,
      user_name: "john",
    });

    const row = await storeRefreshToken({ create }, 1, tokens.refresh_token);
    expect(create).toHaveBeenCalledTimes(1);
    expect(row.user_id).toBe(1);
    expect(row.token_hash).toBe(hashToken(tokens.refresh_token));
    expect(row.expires_at instanceof Date).toBe(true);
  });

  it("finds active refresh token by hash", async () => {
    const findOne = vi.fn().mockResolvedValue({ refresh_token_id: 1 });
    const token = "some-token";
    await findActiveRefreshToken({ findOne }, token);

    expect(findOne).toHaveBeenCalledTimes(1);
    const where = findOne.mock.calls[0][0].where;
    expect(where.token_hash).toBe(hashToken(token));
    expect(where.is_revoked).toBe(false);
  });

  it("revokes one refresh token", async () => {
    const update = vi.fn().mockResolvedValue([1]);
    const affected = await revokeRefreshToken({ update }, "token");
    expect(affected).toBe(1);
  });

  it("revokes all tokens for a user", async () => {
    const update = vi.fn().mockResolvedValue([3]);
    const affected = await revokeAllUserRefreshTokens({ update }, 99);
    expect(affected).toBe(3);
  });
});
