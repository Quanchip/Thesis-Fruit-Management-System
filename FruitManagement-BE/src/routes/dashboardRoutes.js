import express from "express";
import { getInfoDashboard } from "../controllers/dashboardController.js";

const dashboardRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard related routes
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard information
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   description: Dashboard data
 *       404:
 *         description: Dashboard information not found
 */
dashboardRoutes.get("/", getInfoDashboard);

export default dashboardRoutes;
