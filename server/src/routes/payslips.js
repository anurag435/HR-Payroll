const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { verifyJWT } = require("../middleware/auth");
const { ROLE_GROUPS } = require("../constants/roles");
const controller = require("../controllers/payslipController");

const router = express.Router();

router.use(verifyJWT);

// Employees can only ever see their own payslips in the list; payroll
// staff can see everyone's (optionally filtered via ?employee=).
router.get(
  "/",
  (req, res, next) => {
    if (!ROLE_GROUPS.PAYROLL_STAFF.includes(req.user.role)) {
      req.query.employee = req.user.employee ? req.user.employee.toString() : "___none___";
    }
    next();
  },
  asyncHandler(controller.listPayslips)
);

router.get("/:id", asyncHandler(controller.getPayslipById));
router.get("/:id/pdf", asyncHandler(controller.downloadPayslipPdf));

module.exports = router;
