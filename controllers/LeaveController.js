// controllers/leaveController.js
import Leave from "../models/LeaveModel.js";
import expressAsyncHandler from "express-async-handler";
import Employee from "../models/employeeModel.js";

// ✅ Add new leave request
export const addLeave = expressAsyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, description } = req.body;

  const employee = await Employee.findOne({ userId: req.user._id });
  if (!employee) {
    return res
      .status(404)
      .json({ success: false, error: "Employee not found" });
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid date range" });
  }

  const newLeave = new Leave({
    employeeId: employee._id,
    leaveType,
    startDate,
    endDate,
    description,
    status: "pending",
  });

  await newLeave.save();
  res.status(201).json({ success: true, data: newLeave });
});

// ✅ Get all leaves for an authenticated employee
export const getEmployeeLeaves = expressAsyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ userId: req.user._id });
  if (!employee) {
    return res
      .status(404)
      .json({ success: false, error: "Employee not found" });
  }

  const leaves = await Leave.find({ employeeId: employee._id }).populate({
    path: "employeeId",
    select: "emp_name empId designation department",
    populate: { path: "department", select: "dep_name" },
  });

  res.status(200).json({ success: true, data: leaves });
});

// ✅ Get all employee leaves (admin)
export const getEmployeesLeaves = expressAsyncHandler(async (req, res) => {
  const leaves = await Leave.find().populate({
    path: "employeeId",
    select: "emp_name empId designation department",
    populate: { path: "department", select: "dep_name" },
  });

  if (!leaves.length) {
    return res.status(404).json({ success: false, message: "No leaves found" });
  }

  res.status(200).json({ success: true, data: leaves });
});

// ✅ Get single leave by ID
export const getSingleLeaveById = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid leave ID" });
  }

  const leave = await Leave.findById(id).populate({
    path: "employeeId",
    select: "emp_name userId empId designation department",
    populate: [
      { path: "userId", select: "profile email" },
      { path: "department", select: "dep_name" },
    ],
  });

  if (!leave) {
    return res.status(404).json({ success: false, message: "Leave not found" });
  }

  res.status(200).json({ success: true, data: leave });
});

// ✅ Update leave status (approve/reject)
export const updateLeaveStatus = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid status value" });
  }

  const updatedLeave = await Leave.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!updatedLeave) {
    return res.status(404).json({ success: false, message: "Leave not found" });
  }

  res.status(200).json({
    success: true,
    message: `Leave ${status === "approved" ? "approved" : "rejected"}`,
    data: updatedLeave,
  });
});

// ✅ Get all leaves for an employee by ID
export const getEmployeeLeavesByEmpId = expressAsyncHandler(
  async (req, res) => {
    const { id } = req.params;
    console.log(id)

    const leaves = await Leave.find({ employeeId: id }).populate({
      path: "employeeId",
      select: "emp_name empId designation department",
      populate: { path: "department", select: "dep_name" },
    });

    if (!leaves.length) {
      return res.status(404).json({ success: false, message: "No leaves found" });
    }

    res.status(200).json({ success: true, data: leaves });
  }
);
