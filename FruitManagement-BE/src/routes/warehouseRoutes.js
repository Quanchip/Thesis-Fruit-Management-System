import express from "express";
import {
  addProductToShelf,
  getImport,
  getInventory,
  getProductsShelfs,
  reorder,
  reorderProduct,
} from "../controllers/warehouseController.js";

const warehouseRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: Warehouse
 *   description: Warehouse management related routes
 */

/**
 * @swagger
 * /warehouse:
 *   get:
 *     summary: Get all products in warehouse (inventory)
 *     tags: [Warehouse]
 *     responses:
 *       200:
 *         description: Inventory retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   quantity:
 *                     type: integer
 *       404:
 *         description: Inventory not found
 */
warehouseRoutes.get("/", getInventory);

/**
 * @swagger
 * /warehouse/reorder:
 *   get:
 *     summary: Get all products in warehouse that quantity = 0
 *     tags: [Warehouse]
 *     responses:
 *       200:
 *         description: Products to reorder retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   quantity:
 *                     type: integer
 *       404:
 *         description: Products not found
 */
warehouseRoutes.get("/reorder", reorder);

/**
 * @swagger
 * /warehouse/reorder/{product_id}:
 *   put:
 *     summary: Reorder product
 *     tags: [Warehouse]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: Quantity to reorder
 *     responses:
 *       200:
 *         description: Product reordered successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product not found
 */
warehouseRoutes.put("/reorder/:product_id", reorderProduct);

/**
 * @swagger
 * /warehouse/stock-adjust:
 *   get:
 *     summary: Get all products in shelf (Show quantity in warehouse and shelf)
 *     tags: [Warehouse]
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   warehouse_quantity:
 *                     type: integer
 *                   shelf_quantity:
 *                     type: integer
 *       404:
 *         description: Products not found
 */
warehouseRoutes.get("/stock-adjust", getProductsShelfs);

/**
 * @swagger
 * /warehouse/stock-adjust/add-shelf:
 *   post:
 *     summary: Add product from warehouse to shelf
 *     tags: [Warehouse]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product added to shelf successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product not found
 */
warehouseRoutes.post("/stock-adjust/add-shelf", addProductToShelf);

/**
 * @swagger
 * /warehouse/import:
 *   get:
 *     summary: Get all imports (order history)
 *     tags: [Warehouse]
 *     responses:
 *       200:
 *         description: Imports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   quantity:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Imports not found
 */
warehouseRoutes.get("/import", getImport);

export default warehouseRoutes;
