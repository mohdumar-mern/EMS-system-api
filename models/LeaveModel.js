// ✅ Mongoose Leave Schema Analysis and Fixes

import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

/**
 * Leave Schema:
 * Tracks employee leave requests with validations, approval workflow, and soft deletion.
 */
const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      required: true,
      enum: ["casual", "sick", "maternity"],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return this.startDate <= value;
        },
        message: "End date must be after start date",
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

leaveSchema.plugin(mongoosePaginate);
leaveSchema.index({ employeeId: 1, status: 1, startDate: -1 });

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;

