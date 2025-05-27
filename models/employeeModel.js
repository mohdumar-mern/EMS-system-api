import mongoose from "mongoose";

const employeeSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  emp_name:{
    type: String,
    require: true
  },
  empId:{
    type: String,
     ref: "Department",
    required : true
  },
  dob: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other",],
    required: true,
  },
  maritalStatus: {
    type: String,
    enum: ["married", "single", "sivorced", "widowed"],
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
  },
  salary: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
