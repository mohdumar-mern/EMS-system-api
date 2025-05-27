import express from 'express'

const router = express.Router()

import { login, logout, register } from '../controllers/userController.js'

router.post("/login", login);
router.get("/logout", logout);
router.post("/register", register);

export default router;