import express from "express";
const router = express.Router();

import { protect } from "../middlewares/authMiddleware.js";
import {
  adminLogin,
  adminLogout,
  adminRegister,
  getAdminProfile,
  adminForgotPassword
} from "../controllers/adminController.js";

import { upload } from "../middlewares/multerMiddleware.js";
import { loginLimiter, registerLimiter } from "../middlewares/rateLimiter.js";

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin authentication & profile management
 */

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile data
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", protect, getAdminProfile);

/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               profile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Validation error or email already in use
 */
router.post("/register", upload.single("profile"), registerLimiter, adminRegister);

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", loginLimiter, adminLogin);

/**
 * @swagger
 * /api/admin/logout:
 *   get:
 *     summary: Logout admin
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.get("/logout", adminLogout);

/**
 * @swagger
 * /api/admin/{id}/forgot-password:
 *   put:
 *     summary: Change admin password
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmNewPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Error in password change
 */
router.put("/:id/forgot-password", adminForgotPassword);

export default router;
