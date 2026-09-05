const mongoose = require("mongoose");

const timeOffTypeSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    }, // "Paid Time Off"
    unit: { 
      type: String, 
      enum: ["Days", "Hours"], 
      default: "Days"
    },
    requiresAllocation: { 
      type: Boolean, 
      default: true 
    },
    requiresApproval: { 
      type: Boolean, 
      default: true 
    },
    approverRole: { 
      type: String, 
      default: "HRManager" 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimeOffType", timeOffTypeSchema);