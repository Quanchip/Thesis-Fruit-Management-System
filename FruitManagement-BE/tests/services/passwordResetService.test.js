import { describe, expect, it, vi } from "vitest";
import {
  consumePasswordResetToken,
  createPasswordResetToken,
} from "../../src/services/passwordResetService.js";
import { hashToken } from "../../src/services/authSessionService.js";

describe("passwordResetService", () => {
  it("creates password reset token and stores hash", async () => {
    const create = vi.fn(async (payload) => payload);
    const raw = await createPasswordResetToken({ create }, 7);

    expect(typeof raw).toBe("string");
    expect(raw.length).toBeGreaterThan(20);
    expect(create).toHaveBeenCalledTimes(1);
    const payload = create.mock.calls[0][0];
    expect(payload.user_id).toBe(7);
    expect(payload.token_hash).toBe(hashToken(raw));
    expect(payload.expires_at instanceof Date).toBe(true);
  });

  it("returns null for invalid/expired reset token", async () => {
    const findOne = vi.fn().mockResolvedValue(null);
    const result = await consumePasswordResetToken({ findOne }, "invalid");
    expect(result).toBeNull();
  });

  it("consumes valid reset token and returns user id", async () => {
    const save = vi.fn(async () => true);
    const findOne = vi.fn().mockResolvedValue({
      user_id: 10,
      used_at: null,
      save,
    });

    const userId = await consumePasswordResetToken({ findOne }, "valid");
    expect(userId).toBe(10);
    expect(save).toHaveBeenCalledTimes(1);
  });
});
