const { z } = require("zod");
const { zObjectId } = require("../utils/zodHelpers");

const createTimeOffTypeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  unit: z.enum(["Days", "Hours"]).optional(),
  requiresAllocation: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
  approverRole: z.string().optional(),
});
const updateTimeOffTypeSchema = createTimeOffTypeSchema.partial();

const createAllocationSchema = z
  .object({
    employee: zObjectId("employee"),
    timeOffType: zObjectId("timeOffType"),
    allocated: z.number().positive("allocated must be greater than 0"),
    validFrom: z.coerce.date(),
    validTo: z.coerce.date(),
  })
  .refine((data) => data.validTo > data.validFrom, {
    message: "validTo must be after validFrom",
    path: ["validTo"],
  });

const createTimeOffRequestSchema = z
  .object({
    employee: zObjectId("employee").optional(),
    timeOffType: zObjectId("timeOffType"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    duration: z.number().min(0.5, "duration must be at least 0.5"),
    reason: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "endDate cannot be before startDate",
    path: ["endDate"],
  });

module.exports = {
  createTimeOffTypeSchema,
  updateTimeOffTypeSchema,
  createAllocationSchema,
  createTimeOffRequestSchema,
};
