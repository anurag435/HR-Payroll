const mongoose = require("mongoose");

const dayEntrySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    startTime: { 
      type: String, 
      required: true 
    },
    endTime: { 
      type: String, 
      required: true 
    },
    breakMinutes: { 
      type: Number, 
      default: 60, 
      min: 0 
    },
  },
  { _id: false }
);

const workingScheduleSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    days: {
      type: [dayEntrySchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "A working schedule needs at least one day defined",
      },
    },
    totalWeeklyHours: { 
      type: Number, 
      default: 0 
    },
    company: { 
      type: String, 
      default: "My Company" 
    },
    status: { 
      type: String, 
      enum: ["Active", "Archived"], 
      default: "Active" 
    },
  },
  { timestamps: true }
);

function timeStringToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

workingScheduleSchema.pre("save", function () {
  const totalMinutes = this.days.reduce((sum, d) => {
    const minutes =
      timeStringToMinutes(d.endTime) - timeStringToMinutes(d.startTime) - (d.breakMinutes || 0);
    return sum + Math.max(minutes, 0);
  }, 0);
  this.totalWeeklyHours = Math.round((totalMinutes / 60) * 100) / 100;
});

module.exports = mongoose.model("WorkingSchedule", workingScheduleSchema);