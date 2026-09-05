const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { verifyJWT, requireRole, requireSelfOrRole } = require("../middleware/auth");
const { ROLE_GROUPS } = require("../constants/roles");
const { createEmployeeSchema, updateEmployeeSchema } = require("../validators/employeeValidators");
const employeeController = require("../controllers/employeeController");

const router = express.Router();

router.use(verifyJWT);

router.get("/me", asyncHandler(employeeController.getMyProfile));

router.get("/", requireRole(ROLE_GROUPS.HR_STAFF), asyncHandler(employeeController.listEmployees));

router.get(
  "/:id",
  requireSelfOrRole("id", ROLE_GROUPS.HR_STAFF),
  asyncHandler(employeeController.getEmployeeById)
);

router.post(
  "/",
  requireRole(ROLE_GROUPS.HR_STAFF),
  validate(createEmployeeSchema),
  asyncHandler(employeeController.createEmployee)
);

router.patch(
  "/:id",
  requireRole(ROLE_GROUPS.HR_STAFF),
  validate(updateEmployeeSchema),
  asyncHandler(employeeController.updateEmployee)
);

router.patch(
  "/:id/archive",
  requireRole(ROLE_GROUPS.HR_STAFF),
  asyncHandler(employeeController.archiveEmployee)
);

module.exports = router;
