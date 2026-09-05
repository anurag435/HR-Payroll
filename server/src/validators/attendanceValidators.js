const { z } = require("zod");
const { zObjectId } = require("../utils/zodHelpers");

const manualAttendanceSchema = z.object({
  employee: zObjectId("employee"),
  date: z.coerce.date(),
  checkIn: z.coerce.date().optional().nullable(),
  checkOut: z.coerce.date().optional().nullable(),
  status: z.enum(["Present", "Absent", "Late", "Half Day"]).optional(),
});

const updateAttendanceSchema = z.object({
  checkIn: z.coerce.date().optional().nullable(),
  checkOut: z.coerce.date().optional().nullable(),
  status: z.enum(["Present", "Absent", "Late", "Half Day"]).optional(),
});

module.exports = { manualAttendanceSchema, updateAttendanceSchema };
