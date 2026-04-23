# 🍍 Manach — Fruit Management System

> A full-stack web application for managing a fruit retail & warehouse business, built as a university thesis project.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Database](#database)
- [API Routes](#api-routes)
- [Frontend Routes](#frontend-routes)
- [State Management](#state-management)
- [Authentication & Security](#authentication--security)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing](#testing)

---

## Overview

**Manach** is a full-stack fruit management platform designed for both customers and administrators. Customers can browse a fruit store, add items to their cart, place orders, and check out. Administrators have access to a dashboard with analytics, warehouse management, store management, and user control.

The system is split into two separate codebases:
- **`FruitManagement-BE`** — Node.js + Express REST API backend
- **`manach-frontend`** — React + Vite single-page application

---

## Tech Stack

### Backend (`FruitManagement-BE`)

| Category        | Technology                             |
|-----------------|----------------------------------------|
| Runtime         | Node.js (ES Modules)                   |
| Framework       | Express 4                              |
| Database        | MySQL (via Docker)                     |
| ORM             | Sequelize 6                            |
| Authentication  | JWT (access + refresh tokens)          |
| Password hashing| bcrypt                                 |
| File uploads    | Multer                                 |
| API Docs        | Swagger (swagger-jsdoc + swagger-ui)   |
| Testing         | Vitest + Supertest                     |
| Code Docs       | JSDoc                                  |
| Process manager | Nodemon                                |

### Frontend (`manach-frontend`)

| Category        | Technology                             |
|-----------------|----------------------------------------|
| Framework       | React 18                               |
| Build Tool      | Vite 5                                 |
| Styling         | Tailwind CSS 3 + DaisyUI               |
| UI Library      | Ant Design 5                           |
| State           | Redux Toolkit + React-Redux            |
| Routing         | React Router DOM v6                    |
| Forms           | Formik + Yup                           |
| Charts          | Chart.js + Recharts                    |
| HTTP Client     | Axios                                  |
| Animations      | Lottie React                           |
| Font            | Poppins (via @fontsource)              |
| Linting         | ESLint + Prettier                      |

---

## Project Structure

```
Thesis/
├── db_manach.sql              # Full MySQL database dump
├── FruitManagement-BE/        # Backend source
│   ├── src/
│   │   ├── server.js          # Express app entry point
│   │   ├── config/            # DB & app configuration
│   │   ├── controllers/       # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── storeController.js
│   │   │   ├── userController.js
│   │   │   └── warehouseController.js
│   │   ├── middlewares/       # Auth & validation middleware
│   │   ├── models/            # Sequelize ORM models (20 models)
│   │   ├── routes/            # Express route definitions
│   │   │   ├── rootRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── storeRoutes.js
│   │   │   ├── warehouseRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── services/          # Business logic layer
│   │   │   ├── authService.js
│   │   │   ├── authSessionService.js
│   │   │   ├── emailVerificationService.js
│   │   │   ├── loginSecurityService.js
│   │   │   ├── passwordResetService.js
│   │   │   └── tokenService.js
│   │   ├── swagger/           # Swagger/OpenAPI config
│   │   └── data_base_export/  # DB export scripts/utilities
│   ├── tests/                 # Vitest test suites
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── services/
│   │   └── server.test.js
│   ├── docs/                  # Generated JSDoc documentation
│   ├── scripts/               # Utility shell scripts
│   ├── .env.example           # Environment variable template
│   ├── jsdoc.json             # JSDoc config
│   └── package.json
│
└── manach-frontend/           # Frontend source
    ├── src/
    │   ├── main.jsx           # React app entry point
    │   ├── App.jsx            # Root router configuration
    │   ├── components/        # Reusable UI components (23+)
    │   │   ├── Menu.jsx
    │   │   ├── Layout.jsx
    │   │   ├── Loading.jsx
    │   │   ├── AddToCart/
    │   │   ├── Cart btn/
    │   │   ├── DailyDeals/
    │   │   ├── ExploreFruit/
    │   │   ├── ExploreSupplier/
    │   │   ├── Review/
    │   │   ├── StateRipe/
    │   │   └── ...
    │   ├── routes/
    │   │   ├── Auth/          # Login, Signup, Welcome
    │   │   ├── AboutUs/
    │   │   ├── Setting/
    │   │   └── Home/
    │   │       ├── Admin/     # Admin dashboard & management
    │   │       │   ├── Dashboard/
    │   │       │   ├── Warehouse/
    │   │       │   ├── Store/
    │   │       │   └── Setting/
    │   │       └── Customer/  # Customer-facing storefront
    │   │           ├── HomePage/
    │   │           ├── Store/  (Banana, Mango, Durian, ...)
    │   │           ├── Order/
    │   │           ├── CheckOut/
    │   │           └── Setting/
    │   ├── redux/             # Redux state slices
    │   │   ├── store.jsx
    │   │   ├── cartReducer/
    │   │   ├── dashboardReducer/
    │   │   ├── storeAReducer/
    │   │   ├── userReducer/
    │   │   └── loadingReducer/
    │   └── service/           # Axios API service layer (7 modules)
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Features

### 👤 Customer
- **Home Page** — Landing page with fruit highlights, daily deals, and promotional sections
- **Store** — Browse fruits by category (Banana, Mango, Durian, Coconut, Papaya, Berries, Pineapple)
- **Cart** — Add/remove items, view cart totals
- **Orders** — View order history and status
- **Checkout** — Complete purchase flow
- **Settings** — Manage personal profile and account settings
- **Authentication** — Register, log in, log out

### 🛠️ Admin
- **Dashboard** — Analytics and KPI charts (via Chart.js / Recharts)
- **Warehouse Management** — Track warehouse inventory, imports/exports
- **Store Management** — Manage product listings and shelf placement
- **User Management** — View and manage user accounts
- **Settings** — Admin account configuration

### 🔒 Authentication & Security
- JWT access + refresh token workflow
- Password hashing with bcrypt
- Email verification support
- Password reset via token
- Rate limiting on signup and login
- Login lockout after maximum failed attempts

---

## Database

The project uses **MySQL** (`db_manach`) with **Sequelize ORM**.

### Key Tables / Models

| Model                    | Description                                  |
|--------------------------|----------------------------------------------|
| `users`                  | User accounts with roles                     |
| `roles`                  | User role definitions                        |
| `products`               | Fruit products catalog                       |
| `categories`             | Product categories                           |
| `suppliers`              | Supplier information                         |
| `warehouses`             | Warehouse locations                          |
| `warehouse_products`     | Products stored in each warehouse            |
| `shelves`                | Store shelves                                |
| `shelf_products`         | Products placed on shelves                   |
| `imports`                | Incoming stock records                       |
| `exports`                | Outgoing stock records                       |
| `export_products`        | Products within an export                    |
| `export_shelfs`          | Shelf-level export records                   |
| `orders`                 | Customer orders                              |
| `order_products`         | Products within an order                     |
| `auth_refresh_tokens`    | Stored refresh tokens                        |
| `email_verification_tokens` | Email verification tokens               |
| `password_reset_tokens`  | Password reset tokens                        |

> The full database schema is available in `db_manach.sql` at the project root.

---

## API Routes

The backend server runs by default at `http://127.0.0.1:8080`.  
Interactive API documentation is available at: **`http://localhost:8080/api-docs`** (Swagger UI)

| Prefix        | Description                      |
|---------------|----------------------------------|
| `/auth`       | Register, login, logout, refresh, email verification, password reset |
| `/user`       | User profile management          |
| `/store`      | Product listing, categories, shelves |
| `/warehouse`  | Warehouse inventory, imports, exports |
| `/dashboard`  | Sales & inventory analytics data |

---

## Frontend Routes

The frontend runs by default at `http://localhost:5173` (Vite dev server).

| Path                              | Component          | Access    |
|-----------------------------------|--------------------|-----------|
| `/`                               | AboutUs            | Public    |
| `/auth/welcome`                   | Welcome            | Public    |
| `/auth/login`                     | Login              | Public    |
| `/auth/signup`                    | Signup             | Public    |
| `/customer/home`                  | Customer Home      | Customer  |
| `/customer/store`                 | All Fruits Store   | Customer  |
| `/customer/store/banana-store`    | Banana Store       | Customer  |
| `/customer/store/mango-store`     | Mango Store        | Customer  |
| `/customer/store/durian-store`    | Durian Store       | Customer  |
| `/customer/store/berries-store`   | Berries Store      | Customer  |
| `/customer/store/coconut-store`   | Coconut Store      | Customer  |
| `/customer/store/papaya-store`    | Papaya Store       | Customer  |
| `/customer/store/pineapple-store` | Pineapple Store    | Customer  |
| `/customer/order`                 | My Orders          | Customer  |
| `/customer/check-out`             | Checkout           | Customer  |
| `/customer/setting`               | Customer Settings  | Customer  |
| `/admin/home`                     | Admin Home         | Admin     |
| `/admin/dashboard`                | Dashboard          | Admin     |
| `/admin/store`                    | Store Management   | Admin     |
| `/admin/warehouse`                | Warehouse Mgmt     | Admin     |
| `/admin/setting`                  | Admin Settings     | Admin     |

---

## State Management

Redux Toolkit is used for global state with the following slices:

| Slice              | Responsibility                               |
|--------------------|----------------------------------------------|
| `userReducer`      | Authenticated user info, session state       |
| `cartReducer`      | Shopping cart items and totals               |
| `storeAReducer`    | Admin store management state                 |
| `dashboardReducer` | Dashboard analytics data                     |
| `loadingReducer`   | Global loading/spinner state                 |

---

## Authentication & Security

The backend uses a layered auth security model:

```
Request
  └─> Rate Limiting (signup / login)
        └─> Login Lockout (after N failures)
              └─> JWT Middleware (verify access token)
                    └─> Controller / Route Handler
```

JWT tokens:
- **Access token** — Short-lived (default: 15 minutes)
- **Refresh token** — Long-lived (default: 7 days), stored in DB

Optional features (configured via env vars):
- Email verification before login
- Automatic account lockout after failed attempts
- Password reset via secure token

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Yarn](https://yarnpkg.com/) (backend) / npm (frontend)
- [Docker](https://www.docker.com/)
- [TablePlus](https://tableplus.com/) or any MySQL client (optional)

---

### 1. Set up the Database

```bash
# Pull and start a MySQL container
docker pull mysql
docker run --name manach -e MYSQL_ROOT_PASSWORD=1234 -d -p 3307:3306 mysql
```

Then, using TablePlus (or any MySQL client), connect with:

| Field    | Value       |
|----------|-------------|
| Host     | localhost   |
| Port     | 3307        |
| User     | root        |
| Password | 1234        |

Create a database named `db_manach` and import the file:  
`Thesis/db_manach.sql`

---

### 2. Run the Backend

```bash
cd FruitManagement-BE

# Copy env template and fill in your values
cp .env.example .env

# Install dependencies
yarn

# Start development server (port 8080)
yarn start
```

API docs available at: http://localhost:8080/api-docs

---

### 3. Run the Frontend

```bash
cd manach-frontend

# Install dependencies
npm install

# Start dev server (port 5173)
npm run dev
```

Frontend available at: http://localhost:5173

---

## Environment Variables

All backend environment variables are defined in `.env.example`:

```env
# Database
DB_DATABASE=db_manach
DB_USER=root
DB_PASS=1234
DB_HOST=localhost
DB_PORT=3307
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

# Feature flags
REQUIRE_EMAIL_VERIFIED=false
EXPOSE_EMAIL_VERIFICATION_TOKEN=true

NODE_ENV=development
```

---

## Testing

### Backend

Tests are written with **Vitest** + **Supertest**, mirroring the `src/` structure:

```bash
cd FruitManagement-BE
yarn test
```

Test coverage includes:
- Controller unit tests (`tests/controllers/`)
- Middleware tests (`tests/middlewares/`)
- Service unit tests (`tests/services/`)
- Server integration test (`tests/server.test.js`)

### Auth Smoke Test

A quick end-to-end auth smoke test is available:

```bash
BASE_URL=http://localhost:8080 ./scripts/auth_smoke.sh
```

---

## Documentation

### Backend JSDoc

Generate HTML documentation from source code:

```bash
cd FruitManagement-BE
yarn doc
```

Output will be placed in the `docs/` directory.

### Swagger API Docs

Available at runtime: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---


## Author

- **MinhMoi** — `ititiu21243@Student.hcmiu.edu.vn`
- Backend repository: [github.com/dbn-minh/FruitManagement-BE](https://github.com/dbn-minh/FruitManagement-BE)

---

*This project was developed as a university thesis at HCMIU.*
