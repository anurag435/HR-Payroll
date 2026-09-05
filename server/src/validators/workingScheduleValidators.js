const { z } = require("zod");

const dayEntrySchema = z.object({
  day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "startTime must be HH:MM (24h)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "endTime must be HH:MM (24h)"),
  breakMinutes: z.number().min(0).optional(),
});

const createWorkingScheduleSchema = z.object({
  name: z.string().min(2, "Schedule name must be at least 2 characters"),
  days: z.array(dayEntrySchema).min(1, "At least one day must be defined"),
  company: z.string().optional(),
  status: z.enum(["Active", "Archived"]).optional(),
});

const updateWorkingScheduleSchema = createWorkingScheduleSchema.partial();

module.exports = { createWorkingScheduleSchema, updateWorkingScheduleSchema };