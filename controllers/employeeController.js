import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import Employee from "../models/employeeModel.js";
import User from "../models/userModel.js";
import Department from "../models/departmentModel.js";
import { logError } from "../utils/logger.js";

// ➕ Add new employee
export const addEmployee = expressAsyncHandler(async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
      role = "employee",
    } = req.body;

    if (!req.file?.path && !req.file?.url) {
      return res.status(400).json({ success: false, error: "No profile image uploaded" });
    }

    const [existingUser, departmentDoc] = await Promise.all([
      User.findOne({ email }),
      Department.findOne({ dep_name: department }),
    ]);

    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email already in use" });
    }

    if (!departmentDoc) {
      return res.status(400).json({ success: false, error: `Department '${department}' not found` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fileUrl = req.file.path || req.file.url;
    const public_id = req.file.public_id || req.file.filename || null;

    const user = await new User({
      name,
      email,
      password: hashedPassword,
      role,
      profile: { url: fileUrl, public_id },
    }).save();

    const empId = `${user.name.replace(/\s+/g, "")}-${uuidv4().split("-")[0]}`;
    const dobDate = dob ? new Date(dob) : null;

    const employee = await new Employee({
      userId: user._id,
      emp_name: user.name,
      empId,
      dob: dobDate,
      gender,
      maritalStatus,
      designation,
      department: departmentDoc._id,
      salary,
      created_by: req.user._id,
    }).save();

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    logError(error, "Add Employee");
    next(error); // Pass error to express-async-handler/global error handler
  }
});

// 📄 Get all employees
export const getEmployee = expressAsyncHandler(async (req, res) => {
  const { page = 1, limit = 6, search = "" } = req.query;

  const options = {
    page: +page,
    limit: +limit,
    lean: true,
    populate: [
      { path: "userId", select: "_id name email profile" },
      { path: "department", select: "_id dep_name" },
      { path: "created_by", select: "_id name email" },
    ],
    sort: { createdAt: -1 },
  };

  const query = {};
  if (search?.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [
      { emp_name: regex },
      { empId: regex },
      { designation: regex },
      { salary: regex },
      { gender: regex },
      { maritalStatus: regex },
    ];
  }

  const employees = await Employee.paginate(query, options);

  if (!employees?.data?.length) {
    return res.status(404).json({ success: false, message: "No employees found" });
  }

  res.status(200).json({
    success: true,
    message: "Employees fetched successfully",
    ...employees,
  });
});

// 🔍 Get employee by ID
export const getEmployeeById = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  let employee = await Employee.findById(id)
    .populate("userId", "_id name email profile role")
    .populate("department", "_id dep_name");

  if (!employee) {
    employee = await Employee.findOne({ userId: id })
      .populate("userId", "_id name email profile role")
      .populate("department", "_id dep_name");
  }

  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }

  res.status(200).json({
    success: true,
    message: "Employee fetched successfully",
    employee,
  });
});

// ✏️ Update employee
export const updateEmployee = expressAsyncHandler(async (req, res) => {
  const { name, maritalStatus, designation, department, salary, role } = req.body;
  const { id } = req.params;

  const employee = await Employee.findById(id);
  if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

  const user = await User.findById(employee.userId);
  if (!user) return res.status(404).json({ success: false, message: "Associated user not found" });

  user.name = name || user.name;
  user.role = role || user.role;
  await user.save();

  const empId = `${user.name.replace(/\s+/g, "")}-${uuidv4().split("-")[0]}`;

  let deptId = department;
  if (department && isNaN(department)) {
    const deptDoc = await Department.findOne({ dep_name: department });
    if (!deptDoc) {
      return res.status(400).json({ success: false, message: `Department '${department}' not found` });
    }
    deptId = deptDoc._id;
  }

  const updatedEmployee = await Employee.findByIdAndUpdate(
    id,
    {
      emp_name: user.name,
      empId,
      maritalStatus: maritalStatus || employee.maritalStatus,
      designation: designation || employee.designation,
      department: deptId || employee.department,
      salary: salary || employee.salary,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Employee updated successfully",
    employee: updatedEmployee,
  });
});

// 🏢 Get Employees by Department
export const getEmployeeByDepartmentId = expressAsyncHandler(async (req, res) => {
  const departmentId = req.params.id;

  const exists = await Department.exists({ _id: departmentId });
  if (!exists) {
    return res.status(404).json({ success: false, message: "Department not found" });
  }

  const employees = await Employee.find({ department: departmentId }).select("emp_name empId");
  if (!employees.length) {
    return res.status(404).json({ success: false, message: "No employees found for this department" });
  }

  res.status(200).json({
    success: true,
    message: "Employees fetched successfully",
    totalEmployeesDepartment: employees.length,
    employees,
  });
});

// 🗑️ Delete employee
export const deleteEmployee = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  const employee = await Employee.findById(id);
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }

  await Promise.all([
    User.findByIdAndDelete(employee.userId),
    Employee.findByIdAndDelete(id),
  ]);

  const remaining = await Employee.find({ department: employee.department });
  if (remaining.length === 0) {
    await Department.findByIdAndDelete(employee.department);
  }

  res.status(200).json({
    success: true,
    message: "Employee and associated user deleted successfully",
  });
});
