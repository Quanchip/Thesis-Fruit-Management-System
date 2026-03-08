import express from "express";
import {
  checkOut,
  getOrder,
  getProfile,
  updateProfile,
} from "../controllers/userController.js";

const userRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and operations
 */

/**
 * @swagger
 * /user/{user_id}:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 address:
 *                   type: string
 *       404:
 *         description: User not found
 */
userRoutes.get("/:user_id", getProfile);

/**
 * @swagger
 * /user/{user_id}/edit:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: User profile updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 */
userRoutes.put("/:user_id/edit", updateProfile);

/**
 * @swagger
 * /user/{user_id}/checkout:
 *   post:
 *     summary: Checkout to buy products
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     quantity:
 *                       type: integer
 *                     product_id:
 *                       type: string
 *     responses:
 *       200:
 *         description: Checkout successful
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 */
userRoutes.post("/:user_id/checkout", checkOut);

/**
 * @swagger
 * /user/{user_id}/order:
 *   get:
 *     summary: View user's transactions
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User transactions retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   order_id:
 *                     type: string
 *                   product_list:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         product_id:
 *                           type: string
 *                         quantity:
 *                           type: integer
 *                         price:
 *                           type: number
 *       404:
 *         description: User not found or no transactions
 */
userRoutes.get("/:user_id/order", getOrder);

export default userRoutes;
