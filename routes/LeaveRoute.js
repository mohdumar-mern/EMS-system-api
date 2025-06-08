import express from "express"

const router = express.Router()

import { adminOnly, protect } from "../middlewares/authMiddleware.js"
import { addLeave, getEmployeeLeaves, getEmployeesLeaves, getSingleLeaveById,getEmployeeLeavesByEmpId, updateLeaveStatus } from "../controllers/LeaveController.js"

router.post('/add', protect, addLeave)
router.get('/',protect, adminOnly, getEmployeesLeaves) // Assuming this is to get all leaves for the employee
router.get('/:id/view', protect,adminOnly, getSingleLeaveById)
router.get('/:id/leaves', protect,adminOnly, getEmployeeLeavesByEmpId)
router.put('/:id/update-status', protect,adminOnly, updateLeaveStatus)


router.get('/employee', protect, getEmployeeLeaves) // Assuming this is to get all leaves for the employee



export default router