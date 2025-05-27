import expressAsyncHandler from "express-async-handler";
import Salary from "../models/salaryModel.js";

export const addSalary = expressAsyncHandler(async (req, res) => {
  try {
    const { empId, basicSalary, allowances, deductions, payDate } = req.body;

    // ✅ Fix typo: pasrseInt → parseInt
    const totalSalary =
      parseInt(basicSalary) + parseInt(allowances) - parseInt(deductions);

    // Create Salary Document
    const salary = new Salary({
      empId,
      basicSalary,
      allowances,
      deductions,
      netSalary: totalSalary,
      payDate,
    });

    const savedSalary = await salary.save(); // ✅ Await the save()

    // ✅ Success response
    res.status(201).json({
      success: true,
      message: "Salary added successfully",
      salary: savedSalary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

// get Salary
export const getSalary = expressAsyncHandler(async (req, res) => {
  try {
    const slaraies = await Salary.find();
    if (!slaraies || !slaraies.length === 0) {
      return rs
        .status(404)
        .json({ success: true, message: "Salray not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "get all Salaries", salary: slaraies });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

// get Salary by empId
export const getSalaryByEmpId = expressAsyncHandler(async (req, res) => {
  try {
    const salary = await Salary.findOne({empId: req.params.empId})
    if (!salary ) {
      return rs
        .status(404)
        .json({ success: true, message: "Salray not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: `get ${req.params.empId} Salary`, salary });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});
