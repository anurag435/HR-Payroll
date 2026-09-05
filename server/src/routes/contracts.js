const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { verifyJWT, requireRole } = require("../middleware/auth");
const { ROLE_GROUPS } = require("../constants/roles");
const { createContractSchema, updateContractSchema } = require("../validators/contractValidators");
const contractController = require("../controllers/contractController");

const router = express.Router();

router.use(verifyJWT);
router.use(requireRole(ROLE_GROUPS.HR_STAFF)); 

router.get("/active-for-period", asyncHandler(contractController.getActiveContractForPeriod));

router.get("/", asyncHandler(contractController.listContracts));
router.get("/:id", asyncHandler(contractController.getContractById));

router.post("/", validate(createContractSchema), asyncHandler(contractController.createContract));
router.patch("/:id", validate(updateContractSchema), asyncHandler(contractController.updateContract));
router.patch("/:id/end", asyncHandler(contractController.endContract));

module.exports = router;