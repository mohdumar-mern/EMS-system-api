import express from "express"

const router = express.Router()

import { adminOnly, protect } from "../middlewares/authMiddleware.js"
import { getSummary } from "../controllers/summaryController.js"


router.get("/summary", protect, adminOnly,getSummary)



export default router