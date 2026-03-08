import { responseData } from "../config/response.js";
import initModels from "../models/init-models.js";
import sequelize from "../models/connect.js";
import bcrypt from "bcrypt";
import {
  createCustomerUser,
  findExistingIdentity,
  normalizeSignupInput,
  resolveConflictMessage,
  validatePassword,
  validateSignupInput,
} from "../services/authService.js";
import {
  buildAuthPayload,
  buildAuthUser,
  getRefreshTokenClaims,
  issueAuthTokens,
  rotateFromRefreshToken,
} from "../services/tokenService.js";
import {
  findActiveRefreshToken,
  revokeAllUserRefreshTokens,
  revokeRefreshToken,
  storeRefreshToken,
} from "../services/authSessionService.js";
import { createPasswordResetToken, consumePasswordResetToken } from "../services/passwordResetService.js";
import {
  createEmailVerificationToken,
  consumeEmailVerificationToken,
} from "../services/emailVerificationService.js";
import {
  clearLoginAttempts,
  getLoginLockStatus,
  recordFailedLoginAttempt,
} from "../services/loginSecurityService.js";

let model = initModels(sequelize);
const requireVerifiedEmail = process.env.REQUIRE_EMAIL_VERIFIED === "true";
const exposeVerificationToken =
  process.env.EXPOSE_EMAIL_VERIFICATION_TOKEN === "true" ||
  process.env.NODE_ENV !== "production";

export const login = async (req, res) => {
  try {
    let { user_name, user_password } = req.body;
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";

    if (!user_name || !user_password) {
      return responseData(res, "user_name and user_password are required", "", 400);
    }

    const lockStatus = getLoginLockStatus(user_name, ip);
    if (lockStatus.locked) {
      return responseData(
        res,
        `Too many failed login attempts. Try again in ${lockStatus.retryAfterSeconds} seconds`,
        "",
        429
      );
    }

    const checkUser = await model.users.findOne({
      where: { user_name },
    });

    if (!checkUser) {
      recordFailedLoginAttempt(user_name, ip);
      return responseData(res, "User doesn't exist", "", 400);
    }

    if (requireVerifiedEmail && !checkUser.is_email_verified) {
      return responseData(res, "Email is not verified", "", 403);
    }

    const matched = await bcrypt.compare(user_password, checkUser.user_password);
    if (!matched) {
      recordFailedLoginAttempt(user_name, ip);
      return responseData(res, "Wrong password", "", 400);
    }
    clearLoginAttempts(user_name, ip);

    const authPayload = buildAuthPayload(checkUser);
    const tokens = issueAuthTokens(authPayload);
    await storeRefreshToken(model.auth_refresh_tokens, checkUser.user_id, tokens.refresh_token);
    responseData(
      res,
      "Login successfully",
      {
        user_id: checkUser.user_id,
        role_id: checkUser.role_id,
        user_name: checkUser.user_name,
        email: checkUser.email,
        user: buildAuthUser(checkUser),
        ...tokens,
      },
      200
    );
  } catch (error) {
    console.error(error);
    responseData(res, "An error occurred during login", "", 500);
  }
};

export const signup = async (req, res) => {
  try {
    const normalizedInput = normalizeSignupInput(req.body);
    const validationError = validateSignupInput(normalizedInput);

    if (validationError) {
      return responseData(res, validationError, "", 400);
    }

    const existingUser = await findExistingIdentity(model.users, normalizedInput);
    if (existingUser) {
      const conflictMessage = resolveConflictMessage(existingUser, normalizedInput);
      return responseData(res, conflictMessage, "", 409);
    }

    const newUser = await createCustomerUser(model.users, normalizedInput);

    const authPayload = buildAuthPayload(newUser);
    const tokens = issueAuthTokens(authPayload);
    await storeRefreshToken(model.auth_refresh_tokens, newUser.user_id, tokens.refresh_token);
    const verificationToken = await createEmailVerificationToken(
      model.email_verification_tokens,
      newUser.user_id
    );

    const content = {
      user_id: newUser.user_id,
      role_id: newUser.role_id,
      user_name: newUser.user_name,
      email: newUser.email,
      user: buildAuthUser(newUser),
      ...tokens,
    };
    if (exposeVerificationToken) {
      content.email_verification_token = verificationToken;
    }

    responseData(
      res,
      "Successfully sign up",
      content,
      201
    );
  } catch (error) {
    console.error(error);
    responseData(res, "Error", "", 500);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return responseData(res, "refresh_token is required", "", 400);
    }

    const activeToken = await findActiveRefreshToken(
      model.auth_refresh_tokens,
      refresh_token
    );
    if (!activeToken) {
      return responseData(res, "Invalid refresh token", "", 401);
    }

    const claims = getRefreshTokenClaims(refresh_token);
    if (!claims) {
      return responseData(res, "Invalid refresh token", "", 401);
    }

    const rotated = rotateFromRefreshToken(refresh_token);
    await revokeRefreshToken(model.auth_refresh_tokens, refresh_token);
    await storeRefreshToken(
      model.auth_refresh_tokens,
      claims.payload.user_id,
      rotated.refresh_token
    );

    responseData(res, "Refresh token successfully", rotated, 200);
  } catch (error) {
    console.error(error);
    responseData(res, "Error", "", 500);
  }
};

