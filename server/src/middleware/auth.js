const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");

const verifyJWT = asyncHandler(async (req, res, next) => {
  const tokenFromCookie = req.cookies?.accessToken;
  const authHeader = req.headers?.authorization;
  const tokenFromHeader =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    throw new ApiError(401, "Not authenticated. Please log in.");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, "User for this token no longer exists");
  }
  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated");
  }

  req.user = user;
  next();
});

const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      
      throw new ApiError(401, "Not authenticated");
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Requires one of: ${allowedRoles.join(", ")}`
      );
    }
    next();
  };
};

const requireSelfOrRole = (paramName, allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) throw new ApiError(401, "Not authenticated");

    const isOwnRecord =
      req.user.employee &&
      req.user.employee.toString() === req.params[paramName];
    const hasPrivilegedRole = allowedRoles.includes(req.user.role);

    if (!isOwnRecord && !hasPrivilegedRole) {
      throw new ApiError(403, "You can only access your own records");
    }
    next();
  };
};

module.exports = { verifyJWT, requireRole, requireSelfOrRole };