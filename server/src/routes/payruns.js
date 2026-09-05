const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { verifyJWT, requireRole } = require("../middleware/auth");
const { ROLE_GROUPS } = require("../constants/roles");
const { createPayrunSchema } = require("../validators/payrunValidators");
const controller = require("../controllers/payrunController");

const router = express.Router();

router.use(verifyJWT);
router.use(requireRole(ROLE_GROUPS.PAYROLL_STAFF));

router.get("/", asyncHandler(controller.listPayruns));
router.get("/:id", asyncHandler(controller.getPayrunById));
router.post("/", validate(createPayrunSchema), asyncHandler(controller.createPayrun));

router.patch("/:id/compute", asyncHandler(controller.computePayrun));
router.patch("/:id/validate", asyncHandler(controller.validatePayrun));
router.patch("/:id/mark-paid", asyncHandler(controller.markPayrunPaid));

module.exports = router;
