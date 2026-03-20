# 🍎 Manach: Fruit Management System

A full-stack web application designed for managing a fruit shop. This platform includes both a **Customer Storefront** for browsing and purchasing products, and an **Admin Dashboard** for overseeing store operations, handling inventory, and providing real-time customer support via chat.

---

## 🏗️ Architecture

- **Frontend (`manach-frontend`)**: React & Vite, Tailwind CSS, Redux Toolkit, Socket.io-client.
- **Backend (`FruitManagement-BE`)**: Node.js & Express, Sequelize ORM (MySQL), Socket.io (Real-time).
- **Database**: MySQL.

---

## 🚀 How to Run Manually (Development)

Follow these steps to run the application locally on your machine without Docker.

### 1. Database Setup
1. Ensure you have **MySQL** running locally (or via a MySQL Docker container) exposed on port `3307`.
2. Create a new database named `db_manach`.
3. Import the provided SQL dump into your database:
   ```bash
   mysql -u root -p -P 3307 -h 127.0.0.1 db_manach < db_manach.sql
   ```

### 2. Backend Setup (`FruitManagement-BE`)
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd FruitManagement-BE
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Ensure you have a `.env` file in the root of the backend folder with your database credentials. (e.g., `DB_PORT=3307`, `DB_USER=root`, `DB_PASS=1234`).
4. Start the server:
   ```bash
   npm run start
   ```
   *The backend will be running on `http://localhost:8080`.*

### 3. Frontend Setup (`manach-frontend`)
1. Open a **new** terminal and navigate to the frontend folder:
   ```bash
   cd manach-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be running on `http://localhost:5173`.*

---

## 🐳 How to Run with Docker (Staging / Production)

You can spin up the full application suite using the provided Docker configuration. 

### Prerequisites
- Docker & Docker Compose installed on your machine.
- Your MySQL database is still expected to be accessible (the container configuration expects to find MySQL running on the host via `host.docker.internal:3307`).

### Running the Stack
1. Open a terminal at the root of the project where the `docker-compose.test.yml` resides.
2. Build and spin up the containers:
   ```bash
   docker-compose -f docker-compose.test.yml up -d
   ```
3. Once running, you can access the services:
   - **Frontend (Nginx / Web)**: `http://localhost:80` (or `http://localhost:3001` directly to the web service)
   - **Backend API**: `http://localhost:8081`

### Stopping the Stack
To gracefully stop the running containers, use:
```bash
docker-compose -f docker-compose.test.yml down
```

---

## 🔥 Key Features

- **🛒 E-commerce Storefront**: Customers can browse fruit, add items to their carts, and check out securely.
- **👨‍💼 Admin Dashboard**: Manage inventory, monitor active sales, warehouse management, and user roles.
- **💬 Real-Time Live Chat**: Customers can initiate live conversations with currently online administrators directly from the storefront without page reloads. Includes unread message notification badges across both client and admin sides. Powered by Socket.IO.
- **🔐 Secure Authentication**: Token-based security and password hashing.
