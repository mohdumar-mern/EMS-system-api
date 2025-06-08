import Department from "../models/departmentModel.js";
import expressAsyncHandler from "express-async-handler";
import Employee from "../models/employeeModel.js";
import Leave from "../models/LeaveModel.js";
import Salary from "../models/salaryModel.js";

// Add department
export const addDepartment = expressAsyncHandler(async (req, res) => {
  const { dep_name, description } = req.body;

  if (!dep_name || !description) {
    return res.status(400).json({
      success: false,
      message: "Please provide both department name and description.",
    });
  }

  const department = new Department({
    dep_name,
    description,
    created_by: req.user._id,
  });

  const result = await department.save();

  res.status(201).json({
    success: true,
    message: "Department added successfully",
    department: result,
  });
});

// Get all departments
export const getAllDepartments = expressAsyncHandler(async (req, res) => {
  const departments = await Department.find().populate("created_by", "name email");

  if (!departments.length) {
    return res.status(404).json({
      success: false,
      message: "No departments found",
    });
  }

  res.json({
    success: true,
    message: "Departments retrieved successfully",
    departments,
  });
});

// Get single department by ID
export const getDepartmentById = expressAsyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id).populate("created_by", "name email");

  if (!department) {
    return res.status(404).json({
      success: false,
      message: "Department not found",
    });
  }

  res.json({
    success: true,
    message: "Department retrieved successfully",
    department,
  });
});

// Update department by ID
export const updateDepartment = expressAsyncHandler(async (req, res) => {
  const { dep_name, description } = req.body;

  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { dep_name, description },
    { new: true, runValidators: true }
  );

  if (!department) {
    return res.status(404).json({
      success: false,
      message: "Department not found",
    });
  }

  res.json({
    success: true,
    message: "Department updated successfully",
    department,
  });
});

// Delete department by ID
export const deleteDepartment = expressAsyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    return res.status(404).json({
      success: false,
      message: "Department not found",
    });
  }

  // Find all employees in this department
  const employees = await Employee.find({ department: department._id });
  const employeeIds = employees.map((emp) => emp._id);
  const empIds = employees.map((emp) => emp.empId); // assuming `empId` is different from `_id`

  // Delete related records
  await Employee.deleteMany({ department: department._id });
  await Leave.deleteMany({ employeeId: { $in: employeeIds } });
  await Salary.deleteMany({ employeeId: { $in: empIds } });

  // Delete the department itself
  await department.deleteOne();

  res.json({
    success: true,
    message: "Department and related records deleted successfully",
  });
});
