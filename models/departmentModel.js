import mongoose from "mongoose";

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

// Optional: Add index to dep_name if frequently searched
// departmentSchema.index({ dep_name: 1 });

const Department = mongoose.model("Department", departmentSchema);

export default Department;
