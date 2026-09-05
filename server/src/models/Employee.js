const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    phone: { 
      type: String, 
      trim: true 
    },
    photoUrl: { 
      type: String, 
      default: null 
    },
    jobPosition: { 
      type: String, 
      trim: true 
    },
    department: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Department" 
    },
    manager: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Employee", 
      default: null 
    },
    workingSchedule: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "WorkingSchedule" 
    },
    status: { 
      type: String, 
      enum: ["Active", "Inactive"], 
      default: "Active" 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);