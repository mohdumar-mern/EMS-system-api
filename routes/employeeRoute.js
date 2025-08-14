import express from "express";
const router = express.Router();

import {
  addEmployee,
  getEmployee,
  getEmployeeById,
  updateEmployee,
  getEmployeeByDepartmentId,
  deleteEmployee
} from "../controllers/employeeController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multerMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: Employee management endpoints
 */

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Get all employees with pagination and search
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term (name, ID, designation, etc.)
 *     responses:
 *       200:
 *         description: List of employees
 *       404:
 *         description: No employees found
 */
router.get("/", protect, getEmployee);

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Add a new employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
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
 *               - gender
 *               - maritalStatus
 *               - designation
 *               - department
 *               - salary
 *               - profile
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *               maritalStatus:
 *                 type: string
 *               designation:
 *                 type: string
 *               department:
 *                 type: string
 *               salary:
 *                 type: string
 *               role:
 *                 type: string
 *               profile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/", protect, adminOnly, upload.single("profile"), addEmployee);

/**
 * @swagger
 * /employees/{id}/view:
 *   get:
 *     summary: Get an employee by ID
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Employee Mongo ID or User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee found
 *       404:
 *         description: Employee not found
 */
router.get("/:id/view", protect, getEmployeeById);

/**
 * @swagger
 * /employees/department/{id}:
 *   get:
 *     summary: Get employees by department ID
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Department Mongo ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employees found
 *       404:
 *         description: Department not found or no employees
 */
router.get("/department/:id", protect, getEmployeeByDepartmentId);

/**
 * @swagger
 * /employees/{id}/edit:
 *   put:
 *     summary: Update an existing employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               maritalStatus:
 *                 type: string
 *               designation:
 *                 type: string
 *               department:
 *                 type: string
 *               salary:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee updated
 *       404:
 *         description: Employee not found
 */
router.put("/:id/edit", protect, updateEmployee);

/**
 * @swagger
 * /employees/{id}/delete:
 *   delete:
 *     summary: Delete an employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee deleted
 *       404:
 *         description: Employee not found
 */
router.delete("/:id/delete", protect, adminOnly, deleteEmployee);

export default router;
