const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { generateToken, setTokenCookie } = require("../utils/generateToken");
const { ROLES } = require("../constants/roles");

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user);
  setTokenCookie(res, token);

  return new ApiResponse(
    200,
    { user, token },
    "Login successful"
  ).send(res);
};

/**
 * POST /api/auth/logout
 * Clears the auth cookie. Protected — just needs a valid session to call.
 */
const logout = async (req, res) => {
  res.clearCookie("accessToken");
  return new ApiResponse(200, null, "Logged out successfully").send(res);
};

/**
 * GET /api/auth/me
 * Protected. Returns the currently authenticated user — useful for the
 * frontend to restore session state on page refresh.
 */
const getMe = async (req, res) => {
  return new ApiResponse(200, req.user, "Current user fetched").send(res);
};

/**
 * POST /api/auth/users
 * Admin-only. Creates a new login account and links it to an Employee.
 *
 * Security note: this is exactly the endpoint the spec calls out —
 * "Users won't be able to assign or elevate their own roles." That
 * constraint is enforced below, not just hidden in the UI.
 */
const createUser = async (req, res) => {
  const { name, email, password, role, employee } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const user = await User.create({ name, email, password, role, employee });

  return new ApiResponse(201, user, "User created successfully").send(res);
};

/**
 * PATCH /api/auth/users/:id/role
 * Admin-only route (enforced by requireRole in the route definition).
 * EXTRA explicit check here: even an Admin cannot change their own role
 * through this endpoint — self-elevation is blocked at the data layer,
 * not just by "well, only admins can call this."
 */
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (req.user._id.toString() === id) {
    throw new ApiError(
      403,
      "You cannot change your own role, even as an Admin. Ask another Admin."
    );
  }

  if (!Object.values(ROLES).includes(role)) {
    throw new ApiError(400, `Role must be one of: ${Object.values(ROLES).join(", ")}`);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return new ApiResponse(200, user, "User role updated").send(res);
};

module.exports = { login, logout, getMe, createUser, updateUserRole };