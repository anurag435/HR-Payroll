const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { verifyJWT, requireRole } = require("../middleware/auth");
const { ROLE_GROUPS } = require("../constants/roles");
const { createTimeOffRequestSchema } = require("../validators/timeOffValidators");
const controller = require("../controllers/timeOffRequestController");

const router = express.Router();

router.use(verifyJWT);

router.post(
  "/",
  validate(createTimeOffRequestSchema),
  asyncHandler(controller.createRequest)
);

router.get("/", (req, res, next) => {
  if (!ROLE_GROUPS.HR_STAFF.includes(req.user.role)) {
    req.query.employee = req.user.employee ? req.user.employee.toString() : "___none___";
  }
  next();
}, asyncHandler(controller.listRequests));

router.get("/:id", asyncHandler(controller.getRequestById));

router.patch("/:id/approve", requireRole(ROLE_GROUPS.HR_STAFF), asyncHandler(controller.approveRequest));
router.patch("/:id/refuse", requireRole(ROLE_GROUPS.HR_STAFF), asyncHandler(controller.refuseRequest));

module.exports = router;
