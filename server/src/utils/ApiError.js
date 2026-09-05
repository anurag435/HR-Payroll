class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = []) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors; // e.g. field-level validation errors
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
