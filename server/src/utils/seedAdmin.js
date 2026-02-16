import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.model.js";
import connectDB from "../config/db.js";

const seedAdmin = async () => {
  await connectDB();

  const existing = await User.findOne({ email: "admin@flamr.com" });
  if (existing) {
    console.log("✅ Admin already exists");
    process.exit(0);
  }

  const admin = await User.create({
    email: "admin@flamr.com",
    password: "Admin@123456",
    role: "admin",
    isVerified: true,
    profileComplete: true,
    name: "Flamr Admin",
    age: 25,
    gender: "other",
    sexualPreference: "everyone",
  });

  console.log("🔥 Admin created successfully");
  console.log("   Email   :", admin.email);
  console.log("   Password: Admin@123456");
  console.log("   Role    :", admin.role);
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
