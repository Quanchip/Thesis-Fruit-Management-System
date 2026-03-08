import crypto from "crypto";
import { Op } from "sequelize";
import { getRefreshTokenClaims } from "./tokenService.js";

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const storeRefreshToken = async (refreshTokenModel, userId, refreshToken) => {
  const claims = getRefreshTokenClaims(refreshToken);
  if (!claims || !claims.expires_at) {
    return null;
  }

  return refreshTokenModel.create({
    user_id: userId,
    token_hash: hashToken(refreshToken),
    expires_at: claims.expires_at,
    is_revoked: false,
    revoked_at: null,
  });
};

export const findActiveRefreshToken = async (refreshTokenModel, refreshToken) => {
  return refreshTokenModel.findOne({
    where: {
      token_hash: hashToken(refreshToken),
      is_revoked: false,
      expires_at: {
        [Op.gt]: new Date(),
      },
    },
  });
};

export const revokeRefreshToken = async (refreshTokenModel, refreshToken) => {
  const [affectedRows] = await refreshTokenModel.update(
    {
      is_revoked: true,
      revoked_at: new Date(),
    },
    {
      where: {
        token_hash: hashToken(refreshToken),
        is_revoked: false,
      },
    }
  );

  return affectedRows;
};

export const revokeAllUserRefreshTokens = async (refreshTokenModel, userId) => {
  const [affectedRows] = await refreshTokenModel.update(
    {
      is_revoked: true,
      revoked_at: new Date(),
    },
    {
      where: {
        user_id: userId,
        is_revoked: false,
      },
    }
  );

  return affectedRows;
};
