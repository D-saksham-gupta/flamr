import { Router } from "express";
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  authLimiter,
  otpLimiter,
} from "../middleware/rateLimiter.middleware.js";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/verify-otp", otpLimiter, verifyOTP);
router.post("/resend-otp", otpLimiter, resendOTP);
router.post("/login", authLimiter, login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
