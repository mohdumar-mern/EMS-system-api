import expressAsyncHandler from "express-async-handler";
import Salary from "../models/salaryModel.js";
import Employee from "../models/employeeModel.js";

// ✅ Add Salary
export const addSalary = expressAsyncHandler(async (req, res) => {
  try {
    const {
      empId,
      basicSalary,
      allowances = "0",
      deductions = "0",
      payDate,
    } = req.body;

    const parsedBasic = parseInt(basicSalary) || 0;
    const parsedAllowances = parseInt(allowances) || 0;
    const parsedDeductions = parseInt(deductions) || 0;

    const totalSalary = parsedBasic + parsedAllowances - parsedDeductions;

    const salary = new Salary({
      empId,
      basicSalary: parsedBasic.toString(),
      allowances: parsedAllowances.toString(),
      deductions: parsedDeductions.toString(),
      netSalary: totalSalary.toString(),
      payDate: payDate || new Date(),
    });

    const savedSalary = await salary.save();

    res.status(201).json({
      success: true,
      message: "Salary added successfully",
      salary: savedSalary,
    });
  } catch (error) {
    console.error("Error adding salary:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// ✅ Get all Salaries
export const getSalary = expressAsyncHandler(async (req, res) => {
  try {
    const salaries = await Salary.find().populate("empId", "emp_name email");

    if (!salaries.length) {
      return res.status(404).json({
        success: false,
        message: "No salaries found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Salaries fetched successfully",
      salaries,
    });
  } catch (error) {
    console.error("Error fetching salaries:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// ✅ Get Salary by Employee ID or userId
export const getSalaryByEmpId = expressAsyncHandler(async (req, res) => {
  try {
    const paramId = req.params.empId;

    // First, try to find salary by empId (ObjectId in Salary)
    let salaries = await Salary.find({ empId: paramId })
      .sort({ payDate: -1 })
      .populate("empId", "emp_name email");

    // If not found, maybe it's a userId => find employee by userId
    if (!salaries.length) {
      const employee = await Employee.findOne({ userId: paramId });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found with this ID",
        });
      }

      // Now find salaries using employee._id
      salaries = await Salary.find({ empId: employee.empId })
        .sort({ payDate: -1 })
        .populate("empId", "emp_name email");
    }

    if (!salaries.length) {
      return res.status(404).json({
        success: false,
        message: "Salary not found for this employee",
      });
    }

    res.status(200).json({
      success: true,
      message: `Salary for employee ${paramId} retrieved successfully`,
      salaries,
    });
  } catch (error) {
    console.error("Error fetching salary by empId:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});
