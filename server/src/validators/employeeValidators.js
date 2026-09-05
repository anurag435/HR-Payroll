const { z } = require("zod");
const { zObjectId } = require("../utils/zodHelpers");

const createEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  jobPosition: z.string().optional(),
  department: zObjectId("department").optional().nullable(),
  manager: zObjectId("manager").optional().nullable(),
  workingSchedule: zObjectId("workingSchedule").optional().nullable(),
  status: z.enum(["Active", "Inactive"]).optional(),
});

const updateEmployeeSchema = createEmployeeSchema.partial();

module.exports = { createEmployeeSchema, updateEmployeeSchema };
