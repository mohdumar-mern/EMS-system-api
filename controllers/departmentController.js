import Department from "../models/departmentModel.js";
import expressAsyncHandler from "express-async-handler";
import Employee from "../models/employeeModel.js";
import Leave from "../models/LeaveModel.js";
import Salary from "../models/salaryModel.js";

// ✅ Add Department
export const addDepartment = expressAsyncHandler(async (req, res) => {
  const dep_name = req.body?.dep_name?.trim();
  const description = req.body?.description?.trim();

  if (!dep_name || !description) {
    return res.status(400).json({
      success: false,
      message: "Please provide both department name and description.",
    });
  }

  const existing = await Department.findOne({ dep_name });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "Department already exists",
    });
  }

  const department = await Department.create({
    dep_name,
    description,
    created_by: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Department added successfully",
    department,
  });
});

// ✅ Get All Departments with Search & Pagination
export const getAllDepartments = expressAsyncHandler(async (req, res) => {
  const { page = 1, limit = 6, search = "" } = req.query;
  const regex = new RegExp(search.trim(), "i");

  const query = {
    is_deleted: false,
    ...(search && {
      $or: [{ dep_name: regex }, { description: regex }],
    }),
  };

  const options = {
    page: +page,
    limit: +limit,
    lean: true,
    sort: { createdAt: -1 },
    populate: {
      path: "created_by",
      select: "name email",
    },
  };

  const result = await Department.paginate(query, options);

  if (!result?.data?.length) {
    return res.status(404).json({
      success: false,
      message: "No departments found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Departments fetched successfully",
    ...result,
  });
});

// ✅ Get Department by ID
export const getDepartmentById = expressAsyncHandler(async (req, res) => {
  const department = await Department.findOne({
    _id: req.params.id,
    is_deleted: false,
  })
    .populate("created_by", "name email")
    .lean();

  if (!department) {
    return res.status(404).json({
      success: false,
      message: "Department not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Department retrieved successfully",
    department,
  });
});

// ✅ Update Department
export const updateDepartment = expressAsyncHandler(async (req, res) => {
  const { dep_name, description } = req.body;
  const department = await Department.findById(req.params.id);

  if (!department || department.is_deleted) {
    return res.status(404).json({
      success: false,
      message: "Department not found",
    });
  }

  const trimmedName = dep_name?.trim();
  if (trimmedName && trimmedName !== department.dep_name) {
    const duplicate = await Department.findOne({ dep_name: trimmedName });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Department name already exists",
      });
    }
    department.dep_name = trimmedName;
  }

  if (description?.trim()) {
    department.description = description.trim();
  }

  department.updated_by = req.user._id;
  const updated = await department.save();

  res.status(200).json({
    success: true,
    message: "Department updated successfully",
    department: updated,
  });
});

// ✅ Soft Delete Department and Related Data
export const deleteDepartment = expressAsyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department || department.is_deleted) {
    return res.status(404).json({
      success: false,
      message: "Department not found",
    });
  }

  const employees = await Employee.find({ department: department._id }).lean();
  const empObjectIds = employees.map((emp) => emp._id);
  const empIds = employees.map((emp) => emp.empId);

  await Promise.all([
    Employee.deleteMany({ department: department._id }),
    Leave.deleteMany({ employeeId: { $in: empObjectIds } }),
    Salary.deleteMany({ employeeId: { $in: empIds } }),
  ]);

  department.is_deleted = true;
  department.updated_by = req.user._id;
  await department.save();

  res.status(200).json({
    success: true,
    message: "Department and related data deleted successfully",
  });
});

// ✅ Get All Department Names and IDs
export const getDepartmentsName = expressAsyncHandler(async (req, res) => {
  const departments = await Department.find({ is_deleted: false })
    .select("_id dep_name")
    .sort({ dep_name: 1 })
    .lean();

  if (!departments?.length) {
    return res.status(404).json({
      success: false,
      message: "No departments found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Departments fetched successfully",
    departments,
  });
});
