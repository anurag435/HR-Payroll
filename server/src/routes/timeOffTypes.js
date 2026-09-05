const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { verifyJWT, requireRole } = require("../middleware/auth");
const { ROLE_GROUPS } = require("../constants/roles");
const { createTimeOffTypeSchema, updateTimeOffTypeSchema } = require("../validators/timeOffValidators");
const controller = require("../controllers/timeOffTypeController");

const router = express.Router();

router.use(verifyJWT);

router.get("/", asyncHandler(controller.listTimeOffTypes));
router.get("/:id", asyncHandler(controller.getTimeOffTypeById));

router.post(
  "/",
  requireRole(ROLE_GROUPS.HR_STAFF),
  validate(createTimeOffTypeSchema),
  asyncHandler(controller.createTimeOffType)
);
router.patch(
  "/:id",
  requireRole(ROLE_GROUPS.HR_STAFF),
  validate(updateTimeOffTypeSchema),
  asyncHandler(controller.updateTimeOffType)
);

module.exports = router;