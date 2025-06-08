import mongoose from "mongoose";
import Employee from "./employeeModel.js";
import Leave from "./LeaveModel.js";
import Salary from "./salaryModel.js";

const departmentSchema = new mongoose.Schema(
  {
    dep_name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

// departmentSchema.pre(
//   "deleteOne",
//   { document: true, query: true },
//   async (next) => {
//    try {
//     const employee = Employee.find({ department: this._id });
//     const employeeIds = employee.map((emp) => emp._id);
//     const empIds = employee.map((emp) => emp.empId);

//     await Employee.deleteMany({ department: this._id });
//     await Leave.deleteMany({ employeeId: { $in: empIds } });
//     await Salary.deleteMany({ employeeId: { $in: employeeIds } });
//     next();
//    } catch (error) {
//     console.log(error)
//    }
//   }
// );
const Department = mongoose.model("Department", departmentSchema);

export default Department;
