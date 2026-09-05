const { z } = require("zod");
const { zObjectId } = require("../utils/zodHelpers");

const createSalaryStructureSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  rules: z.array(zObjectId("rules")).optional(),
  company: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateSalaryStructureSchema = createSalaryStructureSchema.partial();

module.exports = { createSalaryStructureSchema, updateSalaryStructureSchema };
