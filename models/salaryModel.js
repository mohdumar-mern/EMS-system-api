import mongoose from "mongoose";

const salarySchme = new mongoose.Schema(
  {
   empId: {
  type: String,
  required: true
},
    basicSalary: {
      type: String,
      required: true,
    },
    allowances: {
      type: String,
    },
    deductions: {
      type: String,
    },
    netSalary: {
      type: String,
    },
    payDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

const Salary = mongoose.model("Salary", salarySchme);
export default Salary;
