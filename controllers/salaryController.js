import expressAsyncHandler from "express-async-handler";
import Salary from "../models/salaryModel.js";
import Employee from "../models/employeeModel.js";

// ✅ Add Salary
export const addSalary = expressAsyncHandler(async (req, res) => {
  try {
    const { empId, basicSalary, allowances = "0", deductions = "0", payDate } = req.body;

    // Convert salary components to integers safely
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

    if (!salaries || salaries.length === 0) {
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

// ✅ Get Salary by Employee ID
export const getSalaryByEmpId = expressAsyncHandler(async (req, res) => {
  try {
    console.log(req.params.empId);
    const salary = await Salary.find({ empId: req.params.empId })
    .populate("empId", "emp_name email");

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary not found for this employee",
      });
    }

 
    res.status(200).json({
      success: true,
      message: `Salary for employee ${req.params.empId} retrieved successfully`,
      salary,
    });
  } catch (error) {
    console.error("Error fetching salary by empId:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});
