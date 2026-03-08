# Signup Feature Rollout (Steps 7, 8, 9)

## Step 7: Migrate database safely

Run the migration on the target DB:

```bash
mysql -u root -p db_manach < src/data_base_export/database/migrations/20260305_signup_security_up.sql
```

Rollback command:

```bash
mysql -u root -p db_manach < src/data_base_export/database/migrations/20260305_signup_security_down.sql
```

For auth session + password recovery tables (steps 13-16):

```bash
mysql -u root -p db_manach < src/data_base_export/database/migrations/20260306_auth_recovery_up.sql
```

Rollback:

```bash
mysql -u root -p db_manach < src/data_base_export/database/migrations/20260306_auth_recovery_down.sql
```

For email verification schema (steps 18-20):

```bash
mysql -u root -p db_manach < src/data_base_export/database/migrations/20260306_email_verification_up.sql
```

Rollback:

```bash
mysql -u root -p db_manach < src/data_base_export/database/migrations/20260306_email_verification_down.sql
```

Notes:
- The `up` script checks duplicates and adds `users` unique indexes (`user_name`, `email`, `phone`) only if missing.
- If duplicate rows exist, clean data first, then rerun migration.

## Step 8: Deploy backend with secure auth config

Set environment variables before starting backend:

```bash
export JWT_SECRET="replace_access_secret"
export JWT_EXPIRES_IN="15m"
export JWT_REFRESH_SECRET="replace_refresh_secret"
export JWT_REFRESH_EXPIRES_IN="7d"
export SIGNUP_RATE_LIMIT_WINDOW_MS="900000"
export SIGNUP_RATE_LIMIT_MAX="5"
export PASSWORD_RESET_TOKEN_EXPIRE_MINUTES="15"
export EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES="60"
export REQUIRE_EMAIL_VERIFIED="false"
export EXPOSE_EMAIL_VERIFICATION_TOKEN="false"
export LOGIN_ATTEMPT_WINDOW_MS="900000"
export LOGIN_LOCK_DURATION_MS="900000"
export LOGIN_MAX_ATTEMPTS="5"
```

Then start service:

```bash
yarn start
```

Use `.env.example` as the base config:

```bash
cp .env.example .env
```

## Step 9: Post-deploy verification and rollback checklist

Verification checklist:
- Signup success: `POST /auth/signup` returns `201` with `content.user`, `access_token`, `refresh_token`.
- Login success: `POST /auth/login` returns `200` with `content.user`, `access_token`, `refresh_token`.
- Refresh success: `POST /auth/refresh-token` returns `200` with renewed `access_token`, `refresh_token`.
- Logout success: `POST /auth/logout` returns `200` and revokes the current refresh token.
- Forgot password: `POST /auth/forgot-password` returns `200` (with reset token in current dev implementation).
- Reset password: `POST /auth/reset-password` returns `200` with valid reset token and valid new password.
- Request email verification: `POST /auth/request-email-verification` returns `200`.
- Verify email: `POST /auth/verify-email` returns `200` with valid verification token.
- Login lockout: after `LOGIN_MAX_ATTEMPTS` failed attempts in `LOGIN_ATTEMPT_WINDOW_MS`, login returns `429` until `LOGIN_LOCK_DURATION_MS` elapses.
- Duplicate signup returns `409`.
- Invalid payload returns `400`.
- Trigger more than 5 signup requests in 15 minutes from same IP returns `429`.
- Login still works for users created via signup.

Quick SQL verification:

```sql
SHOW INDEX FROM users WHERE Key_name IN ('uniq_users_user_name', 'uniq_users_email', 'uniq_users_phone');
```

Rollback checklist:
1. Stop incoming signup traffic if needed.
2. Run down migration file.
3. Revert backend to pre-signup-hardening commit/config.
4. Re-run smoke tests for `/auth/login` and `/auth/signup`.

Smoke test command:

```bash
BASE_URL=http://localhost:8080 ./scripts/auth_smoke.sh
```
