import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import Employee from "../models/employeeModel.js";
import User from "../models/userModel.js";
import Department from "../models/departmentModel.js";

// Add new employee
export const addEmployee = expressAsyncHandler(async (req, res) => {
  // console.log("req.body:", req.body);
  // console.log("req.file:", req.file);

  try {
    const {
      name,
      email,
      password,
      dob,
      gender,
      maritalStatus,
      designation,
      department, // department name
      salary,
      role,
    } = req.body;

    // 🔍 Find department by name
    const departmentDoc = await Department.findOne({ dep_name: department });
    if (!departmentDoc) {
      return res.status(400).json({
        success: false,
        error: `Department '${department}' not found`,
      });
    }

    // 🔒 Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "Email already in use" });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    // 🖼️ Extract file data from Cloudinary
    const fileUrl = req.file.path || req.file.url;
    const public_id = req.file.public_id || req.file.filename || null;

    // 👤 Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "employee",
      profile: {
        url: fileUrl,
        public_id,
      },
    });

    const savedUser = await user.save();

    // 📅 Convert DOB
    const dobDate = dob ? new Date(dob) : null;

    // 🆔 Generate unique empId
    const empId = `${savedUser.name.replace(/\s+/g, "")}-${
      uuidv4().split("-")[0]
    }`;

    // 👨‍💼 Create employee
    const newEmployee = new Employee({
      userId: savedUser._id,
      emp_name: savedUser.name,
      empId,
      dob: dobDate,
      gender,
      maritalStatus,
      designation,
      department: departmentDoc._id, // ✅ only ObjectId
      salary,
      created_by: req.user._id, // Requires `protect` middleware
      updated_by: req.user._id, // Requires `protect` middleware
    });

    const employee = await newEmployee.save();

    if (employee) {
      return res.status(201).json({
        success: true,
        message: "Employee created successfully",
        employee,
      });
    } else {
      return res
        .status(500)
        .json({ success: false, error: "Employee creation failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Get all employees
export const getEmployee = expressAsyncHandler(async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate({
        path: "userId",
        select: "_id name email profile", // select fields from User
      })
      .populate({
        path: "department",
        select: "_id dep_name", // select fields from Department
      });

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No employees found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      totalEmployee: employees.length,
      employees,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});
// Get Employee by id
export const getEmployeeById = expressAsyncHandler(async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate({
        path: "userId",
        select: "_id name email profile role", // select fields from User
      })
      .populate({
        path: "department",
        select: "_id dep_name", // select fields from Department
      });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "No employee found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee fetched successfully",
      employee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

// Update Employee
export const updateEmployee = expressAsyncHandler(async (req, res) => {
  console.log("Update Employee Request Body:", req.body);
  try {
    const {
      name,
      maritalStatus,
      designation,
      department, // this should be a Department ObjectId or name
      salary,
    } = req.body;

    // 1. Find existing employee
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // 2. Find and update the User's name
    const user = await User.findById(employee.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Associated user not found",
      });
    }

    user.name = name || user.name;
    await user.save();
    // 🆔 Generate unique empId
    const empId = `${user.name.replace(/\s+/g, "")}-${uuidv4().split("-")[0]}`;

    // 3. (Optional) If department passed as name, resolve to ObjectId
    let deptId = department;
    if (department && isNaN(department)) {
      const deptDoc = await Department.findOne({ dep_name: department });
      if (!deptDoc) {
        return res.status(400).json({
          success: false,
          message: `Department '${department}' not found`,
        });
      }
      deptId = deptDoc._id;
    }

    // 4. Update the Employee
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        emp_name: user.name || employee.emp_name,
        empId: empId || employee.empId,
        maritalStatus: maritalStatus || employee.maritalStatus,
        designation: designation || employee.designation,
        department: deptId || employee.department,
        salary: salary || employee.salary,
      },
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(500).json({
        success: false,
        message: "Failed to update employee",
      });
    }

    // 5. Return success and updated records
    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee: updatedEmployee,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

// ✅ Get Employees by Department ID
export const getEmployeeByDepartmentId = expressAsyncHandler(async (req, res) => {
  try {
    const departmentId = req.params.id;

    // ✅ Step 1: Check if department exists (optional but good practice)
    const departmentExists = await Department.exists({ _id: departmentId });
    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // ✅ Step 2: Get employees belonging to this department
    const employees = await Employee.find({ department: departmentId }).select("emp_name empId");

    if (!employees.length) {
      return res.status(404).json({
        success: false,
        message: "No employees found for this department",
      });
    }

    // ✅ Step 3: Send response
    res.status(200).json({
      success: true,
      message: "Employees fetched successfully for the department",
      totalEmployeesDepartment: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Error fetching employees by department:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});



// Delete Employee
export const deleteEmployee = expressAsyncHandler(async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
  

    // Delete associated user
    await User.findByIdAndDelete(employee.userId);

    // delete department if no employees left
  await Department.findByIdAndDelete(employee.department);

    // Delete employee record
    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});