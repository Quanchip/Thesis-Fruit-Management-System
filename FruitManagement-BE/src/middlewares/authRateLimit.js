import { responseData } from "../config/response.js";

const windowMs = Number(process.env.SIGNUP_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const maxRequests = Number(process.env.SIGNUP_RATE_LIMIT_MAX || 5);

const signupRequests = new Map();

const getRequestKey = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

export const signupRateLimit = (req, res, next) => {
  const key = getRequestKey(req);
  const now = Date.now();
  const currentWindowStart = now - windowMs;

  const history = signupRequests.get(key) || [];
  const recentRequests = history.filter((timestamp) => timestamp > currentWindowStart);

  if (recentRequests.length >= maxRequests) {
    return responseData(
      res,
      "Too many signup attempts. Please try again later.",
      "",
      429
    );
  }

  recentRequests.push(now);
  signupRequests.set(key, recentRequests);
  next();
};

export const __resetSignupRateLimiter = () => {
  signupRequests.clear();
};
