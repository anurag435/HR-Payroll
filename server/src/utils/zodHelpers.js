const { z } = require("zod");

const zObjectId = (fieldName = "id") =>
  z.string().regex(/^[0-9a-fA-F]{24}$/, `${fieldName} must be a valid ID`);

module.exports = { zObjectId };