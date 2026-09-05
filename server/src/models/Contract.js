const mongoose = require("mongoose");
const { getNextSequence } = require("./Counter");

const contractSchema = new mongoose.Schema(
  {
    contractNumber: { 
      type: String, 
      unique: true 
    },
    employee: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Employee", 
      required: true 
    },
    department: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Department" 
    },
    jobPosition: { 
      type: String, 
      trim: true 
    },
    startDate: { 
      type: Date, 
      required: true 
    },
    endDate: { 
      type: Date, 
      default: null 
    },
    wage: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    workingSchedule: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "WorkingSchedule" 
    },
    salaryStructure: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "SalaryStructure" 
    },
    status: {
      type: String,
      enum: ["Draft", "Active", "Expired", "Cancelled"],
      default: "Draft",
    },
  },
  { timestamps: true }
);

// Auto-generating the unique contract No.
contractSchema.pre("save", async function () {
  if (this.isNew && !this.contractNumber) {
    const year = new Date(this.startDate).getFullYear();
    const seq = await getNextSequence(`contract-${year}`);
    this.contractNumber = `CON/${year}/${String(seq).padStart(4, "0")}`;
  }
});

contractSchema.statics.findActiveForPeriod = function (employeeId, periodDate) {
  return this.findOne({
    employee: employeeId,
    status: "Active",
    startDate: { $lte: periodDate },
    $or: [{ endDate: null }, { endDate: { $gte: periodDate } }],
  }).sort({ startDate: -1 });
};

module.exports = mongoose.model("Contract", contractSchema);