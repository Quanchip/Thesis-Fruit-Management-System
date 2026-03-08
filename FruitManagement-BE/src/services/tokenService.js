import { randomUUID } from "crypto";
import {
  createRefToken,
  createToken,
  verifyRefreshToken,
} from "../config/jwt.js";

export const buildAuthPayload = (user) => ({
  user_id: user.user_id,
  role_id: user.role_id,
  user_name: user.user_name,
});

export const buildAuthUser = (user) => ({
  user_id: user.user_id,
  user_name: user.user_name,
  email: user.email,
  role_id: user.role_id,
});

export const issueAuthTokens = (payload) => ({
  access_token: createToken({
    ...payload,
    jti: randomUUID(),
  }),
  refresh_token: createRefToken({
    ...payload,
    jti: randomUUID(),
  }),
});

export const getRefreshTokenClaims = (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded?.data) {
      return null;
    }

    return {
      payload: decoded.data,
      expires_at: decoded.exp ? new Date(decoded.exp * 1000) : null,
    };
  } catch {
    return null;
  }
};

export const rotateFromRefreshToken = (refreshToken) => {
  const claims = getRefreshTokenClaims(refreshToken);
  if (!claims) {
    return null;
  }

  return issueAuthTokens(claims.payload);
};