export const logout = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return responseData(res, "refresh_token is required", "", 400);
    }

    const affected = await revokeRefreshToken(model.auth_refresh_tokens, refresh_token);
    if (!affected) {
      return responseData(res, "Invalid refresh token", "", 401);
    }

    responseData(res, "Logout successfully", "", 200);
  } catch (error) {
    console.error(error);
    responseData(res, "Error", "", 500);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return responseData(res, "email is required", "", 400);
    }

    const user = await model.users.findOne({ where: { email } });

    if (!user) {
      return responseData(
        res,
        "If this email exists, a reset token has been generated",
        "",
        200
      );
    }

    await revokeAllUserRefreshTokens(model.auth_refresh_tokens, user.user_id);
    const reset_token = await createPasswordResetToken(
      model.password_reset_tokens,
      user.user_id
    );

    responseData(
      res,
      "If this email exists, a reset token has been generated",
      { reset_token },
      200
    );
  } catch (error) {
    console.error(error);
    responseData(res, "Error", "", 500);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { reset_token, new_password } = req.body;
    if (!reset_token || !new_password) {
      return responseData(res, "reset_token and new_password are required", "", 400);
    }

    if (!validatePassword(new_password)) {
      return responseData(
        res,
        "Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long",
        "",
        400
      );
    }

    const userId = await consumePasswordResetToken(
      model.password_reset_tokens,
      reset_token
    );
    if (!userId) {
      return responseData(res, "Invalid or expired reset token", "", 400);
    }

    const hashedPassword = bcrypt.hashSync(new_password, 10);
    await model.users.update(
      { user_password: hashedPassword },
      { where: { user_id: userId } }
    );

    await revokeAllUserRefreshTokens(model.auth_refresh_tokens, userId);
    responseData(res, "Password reset successfully", "", 200);
  } catch (error) {
    console.error(error);
    responseData(res, "Error", "", 500);
  }
};

export const requestEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return responseData(res, "email is required", "", 400);
    }

    const user = await model.users.findOne({ where: { email } });
    if (!user || user.is_email_verified) {
      return responseData(
        res,
        "If this email exists, a verification token has been generated",
        "",
        200
      );
    }

    const verificationToken = await createEmailVerificationToken(
      model.email_verification_tokens,
      user.user_id
    );

    const content = exposeVerificationToken
      ? { email_verification_token: verificationToken }
      : "";

    responseData(
      res,
      "If this email exists, a verification token has been generated",
      content,
      200
    );
  } catch (error) {
    console.error(error);
    responseData(res, "Error", "", 500);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { verification_token } = req.body;
    if (!verification_token) {
      return responseData(res, "verification_token is required", "", 400);
    }

    const userId = await consumeEmailVerificationToken(
      model.email_verification_tokens,
      verification_token
    );
    if (!userId) {
      return responseData(res, "Invalid or expired verification token", "", 400);
    }

    await model.users.update(
      { is_email_verified: true },
      { where: { user_id: userId } }
    );

    responseData(res, "Email verified successfully", "", 200);
  } catch (error) {
    console.error(error);
    responseData(res, "Error", "", 500);
  }
};
