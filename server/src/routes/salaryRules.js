const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { verifyJWT, requireRole } = require("../middleware/auth");
const { ROLE_GROUPS } = require("../constants/roles");
const { createSalaryRuleSchema, updateSalaryRuleSchema } = require("../validators/salaryRuleValidators");
const controller = require("../controllers/salaryRuleController");

const router = express.Router();

router.use(verifyJWT);
router.use(requireRole(ROLE_GROUPS.PAYROLL_CONFIG));

router.get("/", asyncHandler(controller.listSalaryRules));
router.get("/:id", asyncHandler(controller.getSalaryRuleById));
router.post("/", validate(createSalaryRuleSchema), asyncHandler(controller.createSalaryRule));
router.patch("/:id", validate(updateSalaryRuleSchema), asyncHandler(controller.updateSalaryRule));
router.delete("/:id", asyncHandler(controller.deleteSalaryRule));

module.exports = router;
