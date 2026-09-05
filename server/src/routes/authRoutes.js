const express = require("express");
const authController = require("../controllers/authController");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { loginSchema, createUserSchema } = require("../validators/authValidators");
const { verifyJWT, requireRole } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");

const router = express.Router();

router.post("/login", validate(loginSchema), asyncHandler(authController.login));

router.post("/logout", verifyJWT, asyncHandler(authController.logout));
router.get("/me", verifyJWT, asyncHandler(authController.getMe));

router.post(
  "/users",
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  validate(createUserSchema),
  asyncHandler(authController.createUser)
);

router.patch(
  "/users/:id/role",
  verifyJWT,
  requireRole([ROLES.ADMIN]),
  asyncHandler(authController.updateUserRole)
);

module.exports = router;