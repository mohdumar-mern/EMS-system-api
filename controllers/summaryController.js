import expressAsyncHandler from "express-async-handler";

import Employee from "../models/employeeModel.js";
import Department from "../models/departmentModel.js";
import Salary from "../models/salaryModel.js";
import Leave from "../models/LeaveModel.js";

export const getSummary = expressAsyncHandler(async (req, res) => {
  const totalEmployees = await Employee.countDocuments();
  const totalDepartments = await Department.countDocuments();

  const totalSalary = await Employee.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: { $toDouble: "$salary" } },
      },
    },
  ]);

  const employeeAppliedForLeave = await Leave.distinct("employeeId");

  const leaveStatus = await Leave.aggregate([
    {
      $group: {
        _id: "$status", // Correct grouping key
        count: { $sum: 1 },
      },
    },
  ]);

  const leaveSummary = {
    appliedFor: employeeAppliedForLeave.length,
    approved:
      leaveStatus.find((item) => item._id === "approved")?.count || 0,
    rejected:
      leaveStatus.find((item) => item._id === "rejected")?.count || 0,
    pending:
      leaveStatus.find((item) => item._id === "pending")?.count || 0,
  };

  return res.status(200).json({
    totalEmployees,
    totalDepartments,
    totalSalary: totalSalary[0]?.total || 0,
    leaveSummary,
  });
});
