/**
 * @swagger
 * tags:
 *   name: Department
 *   description: Endpoints for managing departments
 */

import express from "express";
const router = express.Router();

import {
  addDepartment,
  getDepartmentById,
  deleteDepartment,
  updateDepartment,
  getAllDepartments,
  getDepartmentsName,
} from "../controllers/departmentController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dep_name
 *               - description
 *             properties:
 *               dep_name:
 *                 type: string
 *                 example: Human Resources
 *               description:
 *                 type: string
 *                 example: Handles employee relations and recruitment
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Department already exists
 */
router.post("/", protect, adminOnly, addDepartment);

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Get a paginated list of departments
 *     tags: [Department]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: HR
 *     responses:
 *       200:
 *         description: Departments retrieved
 *       404:
 *         description: No departments found
 */
router.get("/", getAllDepartments);

/**
 * @swagger
 * /departments/dep-name:
 *   get:
 *     summary: Get all department names and IDs (for dropdowns etc.)
 *     tags: [Department]
 *     responses:
 *       200:
 *         description: List of department names
 *       404:
 *         description: No departments found
 */
router.get("/dep-name", getDepartmentsName);

/**
 * @swagger
 * /departments/{id}/view:
 *   get:
 *     summary: Get department by ID
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department retrieved
 *       404:
 *         description: Department not found
 */
router.get("/:id/view", protect, adminOnly, getDepartmentById);

/**
 * @swagger
 * /departments/{id}/edit:
 *   put:
 *     summary: Update department by ID
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dep_name:
 *                 type: string
 *                 example: Operations
 *               description:
 *                 type: string
 *                 example: Oversees daily operations
 *     responses:
 *       200:
 *         description: Department updated
 *       404:
 *         description: Department not found
 *       409:
 *         description: Duplicate department name
 */
router.put("/:id/edit", protect, adminOnly, updateDepartment);

/**
 * @swagger
 * /departments/{id}/delete:
 *   delete:
 *     summary: Soft delete department and related data
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       404:
 *         description: Department not found
 */
router.delete("/:id/delete", protect, adminOnly, deleteDepartment);

export default router;
