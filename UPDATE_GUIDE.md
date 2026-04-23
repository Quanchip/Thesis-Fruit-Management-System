# 📦 Update Guide — Apply Latest Changes

This guide helps you apply all recent changes (code + database) to your local machine.

> **Recent changes included:**
> - PayPal payment integration (Sandbox)
> - Shipping method selection (Standard / Instant) at checkout
> - Payment modal (PayPal, COD, coming-soon placeholders)
> - Chat duplicate message fix (socket architecture)
> - `.env` file now requires PayPal credentials

---

## Step 1 — Pull latest code

```bash
git pull origin main
```

---

## Step 2 — Install new dependencies

### Backend
```bash
cd FruitManagement-BE
npm install
```

### Frontend
```bash
cd manach-frontend
npm install
```

---

## Step 3 — Apply database migration

Open your MySQL client (TablePlus, DBeaver, MySQL Workbench, or CLI) and run the following SQL against the **`db_manach`** database:

```sql
-- Add shipping columns to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(50) NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS shipping_fee    FLOAT       NULL DEFAULT 0;
```

> ✅ The `IF NOT EXISTS` clause means it's safe to run even if you already have the columns.

---

## Step 4 — Set up your `.env` file

The backend `.env` file is **not committed to git** for security reasons.  
Create your own `.env` file inside `FruitManagement-BE/` with the following content:

```env
# Database
DB_DATABASE=db_manach
DB_USER=root
DB_PASS=<your MySQL password>
DB_HOST=localhost
DB_PORT=<your MySQL port, usually 3306 or 3307>
DB_DIALECT=mysql

# Server
HOST=127.0.0.1
PORT=8080
PORT_RETRIES=10

# JWT
JWT_SECRET=replace_access_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Rate limiting
SIGNUP_RATE_LIMIT_WINDOW_MS=900000
SIGNUP_RATE_LIMIT_MAX=5
LOGIN_ATTEMPT_WINDOW_MS=900000
LOGIN_LOCK_DURATION_MS=900000
LOGIN_MAX_ATTEMPTS=5

# Token expiry
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=15
EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES=60

# Email
EMAIL_USER=<your Gmail>
EMAIL_APP_PASSWORD=<your Gmail App Password>

# Dev flags
NODE_ENV=development
REQUIRE_EMAIL_VERIFIED=false
EXPOSE_EMAIL_VERIFICATION_TOKEN=true

# PayPal (Sandbox)
PAYPAL_CLIENT_ID=Af3SCMzOCfFc9D5BRg9bjD9fQk0v_BusNcGykIbvtEThoJq1JkEO7YpBereIbQxdUkr_J0YdUyey6Szb
PAYPAL_SECRET=EGcZlPCMid_6YsDfO5y6NJ9e7g1oEkgpM5y5GtJN5HRaL-2dY5d9-aygOUVata2nYrbOsqed4seVZOR4
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

# Frontend origin (for CORS / redirect URLs)
FRONTEND_URL=http://localhost:5173
```

> 💡 Ask Quan for the `EMAIL_USER` and `EMAIL_APP_PASSWORD` values if you need email features.  
> The `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` above are the shared **Sandbox** keys — safe to use.

---

## Step 5 — Start both servers

### Backend (terminal 1)
```bash
cd FruitManagement-BE
npm run start
```

Backend will be available at: `http://localhost:8080`

### Frontend (terminal 2)
```bash
cd manach-frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## Step 6 — Verify

| Feature | How to test |
|---|---|
| Checkout page | Add items to cart, go to checkout → should see shipping selector and total update |
| PayPal payment | Click "Proceed to Payment" → PayPal → use sandbox account to pay |
| COD payment | Click "Proceed to Payment" → Cash on Delivery |
| Customer chat | Log in as customer, open chat bubble, send a message |
| Admin chat | Log in as admin, go to Chat section, reply to customer |
| No duplicate messages | Send a message — it should appear **once** only |

---

## Troubleshooting

### MySQL port mismatch
If you get a DB connection error, check your MySQL port. Default is `3306`, but some setups use `3307`.  
Update `DB_PORT` in `.env` accordingly.

### PayPal redirect not working
Make sure `FRONTEND_URL=http://localhost:5173` exactly matches the port Vite uses. Check the Vite terminal output.

### `@@GLOBAL.GTID_PURGED` error when importing SQL dump
This error occurs when importing a full dump that includes GTID history. To fix, open the SQL file and remove (or comment out) the line:
```sql
SET @@GLOBAL.GTID_PURGED= ...;
```
Or import using: `mysql --set-gtid-purged=OFF -u root -p db_manach < dump.sql`



# Export db_manach to a SQL file on your Mac desktop (or any path you choose)
docker exec manach mysqldump -u root -p1234 --no-tablespaces --set-gtid-purged=OFF db_manach > ./db_manach.sql
