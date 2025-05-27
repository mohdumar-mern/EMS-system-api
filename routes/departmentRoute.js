import express from "express";

const router = express.Router();

import {
  addDepartment,
  getDepartmentById,
  deleteDepartment,
  updateDepartment,
  getAllDepartments,
} from "../controllers/departmentController.js";

import { adminOnly, protect } from "../middlewares/authMiddleware.js";

router.route("/").post(protect, adminOnly, addDepartment);
router.route("/").get(getAllDepartments);
router.route("/:id/view").get(protect, adminOnly, getDepartmentById);
router.route("/:id/delete").delete(protect, adminOnly, deleteDepartment);
router.route("/:id/edit").put(protect, adminOnly, updateDepartment);

export default router;
