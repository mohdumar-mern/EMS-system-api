import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

/**
 * Department Schema
 * Represents an organizational department.
 */
const departmentSchema = new mongoose.Schema(
  {
    dep_name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      unique: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    is_deleted: {
      type: Boolean,
      default: false,
      index: true, // 🔍 useful for soft delete queries
    },
  },
  {
    timestamps: true,
    versionKey: false, // 🛡️ disable __v field
  }
);

// ✅ Compound index to prevent duplicates and optimize queries
// departmentSchema.index({ dep_name: 1 }, { unique: true });

// 🔌 Plugins
departmentSchema.plugin(mongoosePaginate);

// 🚀 Optional: Configure default pagination behavior globally
mongoosePaginate.paginate.options = {
  lean: true,
  leanWithId: false,
  limit: 10,
  customLabels: {
    docs: "data",
    totalDocs: "total",
    limit: "limit",
    page: "page",
    totalPages: "totalPages",
    nextPage: "next",
    prevPage: "prev",
  },
};

const Department = mongoose.model("Department", departmentSchema);
export default Department;
