require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/database");
const User = require("../models/User");
const { ROLES } = require("../constants/roles");

const ADMIN_NAME = process.env.SEED_ADMIN_NAME;
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

async function seedAdmin() {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    console.log(`Admin already exists — nothing to do.`);
    console.log(`  email: ${existing.email}`);
    console.log(`  role:  ${existing.role}`);
  } else {
    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: ROLES.ADMIN,
    });

    console.log("Admin account created successfully:");
    console.log(`  email:    ${admin.email}`);
    console.log(`  password: ${ADMIN_PASSWORD}`);
    console.log("");
    console.log("Log in with these, then use POST /users to create everyone else.");
  }

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
