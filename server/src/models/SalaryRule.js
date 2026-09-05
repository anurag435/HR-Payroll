const mongoose = require("mongoose");

const salaryRuleSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    code: { 
      type: String, 
      required: true, 
      unique: true, 
      uppercase: true, 
      trim: true 
    },
    category: {
      type: String,
      enum: ["Basic", "Allowance", "Deduction", "Gross", "Net"],
      required: true,
    },
    sequence: { 
      type: Number, 
      required: true 
    },

    computeType: {
      type: String,
      enum: ["Fixed", "Percentage", "Formula"],
      required: true,
    },

    // used when computeType === "Fixed"
    fixedAmount: { 
      type: Number, 
      default: 0 
    },

    // used when computeType === "Percentage"
    // percentageOf references another rule's `code` (or "CONTRACT_WAGE")
    percentageOf: { 
      type: String, 
      default: null, 
      uppercase: true 
    },
    percentageValue: { 
      type: Number, 
      default: 0 
    },

    formula: { 
      type: String, 
      default: null 
    },
  },
  { timestamps: true }
);

// Guard against inconsistent config at the data layer, not just the UI
salaryRuleSchema.pre("validate", function (next) {
  if (this.computeType === "Percentage" && (!this.percentageOf || !this.percentageValue)) {
    return next(new Error("Percentage rules require percentageOf and percentageValue"));
  }
  if (this.computeType === "Formula" && !this.formula) {
    return next(new Error("Formula rules require a formula string"));
  }
  if (this.computeType === "Fixed" && this.fixedAmount == null) {
    return next(new Error("Fixed rules require a fixedAmount"));
  }
  next();
});

module.exports = mongoose.model("SalaryRule", salaryRuleSchema);