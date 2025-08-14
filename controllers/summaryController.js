import expressAsyncHandler from "express-async-handler";
import Employee from "../models/employeeModel.js";
import Department from "../models/departmentModel.js";
import Salary from "../models/salaryModel.js";
import Leave from "../models/leaveModel.js";

// 📊 Admin Dashboard: Full Summary
export const getSummary = expressAsyncHandler(async (req, res) => {
  try {
    const [totalEmployees, totalDepartments] = await Promise.all([
      Employee.countDocuments(),
      Department.countDocuments(),
    ]);

    const totalSalaryResult = await Employee.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$salary" } },
        },
      },
    ]);
    const totalSalary = totalSalaryResult[0]?.total || 0;

    const [employeeAppliedForLeave, leaveStatus] = await Promise.all([
      Leave.distinct("employeeId"),
      Leave.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const leaveSummary = {
      appliedFor: employeeAppliedForLeave.length,
      approved: leaveStatus.find(item => item._id === "approved")?.count || 0,
      rejected: leaveStatus.find(item => item._id === "rejected")?.count || 0,
      pending: leaveStatus.find(item => item._id === "pending")?.count || 0,
    };

    res.status(200).json({
      success: true,
      totalEmployees,
      totalDepartments,
      totalSalary,
      leaveSummary,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// 📊 Employee Dashboard: Personal Summary
export const getEmpSummary = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOne({ userId: id });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const [employeeLeaves, leaveStatus] = await Promise.all([
      Leave.find({ employeeId: employee._id }),
      Leave.aggregate([
        { $match: { employeeId: employee._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const leaveSummary = {
      appliedFor: employeeLeaves.length,
      approved: leaveStatus.find(item => item._id === "approved")?.count || 0,
      rejected: leaveStatus.find(item => item._id === "rejected")?.count || 0,
      pending: leaveStatus.find(item => item._id === "pending")?.count || 0,
    };

    res.status(200).json({
      success: true,
      leaveSummary,
    });
  } catch (error) {
    console.error("Employee summary error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
