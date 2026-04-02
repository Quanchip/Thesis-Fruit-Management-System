import express from "express";
import { createOrderHandler, captureOrderHandler } from "../controllers/paypalController.js";

const paypalRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: PayPal
 *   description: PayPal Sandbox payment integration
 */

/**
 * @swagger
 * /paypal/create-order:
 *   post:
 *     summary: Create a PayPal order and get approval URL
 *     tags: [PayPal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - totalAmount
 *             properties:
 *               totalAmount:
 *                 type: number
 *                 description: Total order amount in USD
 *                 example: 29.99
 *     responses:
 *       200:
 *         description: PayPal order created, returns approval URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 content:
 *                   type: object
 *                   properties:
 *                     paypalOrderId:
 *                       type: string
 *                     approvalUrl:
 *                       type: string
 *       400:
 *         description: Invalid total amount
 *       500:
 *         description: PayPal API error
 */
paypalRoutes.post("/create-order", createOrderHandler);

/**
 * @swagger
 * /paypal/capture/{orderId}:
 *   post:
 *     summary: Capture an approved PayPal order and record it in the database
 *     tags: [PayPal]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The PayPal Order ID returned from the approval redirect
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *               deliveryInfo:
 *                 type: object
 *                 properties:
 *                   delivery_name:
 *                     type: string
 *                   delivery_phone:
 *                     type: string
 *                   delivery_address:
 *                     type: string
 *     responses:
 *       200:
 *         description: Payment captured and order saved to DB
 *       402:
 *         description: Payment not completed by PayPal
 *       400:
 *         description: Cart is empty
 *       500:
 *         description: PayPal capture or DB error
 */
paypalRoutes.post("/capture/:orderId", captureOrderHandler);

export default paypalRoutes;
