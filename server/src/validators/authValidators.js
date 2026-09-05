const { z } = require("zod");
const { ALL_ROLES } = require("../constants/roles");

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(ALL_ROLES, {
    errorMap: () => ({ message: `Role must be one of: ${ALL_ROLES.join(", ")}` }),
  }),
  employee: z.string().optional().nullable(), // Employee ObjectId as string
});

module.exports = { loginSchema, createUserSchema };