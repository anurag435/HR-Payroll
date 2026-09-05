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

const logout = async (req, res) => {
  res.clearCookie("accessToken");
  return new ApiResponse(200, null, "Logged out successfully").send(res);
};

const getMe = async (req, res) => {
  return new ApiResponse(200, req.user, "Current user fetched").send(res);
};

const createUser = async (req, res) => {
  const { name, email, password, role, employee } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const user = await User.create({ name, email, password, role, employee });

  return new ApiResponse(201, user, "User created successfully").send(res);
};

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

const listUsers = async (req, res) => {
  const { role } = req.query;
  const filter = {};
  if (role) filter.role = role;

  const users = await User.find(filter)
    .populate("employee", "name email")
    .sort({ createdAt: -1 });

  return new ApiResponse(200, users, "Users fetched").send(res);
};

const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be true or false");
  }

  if (req.user._id.toString() === id && isActive === false) {
    throw new ApiError(403, "You cannot deactivate your own account");
  }

  const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return new ApiResponse(200, user, `User ${isActive ? "activated" : "deactivated"}`).send(res);
};

module.exports = { login, logout, getMe, createUser, updateUserRole, listUsers, updateUserStatus };