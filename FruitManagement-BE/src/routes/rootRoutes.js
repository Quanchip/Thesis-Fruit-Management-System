/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication related routes
 *   - name: User
 *     description: User management related routes
 *   - name: Store
 *     description: Store management related routes
 *   - name: Warehouse
 *     description: Warehouse management related routes
 *   - name: Dashboard
 *     description: Dashboard related routes
 */

/**
 * @swagger
 * /auth:
 *   get:
 *     summary: Auth routes
 *     tags: [Auth]
 *     description: Endpoints for authentication
 *     responses:
 *       200:
 *         description: Auth endpoints documentation
 */

/**
 * @swagger
 * /user:
 *   get:
 *     summary: User routes
 *     tags: [User]
 *     description: Endpoints for user management
 *     responses:
 *       200:
 *         description: User endpoints documentation
 */

/**
 * @swagger
 * /store:
 *   get:
 *     summary: Store routes
 *     tags: [Store]
 *     description: Endpoints for store management
 *     responses:
 *       200:
 *         description: Store endpoints documentation
 */

/**
 * @swagger
 * /warehouse:
 *   get:
 *     summary: Warehouse routes
 *     tags: [Warehouse]
 *     description: Endpoints for warehouse management
 *     responses:
 *       200:
 *         description: Warehouse endpoints documentation
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Dashboard routes
 *     tags: [Dashboard]
 *     description: Endpoints for dashboard functionalities
 *     responses:
 *       200:
 *         description: Dashboard endpoints documentation
 */

import express from "express";
import authRoutes from "./authRoutes.js";
import storeRoutes from "./storeRoutes.js";
import warehouseRoutes from "./warehouseRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import userRoutes from "./userRoutes.js";

const rootRoute = express.Router();

rootRoute.use("/auth", authRoutes);

rootRoute.use("/user", userRoutes);

rootRoute.use("/store", storeRoutes);

rootRoute.use("/warehouse", warehouseRoutes);

rootRoute.use("/dashboard", dashboardRoutes);

export default rootRoute;
