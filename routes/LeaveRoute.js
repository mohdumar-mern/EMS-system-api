import express from "express";
const router = express.Router();

import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import {
  addLeave,
  getEmployeeLeaves,
  getEmployeesLeavesAdmin,
  getSingleLeaveById,
  getEmployeeLeavesByEmpId,
  updateLeaveStatus,
} from "../controllers/LeaveController.js";

/**
 * @swagger
 * tags:
 *   name: Leave
 *   description: Leave management APIs
 */

/**
 * @swagger
 * /leaves/add:
 *   post:
 *     summary: Submit a leave request
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leaveType
 *               - startDate
 *               - endDate
 *               - description
 *             properties:
 *               leaveType:
 *                 type: string
 *                 enum: [casual, sick, maternity]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Leave created successfully
 *       400:
 *         description: Invalid input or employee not found
 */
router.post("/add", protect, addLeave);

/**
 * @swagger
 * /leaves:
 *   get:
 *     summary: Admin - Get all leave requests
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all leave requests
 *       404:
 *         description: No leaves found
 */
router.get("/", protect, adminOnly, getEmployeesLeavesAdmin);

/**
 * @swagger
 * /leaves/{id}/view:
 *   get:
 *     summary: Admin - Get leave by ID
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leave fetched successfully
 *       404:
 *         description: Leave not found
 */
router.get("/:id/view", protect, adminOnly, getSingleLeaveById);

/**
 * @swagger
 * /leaves/{id}/leaves:
 *   get:
 *     summary: Admin - Get all leaves for a specific employee
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: List of leaves for the employee
 *       404:
 *         description: No leaves found
 */
router.get("/:id/leaves", protect, adminOnly, getEmployeeLeavesByEmpId);

/**
 * @swagger
 * /leaves/{id}/update-status:
 *   put:
 *     summary: Admin - Approve or Reject a leave request
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Leave status updated
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Leave not found
 */
router.put("/:id/update-status", protect, adminOnly, updateLeaveStatus);

/**
 * @swagger
 * /leaves/{id}/employee:
 *   get:
 *     summary: Employee - View personal leave records
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID of the employee
 *     responses:
 *       200:
 *         description: List of employee leaves
 *       404:
 *         description: Employee not found
 */
router.get("/:id/employee", protect, getEmployeeLeaves);

export default router;
