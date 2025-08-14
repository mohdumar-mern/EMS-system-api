import express from 'express';
const router = express.Router();

import { protect } from '../middlewares/authMiddleware.js';
import {
  addSalary,
  getSalary,
  getSalaryByEmpId,
} from '../controllers/salaryController.js';

/**
 * @swagger
 * /api/salaries:
 *   get:
 *     summary: Get all salary records (admin only)
 *     tags: [Salaries]
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
 *         description: Number of records per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Employee name search
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of salaries
 */
router.get('/', protect, getSalary);

/**
 * @swagger
 * /api/salaries/{empId}/history:
 *   get:
 *     summary: Get salary history for a specific employee (by empId or userId)
 *     tags: [Salaries]
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID or User ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Salary records for the employee
 */
router.get('/:empId/history', protect, getSalaryByEmpId);

/**
 * @swagger
 * /api/salaries/add:
 *   post:
 *     summary: Add new salary record
 *     tags: [Salaries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - basicSalary
 *               - payDate
 *             properties:
 *               employeeId:
 *                 type: string
 *               basicSalary:
 *                 type: number
 *               allowances:
 *                 type: number
 *               deductions:
 *                 type: number
 *               payDate:
 *                 type: string
 *                 format: date
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Salary added successfully
 */
router.post('/add', protect, addSalary);

export default router;
