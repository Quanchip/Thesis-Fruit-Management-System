// yarn add jsonwebtoken
// 1. mã hóa dữ liệu
// 2. kiểm tra token hợp lệ
// 3. giải token

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "BIMAT";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "KO_BIMAT";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export const createToken = (data) => {
  let token = jwt.sign({ data }, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: JWT_EXPIRES_IN,
  });

  return token;
};

export const checkToken = (token) =>
  jwt.verify(token, JWT_SECRET, (error, decoded) => error);

export const createRefToken = (data) => {
  let token = jwt.sign({ data }, JWT_REFRESH_SECRET, {
    algorithm: "HS256",
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

  return token;
};

export const checkRefToken = (token) =>
  jwt.verify(token, JWT_REFRESH_SECRET, (error, decoded) => error);

export const verifyAccessToken = (token) => jwt.verify(token, JWT_SECRET);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, JWT_REFRESH_SECRET);

export const decodeToken = (token) => {
  return jwt.decode(token);
};

export const verifyToken = (req, res, next) => {
  let { token } = req.headers;

  let check = checkToken(token);

  if (check == null) {
    // check token hợp lệ
    next();
  } else {
    // token không hợp lệ
    res.status(401).send(check.name);
  }
};
