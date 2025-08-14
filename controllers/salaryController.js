import expressAsyncHandler from "express-async-handler";
import Salary from "../models/salaryModel.js";
import Employee from "../models/employeeModel.js";

// ✅ Add Salary
export const addSalary = expressAsyncHandler(async (req, res) => {
  const {
    employeeId,
    basicSalary,
    allowances = 0,
    deductions = 0,
    payDate,
  } = req.body;

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: "Employee not found",
    });
  }

  const parsedBasic = Number(basicSalary) || 0;
  const parsedAllowances = Number(allowances) || 0;
  const parsedDeductions = Number(deductions) || 0;

  const totalSalary = parsedBasic + parsedAllowances - parsedDeductions;

  const salary = new Salary({
    employeeId,
    basicSalary: parsedBasic,
    allowances: parsedAllowances,
    deductions: parsedDeductions,
    netSalary: totalSalary,
    payDate: payDate || new Date(),
  });

  const savedSalary = await salary.save();

  res.status(201).json({
    success: true,
    message: "Salary added successfully",
    salary: savedSalary,
  });
});

// ✅ Get All Salaries with Pagination + Search
export const getSalary = expressAsyncHandler(async (req, res) => {
  const { page = 1, limit = 6, search = "" } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    lean: true,
    populate: {
      path: "employeeId",
      select: "emp_name empId designation department",
      populate: { path: "department", select: "dep_name" },
    },
    sort: { payDate: -1 },
  };

  let query = {};

  if (search) {
    const employees = await Employee.find({
      emp_name: { $regex: search, $options: "i" },
    }).select("_id");

    const empIds = employees.map(emp => emp._id);
    query = { employeeId: { $in: empIds } };
  }

  const salaries = await Salary.paginate(query, options);

  if (!salaries || salaries.data.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No salaries found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Salaries fetched successfully",
    ...salaries,
  });
});

// ✅ Get Salary by EmployeeId or UserId
export const getSalaryByEmpId = expressAsyncHandler(async (req, res) => {
  const { empId } = req.params;

  let employee = await Employee.findById(empId);

  // If not found by Employee ID, try userId
  if (!employee && empId.match(/^[0-9a-fA-F]{24}$/)) {
    employee = await Employee.findOne({ userId: empId });
  }

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: "Employee not found",
    });
  }

  const salaries = await Salary.find({ employeeId: employee._id })
    .sort({ payDate: -1 })
    .populate({
      path: "employeeId",
      select: "emp_name empId designation department",
      populate: { path: "department", select: "dep_name" },
    });

  if (!salaries.length) {
    return res.status(404).json({
      success: false,
      message: "No salaries found for this employee",
    });
  }

  res.status(200).json({
    success: true,
    message: "Salary records fetched successfully",
    salaries,
  });
});
