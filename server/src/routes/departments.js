const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { verifyJWT, requireRole } = require("../middleware/auth");
const { ROLE_GROUPS } = require("../constants/roles");
const {
  createDepartmentSchema,
  updateDepartmentSchema,
} = require("../validators/departmentValidators");
const departmentController = require("../controllers/departmentController");

const router = express.Router();

router.use(verifyJWT);

router.get("/", requireRole(ROLE_GROUPS.HR_STAFF), asyncHandler(departmentController.listDepartments));
router.get("/:id", requireRole(ROLE_GROUPS.HR_STAFF), asyncHandler(departmentController.getDepartmentById));

router.post(
  "/",
  requireRole(ROLE_GROUPS.HR_STAFF),
  validate(createDepartmentSchema),
  asyncHandler(departmentController.createDepartment)
);

router.patch(
  "/:id",
  requireRole(ROLE_GROUPS.HR_STAFF),
  validate(updateDepartmentSchema),
  asyncHandler(departmentController.updateDepartment)
);

router.delete("/:id", requireRole(ROLE_GROUPS.HR_STAFF), asyncHandler(departmentController.deleteDepartment));

module.exports = router;