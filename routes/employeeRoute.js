import express from "express"

const router = express.Router()

import { adminOnly, protect } from "../middlewares/authMiddleware.js"
import { addEmployee, getEmployee, getEmployeeById, updateEmployee, getEmployeeByDepartmentId, deleteEmployee } from "../controllers/employeeController.js"
import { upload } from "../middlewares/multerMiddleware.js"

router.get('/', protect, getEmployee)
router.get('/:id/view', protect, getEmployeeById)
router.get('/department/:id', protect, getEmployeeByDepartmentId)
router.put('/:id/edit', protect, updateEmployee)
router.delete('/:id/delete', protect, adminOnly, deleteEmployee)
router.post('/',protect, adminOnly, upload.single("profile"), addEmployee)


export default router