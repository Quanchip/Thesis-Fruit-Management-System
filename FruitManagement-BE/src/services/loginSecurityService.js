const attemptWindowMs = Number(
  process.env.LOGIN_ATTEMPT_WINDOW_MS || 15 * 60 * 1000
);
const lockDurationMs = Number(process.env.LOGIN_LOCK_DURATION_MS || 15 * 60 * 1000);
const maxAttempts = Number(process.env.LOGIN_MAX_ATTEMPTS || 5);

const loginAttempts = new Map();

const getAttemptKey = (userName, ip) => `${userName || "unknown"}:${ip || "unknown"}`;

const getOrInitAttemptInfo = (key) => {
  if (!loginAttempts.has(key)) {
    loginAttempts.set(key, {
      attempts: [],
      lockedUntil: null,
    });
  }
  return loginAttempts.get(key);
};

export const getLoginLockStatus = (userName, ip) => {
  const key = getAttemptKey(userName, ip);
  const info = getOrInitAttemptInfo(key);
  const now = Date.now();

  if (info.lockedUntil && info.lockedUntil > now) {
    return {
      locked: true,
      retryAfterSeconds: Math.ceil((info.lockedUntil - now) / 1000),
    };
  }

  if (info.lockedUntil && info.lockedUntil <= now) {
    info.lockedUntil = null;
    info.attempts = [];
  }

  return {
    locked: false,
    retryAfterSeconds: 0,
  };
};

export const recordFailedLoginAttempt = (userName, ip) => {
  const key = getAttemptKey(userName, ip);
  const info = getOrInitAttemptInfo(key);
  const now = Date.now();

  info.attempts = info.attempts.filter((timestamp) => now - timestamp <= attemptWindowMs);
  info.attempts.push(now);

  if (info.attempts.length >= maxAttempts) {
    info.lockedUntil = now + lockDurationMs;
  }

  loginAttempts.set(key, info);
};

export const clearLoginAttempts = (userName, ip) => {
  const key = getAttemptKey(userName, ip);
  loginAttempts.delete(key);
};

export const __resetLoginSecurityStore = () => {
  loginAttempts.clear();
};
