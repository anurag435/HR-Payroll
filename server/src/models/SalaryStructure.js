const mongoose = require("mongoose");

const salaryStructureSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    },
    rules: [{ type: mongoose.Schema.Types.ObjectId, ref: "SalaryRule" }],
    company: { 
      type: String, 
      default: "My Company" 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalaryStructure", salaryStructureSchema);
