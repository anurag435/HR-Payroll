const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { verifyJWT, requireRole } = require("../middleware/auth");
const { ROLE_GROUPS } = require("../constants/roles");
const { createSalaryStructureSchema, updateSalaryStructureSchema } = require("../validators/salaryStructureValidators");
const controller = require("../controllers/salaryStructureController");

const router = express.Router();

router.use(verifyJWT);

router.get("/", requireRole(ROLE_GROUPS.PAYROLL_STAFF), asyncHandler(controller.listSalaryStructures));
router.get("/:id", requireRole(ROLE_GROUPS.PAYROLL_STAFF), asyncHandler(controller.getSalaryStructureById));

router.post(
  "/",
  requireRole(ROLE_GROUPS.PAYROLL_CONFIG),
  validate(createSalaryStructureSchema),
  asyncHandler(controller.createSalaryStructure)
);
router.patch(
  "/:id",
  requireRole(ROLE_GROUPS.PAYROLL_CONFIG),
  validate(updateSalaryStructureSchema),
  asyncHandler(controller.updateSalaryStructure)
);

module.exports = router;