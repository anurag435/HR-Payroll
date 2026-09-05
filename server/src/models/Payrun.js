const mongoose = require("mongoose");

const payrunSchema = new mongoose.Schema(
  {
    
    label: { 
      type: String, 
      required: true 
    },
    period: {
      startDate: { 
        type: Date, 
        required: true 
      },
      endDate: { 
        type: Date, 
        required: true 
      },
    },
    salaryStructure: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "SalaryStructure", 
      required: true 
    },

    employees: [
      {   
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Employee" 
      }
    ],

    status: {
      type: String,
      enum: ["Draft", "Processing", "Validated", "Paid"],
      default: "Draft",
    },
    warnings: [{ type: String }],
  },
  { timestamps: true }
);

payrunSchema.pre("validate", function (next) {
  if (!this.employees || this.employees.length === 0) {
    return next(new Error("A Payrun must include at least one employee"));
  }
  next();
});

module.exports = mongoose.model("Payrun", payrunSchema);
