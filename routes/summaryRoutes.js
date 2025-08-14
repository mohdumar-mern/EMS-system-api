import express from "express";

const router = express.Router();

import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import { getEmpSummary, getSummary } from "../controllers/summaryController.js";

/**
 * @swagger
 * /api/summary/summary:
 *   get:
 *     summary: Get Admin Dashboard Summary
 *     tags: [Summary]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin only
 */
router.get("/summary", protect, adminOnly, getSummary);

/**
 * @swagger
 * /api/summary/{id}/summary:
 *   get:
 *     summary: Get Employee Dashboard Summary by User ID
 *     tags: [Summary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The User ID of the employee
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee summary retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Employee not found
 */
router.get("/:id/summary", protect, getEmpSummary);

export default router;
