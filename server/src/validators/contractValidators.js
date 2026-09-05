const { z } = require("zod");
const { zObjectId } = require("../utils/zodHelpers");

const createContractSchema = z
  .object({
    employee: zObjectId("employee"),
    department: zObjectId("department").optional().nullable(),
    jobPosition: z.string().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
    wage: z.number().positive("Wage must be greater than 0"),
    workingSchedule: zObjectId("workingSchedule").optional().nullable(),
    salaryStructure: zObjectId("salaryStructure").optional().nullable(),
    status: z.enum(["Draft", "Active", "Expired", "Cancelled"]).optional(),
  })
  .refine((data) => !data.endDate || data.endDate > data.startDate, {
    message: "endDate must be after startDate",
    path: ["endDate"],
  });

const updateContractSchema = z
  .object({
    department: zObjectId("department").optional().nullable(),
    jobPosition: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional().nullable(),
    wage: z.number().positive("Wage must be greater than 0").optional(),
    workingSchedule: zObjectId("workingSchedule").optional().nullable(),
    salaryStructure: zObjectId("salaryStructure").optional().nullable(),
    status: z.enum(["Draft", "Active", "Expired", "Cancelled"]).optional(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate > data.startDate, {
    message: "endDate must be after startDate",
    path: ["endDate"],
  });

module.exports = { createContractSchema, updateContractSchema };
