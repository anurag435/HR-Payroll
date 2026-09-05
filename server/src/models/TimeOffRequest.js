const mongoose = require("mongoose");

const timeOffRequestSchema = new mongoose.Schema(
  {
    employee: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Employee", 
      required: true 
    },
    timeOffType: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "TimeOffType", 
      required: true 
    },
    startDate: { 
      type: Date, 
      required: true 
    },
    endDate: { 
      type: Date, 
      required: true 
    },
    duration: { 
      type: Number, 
      required: true, 
      min: 0.5 
    },
    reason: { 
      type: String, 
      trim: true 
    },
    status: {
      type: String,
      enum: ["To Approve", "Approved", "Refused"],
      default: "To Approve",
    },
    approvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: null 
    },
  },
  { timestamps: true }
);

timeOffRequestSchema.pre("validate", function () {
  if (this.endDate < this.startDate) {
    throw new Error("endDate cannot be before startDate");
  }
});

module.exports = mongoose.model("TimeOffRequest", timeOffRequestSchema);