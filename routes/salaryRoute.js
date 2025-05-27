import express from 'express'

const router = express.Router()
import { addSalary, getSalary, getSalaryByEmpId } from '../controllers/salaryController.js'
import { protect } from '../middlewares/authMiddleware.js'

router.get('/', protect, getSalary)
router.get('/:empId', protect, getSalaryByEmpId)
router.post('/', protect, addSalary)



export default  router