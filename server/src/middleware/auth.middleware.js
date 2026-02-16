import { verifyToken } from "../utils/jwt.utils.js";
import { sendError } from "../utils/response.utils.js";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers?.authorization?.replace("Bearer ", "");

    if (!token) return sendError(res, 401, "Not authenticated");

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return sendError(res, 401, "User no longer exists");
    if (user.isBanned) return sendError(res, 403, "Account suspended");

    req.user = user;
    next();
  } catch {
    return sendError(res, 401, "Invalid or expired token");
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return sendError(res, 403, "Admin access required");
  }
  next();
};

export const verifiedOnly = (req, res, next) => {
  if (!req.user?.isVerified) {
    return sendError(res, 403, "Please verify your account first");
  }
  next();
};
