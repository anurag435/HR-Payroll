const mongoose = require("mongoose");

const payslipLineSchema = new mongoose.Schema(
  {
    code: { 
      type: String, 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    category: { 
      type: String, 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true 
    },
  },
  { _id: false }
);

const payslipSchema = new mongoose.Schema(
  {
    payrun: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Payrun", 
      required: true 
    },
    employee: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Employee", 
      required: true 
    },
    contract: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Contract", 
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
    lines: [payslipLineSchema],
    gross: { 
      type: Number, 
      default: 0 
    },
    net: { 
      type: Number, 
      default: 0 
    },
    status: {
      type: String,
      enum: ["Draft", "Computed", "Validated", "Paid"],
      default: "Draft",
    },
    warnings: [{ type: String }],
  },
  { timestamps: true }
);

// A given employee should only have ONE payslip per Payrun.
payslipSchema.index({ payrun: 1, employee: 1 }, { unique: true });

module.exports = mongoose.model("Payslip", payslipSchema);