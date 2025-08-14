import Leave from "../models/leaveModel.js";
import expressAsyncHandler from "express-async-handler";
import Employee from "../models/employeeModel.js";
import mongoose from "mongoose";

// ✅ Add new leave request (Employee)
export const addLeave = expressAsyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, description } = req.body;

  if (!leaveType || !startDate || !endDate || !description) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  const employee = await Employee.findOne({ userId: req.user._id });
  if (!employee) {
    return res.status(404).json({ success: false, error: "Employee not found" });
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({ success: false, error: "Invalid date range" });
  }

  const overlappingLeave = await Leave.findOne({
    employeeId: employee._id,
    is_deleted: false,
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
    ],
  });

  if (overlappingLeave) {
    return res.status(409).json({ success: false, error: "Overlapping leave already exists" });
  }

  const newLeave = new Leave({
    employeeId: employee._id,
    leaveType,
    startDate,
    endDate,
    description,
  });

  await newLeave.save();
  res.status(201).json({ success: true, data: newLeave });
});

// ✅ Get all leaves for a specific userId (Employee view)
export const getEmployeeLeaves = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: "Invalid user ID" });
  }

  const employee = await Employee.findOne({ userId: id });
  if (!employee) {
    return res.status(404).json({ success: false, error: "Employee not found" });
  }

  const leaves = await Leave.find({
    employeeId: employee._id,
    is_deleted: false,
  }).populate({
    path: "employeeId",
    select: "emp_name empId designation department",
    populate: { path: "department", select: "dep_name" },
  });

  res.status(200).json({ success: true, data: leaves });
});

// ✅ Admin: Get all leave requests with pagination + optional search
export const getEmployeesLeavesAdmin = expressAsyncHandler(async (req, res) => {
  const { page = 1, limit = 6, search = "" } = req.query;

  const query = { is_deleted: false };
  if (search) {
    query.$or = [
      { leaveType: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }



  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    lean: true,
    populate: {
      path: "employeeId",
      select: "emp_name empId designation department",
      populate: { path: "department", select: "dep_name" },
    },
  };

  const leaves = await Leave.paginate(query, options);


  if (!leaves) {
    return res.status(404).json({ success: false, message: "No leaves found" });
  }

  res.status(200).json({
    success: true,
    from: "db",
    data: leaves.data,
    totalDocs: leaves.totalDocs,
    limit: leaves.limit,
    totalPages: leaves.totalPages,
    currentPage: leaves.page,
    pagingCounter: leaves.pagingCounter,
    hasPrevPage: leaves.hasPrevPage,
    hasNextPage: leaves.hasNextPage,
    prevPage: leaves.prevPage,
    nextPage: leaves.nextPage,
  });
});

// ✅ Admin: Get single leave by ID
export const getSingleLeaveById = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid leave ID" });
  }

  const leave = await Leave.findById(id).populate({
    path: "employeeId",
    select: "emp_name userId empId designation department",
    populate: [
      { path: "userId", select: "profile email" },
      { path: "department", select: "dep_name" },
    ],
  });

  if (!leave || leave.is_deleted) {
    return res.status(404).json({ success: false, message: "Leave not found" });
  }

  res.status(200).json({ success: true, data: leave });
});

// ✅ Admin: Approve or Reject Leave
export const updateLeaveStatus = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid leave ID" });
  }

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value" });
  }

  const updatedLeave = await Leave.findByIdAndUpdate(
    id,
    { status, approved_by: req.user._id },
    { new: true }
  );

  if (!updatedLeave || updatedLeave.is_deleted) {
    return res.status(404).json({ success: false, message: "Leave not found" });
  }

  res.status(200).json({
    success: true,
    message: `Leave ${status}`,
    data: updatedLeave,
  });
});

// ✅ Admin/HR: Get leaves by employeeId
export const getEmployeeLeavesByEmpId = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid employee ID" });
  }

  const leaves = await Leave.find({
    employeeId: id,
    is_deleted: false,
  }).populate({
    path: "employeeId",
    select: "emp_name empId designation department",
    populate: { path: "department", select: "dep_name" },
  });

  if (!leaves.length) {
    return res.status(404).json({ success: false, message: "No leaves found" });
  }

  res.status(200).json({ success: true, data: leaves });
});
