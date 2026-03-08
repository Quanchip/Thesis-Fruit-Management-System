import crypto from "crypto";
import { Op } from "sequelize";
import { hashToken } from "./authSessionService.js";

const resetTokenExpiryMinutes = Number(
  process.env.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES || 15
);

export const createPasswordResetToken = async (passwordResetTokenModel, userId) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + resetTokenExpiryMinutes * 60 * 1000);

  await passwordResetTokenModel.create({
    user_id: userId,
    token_hash: hashToken(rawToken),
    expires_at: expiresAt,
    used_at: null,
  });

  return rawToken;
};

export const consumePasswordResetToken = async (
  passwordResetTokenModel,
  rawToken
) => {
  const tokenRecord = await passwordResetTokenModel.findOne({
    where: {
      token_hash: hashToken(rawToken),
      used_at: null,
      expires_at: {
        [Op.gt]: new Date(),
      },
    },
  });

  if (!tokenRecord) {
    return null;
  }

  tokenRecord.used_at = new Date();
  await tokenRecord.save();
  return tokenRecord.user_id;
};
