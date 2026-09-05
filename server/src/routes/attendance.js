const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { verifyJWT, requireRole } = require("../middleware/auth");
const { ROLE_GROUPS } = require("../constants/roles");
const { manualAttendanceSchema, updateAttendanceSchema } = require("../validators/attendanceValidators");
const attendanceController = require("../controllers/attendanceController");

const router = express.Router();

router.use(verifyJWT);

router.get("/me/today", asyncHandler(attendanceController.getMyTodayStatus));
router.get("/me", asyncHandler(attendanceController.listMyAttendance));
router.post("/check-in", asyncHandler(attendanceController.checkIn));
router.post("/check-out", asyncHandler(attendanceController.checkOut));

// --- HR-staff admin views ---
router.get("/", requireRole(ROLE_GROUPS.HR_STAFF), asyncHandler(attendanceController.listAttendance));
router.get("/:id", requireRole(ROLE_GROUPS.HR_STAFF), asyncHandler(attendanceController.getAttendanceById));

router.post(
  "/manual",
  requireRole(ROLE_GROUPS.HR_STAFF),
  validate(manualAttendanceSchema),
  asyncHandler(attendanceController.createManualAttendance)
);

router.patch(
  "/:id",
  requireRole(ROLE_GROUPS.HR_STAFF),
  validate(updateAttendanceSchema),
  asyncHandler(attendanceController.updateAttendance)
);

module.exports = router;
