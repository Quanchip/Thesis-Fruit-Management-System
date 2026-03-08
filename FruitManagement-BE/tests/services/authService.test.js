import { describe, expect, it, vi } from "vitest";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import {
  createCustomerUser,
  findExistingIdentity,
  normalizeSignupInput,
  resolveConflictMessage,
  validateSignupInput,
} from "../../src/services/authService.js";

describe("authService", () => {
  it("normalizes signup input", () => {
    const normalized = normalizeSignupInput({
      full_name: "  John Doe  ",
      user_name: "  johndoe  ",
      user_password: "Abcdef1!",
      phone: " 0901234567 ",
      email: "  John@Mail.Com ",
      bank_account: " Vietcombank-123 ",
    });

    expect(normalized).toEqual({
      full_name: "John Doe",
      user_name: "johndoe",
      user_password: "Abcdef1!",
      phone: "0901234567",
      email: "john@mail.com",
      bank_account: "Vietcombank-123",
      is_email_verified: false,
    });
  });

  it("normalizes signup input from common camelCase frontend fields", () => {
    const normalized = normalizeSignupInput({
      fullName: "  Jane Doe ",
      userName: " janedoe ",
      password: "Abcdef1!",
      phoneNumber: " 0901234567 ",
      email: " Jane@Mail.com ",
      bankAccount: " Vietcombank-123 ",
    });

    expect(normalized).toEqual({
      full_name: "Jane Doe",
      user_name: "janedoe",
      user_password: "Abcdef1!",
      phone: "0901234567",
      email: "jane@mail.com",
      bank_account: "Vietcombank-123",
      is_email_verified: false,
    });
  });

  it("validates a valid payload", () => {
    const error = validateSignupInput({
      full_name: "John Doe",
      user_name: "johndoe",
      user_password: "Abcdef1!",
      phone: "0901234567",
      email: "john@mail.com",
      bank_account: "Vietcombank-123456",
    });

    expect(error).toBeNull();
  });

  it("returns error for invalid email", () => {
    const error = validateSignupInput({
      full_name: "John Doe",
      user_name: "johndoe",
      user_password: "Abcdef1!",
      phone: "0901234567",
      email: "invalid-email",
      bank_account: "Vietcombank-123456",
    });

    expect(error).toBe("Invalid email address");
  });

  it("returns conflict message for username/email/phone", () => {
    expect(
      resolveConflictMessage(
        { user_name: "john", email: "x@mail.com", phone: "0901" },
        { user_name: "john", email: "y@mail.com", phone: "0902" }
      )
    ).toBe("Username already exists");

    expect(
      resolveConflictMessage(
        { user_name: "john", email: "x@mail.com", phone: "0901" },
        { user_name: "jane", email: "x@mail.com", phone: "0902" }
      )
    ).toBe("Email already exists");

    expect(
      resolveConflictMessage(
        { user_name: "john", email: "x@mail.com", phone: "0901" },
        { user_name: "jane", email: "y@mail.com", phone: "0901" }
      )
    ).toBe("Phone already exists");
  });

  it("queries existing identity by username/email/phone", async () => {
    const findOne = vi.fn().mockResolvedValue(null);
    await findExistingIdentity({ findOne }, {
      user_name: "john",
      email: "john@mail.com",
      phone: "0901234567",
    });

    expect(findOne).toHaveBeenCalledTimes(1);
    const arg = findOne.mock.calls[0][0];
    expect(arg.where[Op.or]).toEqual([
      { user_name: "john" },
      { email: "john@mail.com" },
      { phone: "0901234567" },
    ]);
  });

  it("creates user with hashed password", async () => {
    const create = vi.fn(async (payload) => ({ ...payload, user_id: 99 }));
    const user = await createCustomerUser(
      { create },
      {
        full_name: "John Doe",
        user_name: "john",
        user_password: "Abcdef1!",
        phone: "0901234567",
        email: "john@mail.com",
        bank_account: "Vietcombank-123456",
      }
    );

    expect(create).toHaveBeenCalledTimes(1);
    const payload = create.mock.calls[0][0];
    expect(payload.user_password).not.toBe("Abcdef1!");
    expect(bcrypt.compareSync("Abcdef1!", payload.user_password)).toBe(true);
    expect(user.user_id).toBe(99);
  });
});
