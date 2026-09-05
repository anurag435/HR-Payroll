const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { verifyJWT, requireRole } = require("../middleware/auth");
const { ROLE_GROUPS } = require("../constants/roles");
const { createSalaryStructureSchema, updateSalaryStructureSchema } = require("../validators/salaryStructureValidators");
const controller = require("../controllers/salaryStructureController");

const router = express.Router();

router.use(verifyJWT);
router.use(requireRole(ROLE_GROUPS.PAYROLL_CONFIG));

router.get("/", asyncHandler(controller.listSalaryStructures));
router.get("/:id", asyncHandler(controller.getSalaryStructureById));
router.post("/", validate(createSalaryStructureSchema), asyncHandler(controller.createSalaryStructure));
router.patch("/:id", validate(updateSalaryStructureSchema), asyncHandler(controller.updateSalaryStructure));

module.exports = router;
