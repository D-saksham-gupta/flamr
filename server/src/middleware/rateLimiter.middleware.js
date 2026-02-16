import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { success: false, message: "Too many attempts, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 5,
  message: { success: false, message: "Too many OTP requests" },
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 100,
  message: { success: false, message: "Rate limit exceeded" },
});
