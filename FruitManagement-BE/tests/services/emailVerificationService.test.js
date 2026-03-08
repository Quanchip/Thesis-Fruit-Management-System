import { describe, expect, it, vi } from "vitest";
import {
  consumeEmailVerificationToken,
  createEmailVerificationToken,
} from "../../src/services/emailVerificationService.js";
import { hashToken } from "../../src/services/authSessionService.js";

describe("emailVerificationService", () => {
  it("creates verification token and stores hash", async () => {
    const create = vi.fn(async (payload) => payload);
    const token = await createEmailVerificationToken({ create }, 10);

    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0].token_hash).toBe(hashToken(token));
  });

  it("consumes valid verification token", async () => {
    const save = vi.fn(async () => true);
    const findOne = vi.fn().mockResolvedValue({
      user_id: 99,
      used_at: null,
      save,
    });

    const userId = await consumeEmailVerificationToken({ findOne }, "raw-token");
    expect(userId).toBe(99);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("returns null for invalid verification token", async () => {
    const findOne = vi.fn().mockResolvedValue(null);
    const userId = await consumeEmailVerificationToken({ findOne }, "invalid");
    expect(userId).toBeNull();
  });
});
