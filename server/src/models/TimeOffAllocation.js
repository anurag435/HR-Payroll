const mongoose = require("mongoose");

const timeOffAllocationSchema = new mongoose.Schema(
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
    allocated: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    used: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    validFrom: { 
      type: Date, 
      required: true 
    },
    validTo: { 
      type: Date, 
      required: true 
    },
  },
  { timestamps: true }
);

timeOffAllocationSchema.virtual("remaining").get(function () {
  return this.allocated - this.used;
});
timeOffAllocationSchema.set("toJSON", { virtuals: true });
timeOffAllocationSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("TimeOffAllocation", timeOffAllocationSchema);
