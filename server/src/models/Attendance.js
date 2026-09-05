const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Employee", 
      required: true 
    },
    date: { 
      type: Date, 
      required: true 
    },
    checkIn: { 
      type: Date, 
      default: null 
    },
    checkOut: { 
      type: Date, 
      default: null 
    },
    workedHours: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Half Day"],
      default: "Present",
    },
    isManualEdit: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

attendanceSchema.pre("save", function (next) {
  if (this.checkIn && this.checkOut) {
    const diffMs = new Date(this.checkOut) - new Date(this.checkIn);
    this.workedHours = Math.max(Math.round((diffMs / 1000 / 60 / 60) * 100) / 100, 0);
  }
  next();
});

// One employee shouldn't have two attendance records for the same day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);