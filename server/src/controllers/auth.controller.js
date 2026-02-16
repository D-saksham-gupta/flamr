import User from "../models/User.model.js";
import {
  generateOTP,
  sendOTPEmail,
  sendOTPSMS,
} from "../services/otp.service.js";
import { generateToken, attachTokenCookie } from "../utils/jwt.utils.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";

// ─────────────────────────────────────────────────────────
// @desc    Register with email or phone
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    console.log("📥 Register hit:", req.body);

    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Email or phone is required" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters",
        });
    }

    const existingUser = await User.findOne({
      $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    });

    if (existingUser) {
      const field = email ? "Email" : "Phone number";
      return res
        .status(409)
        .json({ success: false, message: `${field} already registered` });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    console.log("🔐 Generated OTP:", otp);

    const user = await User.create({
      email: email || undefined,
      phone: phone || undefined,
      password,
      otp,
      otpExpiry,
    });

    console.log("✅ User created:", user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Check your OTP.",
      data: {
        userId: user._id,
        method: email ? "email" : "phone",
        ...(process.env.NODE_ENV === "development" && { otp }),
      },
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message, stack: err.stack });
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
// ─────────────────────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return sendError(res, 400, "userId and otp are required");
    }

    const user = await User.findById(userId).select("+otp +otpExpiry");

    if (!user) return sendError(res, 404, "User not found");
    if (user.isVerified) return sendError(res, 400, "Account already verified");
    if (!user.otp || !user.otpExpiry) {
      return sendError(res, 400, "No OTP found. Please request a new one");
    }
    if (new Date() > user.otpExpiry) {
      return sendError(res, 400, "OTP has expired. Please request a new one");
    }
    if (user.otp !== otp.toString()) {
      return sendError(res, 400, "Invalid OTP");
    }

    // Mark verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);
    attachTokenCookie(res, token);

    return sendSuccess(res, 200, "Account verified successfully", {
      token,
      user: user.toJSON(),
      needsOnboarding: !user.profileComplete,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
// ─────────────────────────────────────────────────────────
export const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return sendError(res, 404, "User not found");
    if (user.isVerified) return sendError(res, 400, "Account already verified");

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      if (user.email) await sendOTPEmail(user.email, otp);
      else await sendOTPSMS(user.phone, otp);
    } catch (otpErr) {
      console.error("OTP resend failed:", otpErr.message);
    }

    return sendSuccess(res, 200, "OTP resent successfully", {
      ...(process.env.NODE_ENV === "development" && { otp }),
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Login
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return sendError(res, 400, "Email or phone is required");
    }
    if (!password) return sendError(res, 400, "Password is required");

    // Find user and include password field
    const user = await User.findOne({
      $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    }).select("+password");

    if (!user) return sendError(res, 401, "Invalid credentials");
    if (user.isBanned)
      return sendError(res, 403, "Account suspended. Contact support.");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, 401, "Invalid credentials");

    if (!user.isVerified) {
      // Resend OTP automatically
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      try {
        if (user.email) await sendOTPEmail(user.email, otp);
        else await sendOTPSMS(user.phone, otp);
      } catch (e) {
        console.error(e.message);
      }

      return sendError(
        res,
        403,
        "Account not verified. A new OTP has been sent.",
        {
          userId: user._id,
          needsVerification: true,
          ...(process.env.NODE_ENV === "development" && { otp }),
        },
      );
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);
    attachTokenCookie(res, token);

    return sendSuccess(res, 200, "Login successful", {
      token,
      user: user.toJSON(),
      needsOnboarding: !user.profileComplete,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return sendSuccess(res, 200, "Logged out successfully");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 404, "User not found");

    return sendSuccess(res, 200, "User fetched", {
      user,
      needsOnboarding: !user.profileComplete,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Forgot password — send reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone)
      return sendError(res, 400, "Email or phone is required");

    const user = await User.findOne({
      $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    });

    // Always return success to prevent user enumeration
    if (!user) {
      return sendSuccess(
        res,
        200,
        "If that account exists, a reset code was sent",
      );
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      if (user.email) await sendOTPEmail(user.email, otp);
      else await sendOTPSMS(user.phone, otp);
    } catch (e) {
      console.error(e.message);
    }

    return sendSuccess(res, 200, "Reset code sent", {
      userId: user._id,
      ...(process.env.NODE_ENV === "development" && { otp }),
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
// ─────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    if (!userId || !otp || !newPassword) {
      return sendError(res, 400, "userId, otp, and newPassword are required");
    }
    if (newPassword.length < 6) {
      return sendError(res, 400, "Password must be at least 6 characters");
    }

    const user = await User.findById(userId).select("+otp +otpExpiry");
    if (!user) return sendError(res, 404, "User not found");

    if (!user.otp || new Date() > user.otpExpiry) {
      return sendError(res, 400, "OTP expired. Please request a new one");
    }
    if (user.otp !== otp.toString()) {
      return sendError(res, 400, "Invalid OTP");
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return sendSuccess(res, 200, "Password reset successful. Please log in.");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};
