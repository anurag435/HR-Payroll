const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { verifyJWT, requireRole } = require("../middleware/auth");
const { ROLE_GROUPS } = require("../constants/roles");
const { createAllocationSchema } = require("../validators/timeOffValidators");
const controller = require("../controllers/timeOffAllocationController");

const router = express.Router();

router.use(verifyJWT);

router.get("/", (req, res, next) => {
  if (!ROLE_GROUPS.HR_STAFF.includes(req.user.role)) {
    req.query.employee = req.user.employee ? req.user.employee.toString() : "___none___";
  }
  next();
}, asyncHandler(controller.listAllocations));

router.get("/:id", asyncHandler(controller.getAllocationById));

router.post(
  "/",
  requireRole(ROLE_GROUPS.HR_STAFF),
  validate(createAllocationSchema),
  asyncHandler(controller.createAllocation)
);

module.exports = router;
