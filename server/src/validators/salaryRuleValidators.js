const { z } = require("zod");

const baseShape = {
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z
    .string()
    .min(1, "Code is required")
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "Code must start with a letter/underscore and contain only letters, numbers, underscore"),
  category: z.enum(["Basic", "Allowance", "Deduction", "Gross", "Net"]),
  sequence: z.number().int().min(0),
  computeType: z.enum(["Fixed", "Percentage", "Formula"]),
  fixedAmount: z.number().optional(),
  percentageOf: z.string().optional().nullable(),
  percentageValue: z.number().optional(),
  formula: z.string().optional().nullable(),
};

function refineComputeType(data, ctx) {
  if (data.computeType === "Fixed" && (data.fixedAmount === undefined || data.fixedAmount === null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "fixedAmount is required for Fixed rules", path: ["fixedAmount"] });
  }
  if (data.computeType === "Percentage" && (!data.percentageOf || !data.percentageValue)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "percentageOf and percentageValue are required for Percentage rules", path: ["percentageOf"] });
  }
  if (data.computeType === "Formula" && !data.formula) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "formula is required for Formula rules", path: ["formula"] });
  }
}

const createSalaryRuleSchema = z.object(baseShape).superRefine(refineComputeType);

const updateSalaryRuleSchema = z.object(baseShape).partial();

module.exports = { createSalaryRuleSchema, updateSalaryRuleSchema };
