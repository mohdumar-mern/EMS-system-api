import express from 'express'

const router = express.Router()
import { addSalary, getSalary, getSalaryByEmpId } from '../controllers/salaryController.js'
import { protect } from '../middlewares/authMiddleware.js'

router.get('/', protect, getSalary)
router.get('/:empId/history', protect, getSalaryByEmpId)
router.post('/add', protect, addSalary)




export default  router