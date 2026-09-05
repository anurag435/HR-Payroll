const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { verifyJWT, requireRole } = require("../middleware/auth");
const { ROLE_GROUPS } = require("../constants/roles");
const {
  createWorkingScheduleSchema,
  updateWorkingScheduleSchema,
} = require("../validators/workingScheduleValidators");
const workingScheduleController = require("../controllers/workingScheduleController");

const router = express.Router();

router.use(verifyJWT);

router.get("/", requireRole(ROLE_GROUPS.HR_STAFF), asyncHandler(workingScheduleController.listWorkingSchedules));
router.get("/:id", requireRole(ROLE_GROUPS.HR_STAFF), asyncHandler(workingScheduleController.getWorkingScheduleById));

router.post(
  "/",
  requireRole(ROLE_GROUPS.HR_STAFF),
  validate(createWorkingScheduleSchema),
  asyncHandler(workingScheduleController.createWorkingSchedule)
);

router.patch(
  "/:id",
  requireRole(ROLE_GROUPS.HR_STAFF),
  validate(updateWorkingScheduleSchema),
  asyncHandler(workingScheduleController.updateWorkingSchedule)
);

router.patch(
  "/:id/archive",
  requireRole(ROLE_GROUPS.HR_STAFF),
  asyncHandler(workingScheduleController.archiveWorkingSchedule)
);

module.exports = router;