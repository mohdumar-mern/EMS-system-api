import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    
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
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default:"pending"
    },
    description: {
        type: String,
        required: true,
    },
},
{
    timestamps: true,
});

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;