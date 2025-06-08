import express from 'express'

const router = express.Router()

import { forgotPassword, login, logout, register } from '../controllers/userController.js'

router.post("/login", login);
router.get("/logout", logout);
router.post("/register", register);
router.put("/:id/forgot-password", forgotPassword)


export default router;