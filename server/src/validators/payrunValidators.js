const { z } = require("zod");
const { zObjectId } = require("../utils/zodHelpers");

const createPayrunSchema = z
  .object({
    label: z.string().min(2, "Label must be at least 2 characters"),
    period: z.object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    }),
    salaryStructure: zObjectId("salaryStructure"),
    employees: z.array(zObjectId("employees")).min(1, "Select at least one employee"),
  })
  .refine((data) => data.period.endDate > data.period.startDate, {
    message: "period.endDate must be after period.startDate",
    path: ["period", "endDate"],
  });

module.exports = { createPayrunSchema };
