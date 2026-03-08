import express from "express";
import {
  addProduct,
  getCategory,
  getCategoryProducts,
  getProduct,
  getProductDetails,
  removeProduct,
  // searchAdminProducts,
  searchProducts,
  uploadPictures,
} from "../controllers/storeController.js";

const storeRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: Store
 *   description: Store management and customer operations
 */

/**
 * @swagger
 * /store/category:
 *   get:
 *     summary: Get all categories
 *     tags: [Store]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *       404:
 *         description: Categories not found
 */
storeRoutes.get("/category", getCategory);

/**
 * @swagger
 * /store/category/{category_id}:
 *   get:
 *     summary: Get products of a specific category
 *     tags: [Store]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
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
 *                   price:
 *                     type: number
 *       404:
 *         description: Category not found
 */
storeRoutes.get("/category/:category_id", getCategoryProducts);

/**
 * @swagger
 * /store/category/{category_id}/{product_id}:
 *   get:
 *     summary: Get product details
 *     tags: [Store]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 description:
 *                   type: string
 *       404:
 *         description: Product not found
 */
storeRoutes.get("/category/:category_id/:product_id", getProductDetails);

/**
 * @swagger
 * /store/all-product:
 *   get:
 *     summary: Get all products (Admin)
 *     tags: [Store]
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
 *                   price:
 *                     type: number
 *       404:
 *         description: Products not found
 */
storeRoutes.get("/all-product", getProduct);

/**
 * @swagger
 * /store/all-product/add-product:
 *   post:
 *     summary: Add a new product (Admin)
 *     tags: [Store]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product added successfully
 *       400:
 *         description: Invalid input
 */

import upload from "../config/upload.js";

storeRoutes.post(
  "/all-product/add-product",
  upload.single("product_img"),
  addProduct
);

/**
 * @swagger
 * /store/all-product/remove-product:
 *   put:
 *     summary: Remove a product (Admin)
 *     tags: [Store]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product removed successfully
 *       400:
 *         description: Invalid input
 */
storeRoutes.put("/all-product/remove-product", removeProduct);

/**
 * @swagger
 * /store/search/{product_name}:
 *   get:
 *     summary: Search products in store
 *     tags: [Store]
 *     parameters:
 *       - in: path
 *         name: product_name
 *         required: true
 *         schema:
 *           type: string
 *         description: The product name
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
 *                   price:
 *                     type: number
 *       404:
 *         description: Products not found
 */
storeRoutes.get("/search/:product_name", searchProducts);

storeRoutes.post(
  "/upload/:category_id",
  upload.single("category_img"),
  uploadPictures
);

export default storeRoutes;
