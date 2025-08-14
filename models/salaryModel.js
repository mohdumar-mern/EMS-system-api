import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const salarySchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    allowances: {
      type: Number,
      default: 0,
      min: 0,
    },
    deductions: {
      type: Number,
      default: 0,
      min: 0,
    },
    netSalary: {
      type: Number,
      default: 0, // Can be computed in controller before saving
    },
    payDate: {
      type: Date,
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Auto calculate net salary (basic + allowance - deductions)
// salarySchema.pre("save", function (next) {
//   this.netSalary = (this.basicSalary || 0) + (this.allowances || 0) - (this.deductions || 0);
//   next();
// });

salarySchema.plugin(mongoosePaginate);

const Salary = mongoose.model("Salary", salarySchema);
export default Salary;
