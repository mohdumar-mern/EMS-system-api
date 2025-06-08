import express from "express";

const router = express.Router();

import { protect } from "../middlewares/authMiddleware.js";
import {
  adminLogin,
  adminLogout,
  adminRegister,
  getAdminProfile,
  adminForgotPassword
} from "../controllers/adminController.js";

import { upload } from "../middlewares/multerMiddleware.js";

router.get("/profile",protect ,getAdminProfile )
router.post("/register", upload.single("profile"), adminRegister);
router.post("/login", adminLogin);
router.get("/logout", adminLogout);
router.put("/:id/forgot-password", adminForgotPassword);

export default router;
