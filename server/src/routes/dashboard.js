const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { verifyJWT, requireRole } = require("../middleware/auth");
const { ROLE_GROUPS } = require("../constants/roles");
const controller = require("../controllers/dashboardController");

const router = express.Router();

router.use(verifyJWT);
router.use(requireRole(ROLE_GROUPS.HR_STAFF));

router.get("/summary", asyncHandler(controller.getSummary));

module.exports = router;
