import bcrypt from "bcrypt";
import { Op } from "sequelize";

export const passwordRegex =
  /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}/;
const phoneRegex = /^\d{9,10}$/;
const emailRegex = /^\S+@\S+\.\S+$/;
const bankAccountRegex = /^[a-zA-Z\s]+-\d+$/;

export const normalizeSignupInput = (payload) => ({
  full_name: (payload.full_name ?? payload.fullName)?.trim(),
  user_name: (payload.user_name ?? payload.userName ?? payload.username)?.trim(),
  user_password:
    payload.user_password ?? payload.userPassword ?? payload.password,
  phone: (payload.phone ?? payload.phoneNumber)?.trim(),
  email: payload.email?.trim().toLowerCase(),
  bank_account: (payload.bank_account ?? payload.bankAccount)?.trim(),
  is_email_verified: Boolean(
    payload.is_email_verified ?? payload.isEmailVerified ?? false
  ),
});

export const validateSignupInput = (payload) => {
  const { full_name, user_name, user_password, phone, email, bank_account } =
    payload;

  if (!full_name || !user_name || !user_password || !phone || !email) {
    return "full_name, user_name, user_password, phone, email are required";
  }

  if (bank_account && !bankAccountRegex.test(bank_account)) {
    return "Invalid bank account format";
  }

  if (!passwordRegex.test(user_password)) {
    return "Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long";
  }

  if (!phoneRegex.test(phone)) {
    return "Invalid phone number format";
  }

  if (!emailRegex.test(email)) {
    return "Invalid email address";
  }

  return null;
};

export const validatePassword = (password) => passwordRegex.test(password);

export const findExistingIdentity = async (usersModel, payload) => {
  const { user_name, email, phone } = payload;

  return usersModel.findOne({
    where: {
      [Op.or]: [{ user_name }, { email }, { phone }],
    },
  });
};

export const resolveConflictMessage = (existingUser, payload) => {
  if (existingUser.user_name === payload.user_name) {
    return "Username already exists";
  }
  if (existingUser.email === payload.email) {
    return "Email already exists";
  }
  return "Phone already exists";
};

export const createCustomerUser = async (usersModel, payload) => {
  const hashedPassword = bcrypt.hashSync(payload.user_password, 10);

  return usersModel.create({
    full_name: payload.full_name,
    user_name: payload.user_name,
    user_password: hashedPassword,
    phone: payload.phone,
    email: payload.email,
    bank_account: payload.bank_account || null,
    role_id: 2,
    is_email_verified: Boolean(payload.is_email_verified),
  });
};
