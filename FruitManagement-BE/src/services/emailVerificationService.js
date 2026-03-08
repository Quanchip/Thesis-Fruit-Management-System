import crypto from "crypto";
import { Op } from "sequelize";
import { hashToken } from "./authSessionService.js";

const verificationExpiryMinutes = Number(
  process.env.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES || 60
);

export const createEmailVerificationToken = async (
  emailVerificationTokenModel,
  userId
) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + verificationExpiryMinutes * 60 * 1000);

  await emailVerificationTokenModel.create({
    user_id: userId,
    token_hash: hashToken(rawToken),
    expires_at: expiresAt,
    used_at: null,
  });

  return rawToken;
};

export const consumeEmailVerificationToken = async (
  emailVerificationTokenModel,
  rawToken
) => {
  const tokenRecord = await emailVerificationTokenModel.findOne({
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
