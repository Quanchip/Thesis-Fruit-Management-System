import express from "express";
import {
  forgotPassword,
  login,
  logout,
  refreshToken,
  requestEmailVerification,
  resetPassword,
  signup,
  verifyEmail,
} from "../controllers/authController.js";
import { signupRateLimit } from "../middlewares/authRateLimit.js";

const authRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication related routes
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_name, user_password]
 *             properties:
 *               user_name:
 *                 type: string
 *               user_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                         user_name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role_id:
 *                           type: integer
 *                     access_token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Email not verified
 *       429:
 *         description: Too many failed login attempts
 *         content:
 *           application/json:
 *             example:
 *               message: User doesn't exist
 *               content: ""
 */
authRoutes.post("/login", login);

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, user_name, user_password, phone, email]
 *             properties:
 *               full_name:
 *                 type: string
 *               user_name:
 *                 type: string
 *               user_password:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               bank_account:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                         user_name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role_id:
 *                           type: integer
 *                     access_token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *             example:
 *               message: Successfully sign up
 *               content:
 *                 user:
 *                   user_id: 11
 *                   user_name: new_user
 *                   email: new_user@gmail.com
 *                   role_id: 2
 *                 access_token: eyJhbGciOiJIUzI1NiIsInR...
 *                 refresh_token: eyJhbGciOiJIUzI1NiIsInR...
 *       409:
 *         description: Username, email or phone already exists
 *         content:
 *           application/json:
 *             example:
 *               message: Username already exists
 *               content: ""
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid email address
 *               content: ""
 *       429:
 *         description: Too many signup attempts
 *         content:
 *           application/json:
 *             example:
 *               message: Too many signup attempts. Please try again later.
 *               content: ""
 *       500:
 *         description: Internal server error
 */
authRoutes.post("/signup", signupRateLimit, signup);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refresh token successfully
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
 *                     access_token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Internal server error
 */
authRoutes.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current session by revoking refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid refresh token
 */
authRoutes.post("/logout", logout);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Generate password reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset token generated
 *       400:
 *         description: Invalid input
 */
authRoutes.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reset_token, new_password]
 *             properties:
 *               reset_token:
 *                 type: string
 *               new_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid input or expired reset token
 */
authRoutes.post("/reset-password", resetPassword);

/**
 * @swagger
 * /auth/request-email-verification:
 *   post:
 *     summary: Request a new email verification token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification token generated (generic response)
 *       400:
 *         description: Invalid input
 */
authRoutes.post("/request-email-verification", requestEmailVerification);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email using verification token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [verification_token]
 *             properties:
 *               verification_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired verification token
 */
authRoutes.post("/verify-email", verifyEmail);

export default authRoutes;
