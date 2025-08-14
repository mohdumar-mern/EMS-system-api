import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

/**
 * Employee Schema
 * Represents individual employees with links to Department & User
 */
const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    emp_name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    empId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true, // 🔍 often queried or used to join
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    maritalStatus: {
      type: String,
      enum: ["married", "single", "divorced", "widowed"],
      required: true,
    },
    designation: {
      type: String,
      enum: ["manager", "developer", "designer", "tester", "hr", "other"],
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // auto-manage createdAt and updatedAt
    versionKey: false,
  }
);

// 🔌 Enable pagination plugin
employeeSchema.plugin(mongoosePaginate);

// 🔍 Optional: compound indexes (empId + department for some orgs)
employeeSchema.index({ empId: 1, department: 1 }, { unique: true });

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
