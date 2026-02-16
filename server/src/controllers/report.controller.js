import Report from "../models/Report.model.js";
import User from "../models/User.model.js";
import Match from "../models/Match.model.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";

// ─────────────────────────────────────────────────────────
// @desc    Report a user
// @route   POST /api/reports
// @access  Private
// ─────────────────────────────────────────────────────────
export const reportUser = async (req, res) => {
  try {
    const { reportedUserId, reason, description } = req.body;
    const reporterId = req.user._id;

    // ── Validations ───────────────────────────────────────
    if (!reportedUserId || !reason) {
      return sendError(res, 400, "reportedUserId and reason are required");
    }
    if (reportedUserId === reporterId.toString()) {
      return sendError(res, 400, "You cannot report yourself");
    }

    const validReasons = [
      "inappropriate_photos",
      "harassment",
      "spam",
      "fake_profile",
      "underage",
      "other",
    ];
    if (!validReasons.includes(reason)) {
      return sendError(
        res,
        400,
        `Reason must be one of: ${validReasons.join(", ")}`,
      );
    }

    // Check reported user exists
    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) return sendError(res, 404, "User not found");

    // Prevent duplicate reports
    const existing = await Report.findOne({
      reporter: reporterId,
      reported: reportedUserId,
    });
    if (existing) {
      return sendError(res, 409, "You have already reported this user");
    }

    const report = await Report.create({
      reporter: reporterId,
      reported: reportedUserId,
      reason,
      description: description?.trim() || "",
    });

    // Auto-block reported user for reporter's safety
    await User.findByIdAndUpdate(reporterId, {
      $addToSet: { blockedUsers: reportedUserId },
    });

    // Auto-flag if user has 3+ reports
    const reportCount = await Report.countDocuments({
      reported: reportedUserId,
      status: "pending",
    });
    if (reportCount >= 3) {
      await User.findByIdAndUpdate(reportedUserId, {
        $set: { isActive: false },
      });
      console.log(
        `🚩 User ${reportedUserId} auto-flagged after ${reportCount} reports`,
      );
    }

    return sendSuccess(
      res,
      201,
      "Report submitted. Thank you for keeping Flamr safe.",
      {
        reportId: report._id,
      },
    );
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Block a user
// @route   POST /api/reports/block/:userId
// @access  Private
// ─────────────────────────────────────────────────────────
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return sendError(res, 400, "You cannot block yourself");
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return sendError(res, 404, "User not found");

    // Add to blocked list
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { blockedUsers: userId },
    });

    // Deactivate any existing match between them
    await Match.findOneAndUpdate(
      { users: { $all: [req.user._id, userId] } },
      { $set: { isActive: false } },
    );

    return sendSuccess(res, 200, "User blocked successfully");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Unblock a user
// @route   DELETE /api/reports/block/:userId
// @access  Private
// ─────────────────────────────────────────────────────────
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { blockedUsers: userId },
    });

    return sendSuccess(res, 200, "User unblocked successfully");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Get my blocked users list
// @route   GET /api/reports/blocked
// @access  Private
// ─────────────────────────────────────────────────────────
export const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "blockedUsers",
      "name age photos",
    );

    return sendSuccess(res, 200, "Blocked users fetched", {
      blockedUsers: user.blockedUsers,
      count: user.blockedUsers.length,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Get my submitted reports
// @route   GET /api/reports/my-reports
// @access  Private
// ─────────────────────────────────────────────────────────
export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate("reported", "name age photos")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Your reports fetched", {
      reports,
      count: reports.length,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ══════════════════════════════════════════════════════════
//  ADMIN ONLY ROUTES BELOW
// ══════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────
// @desc    Get all pending reports (admin)
// @route   GET /api/reports/admin/pending
// @access  Admin
// ─────────────────────────────────────────────────────────
export const getAllReports = async (req, res) => {
  try {
    const { status = "pending", page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const validStatuses = ["pending", "reviewed", "resolved", "dismissed"];
    const filterStatus = validStatuses.includes(status) ? status : "pending";

    const [reports, total] = await Promise.all([
      Report.find({ status: filterStatus })
        .populate("reporter", "name email phone")
        .populate("reported", "name email phone photos isBanned isActive")
        .populate("reviewedBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Report.countDocuments({ status: filterStatus }),
    ]);

    return sendSuccess(res, 200, "Reports fetched", {
      reports,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Review and resolve a report (admin)
// @route   PUT /api/reports/admin/:reportId
// @access  Admin
// ─────────────────────────────────────────────────────────
export const reviewReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, banUser } = req.body;

    const validStatuses = ["reviewed", "resolved", "dismissed"];
    if (!validStatuses.includes(status)) {
      return sendError(
        res,
        400,
        `Status must be one of: ${validStatuses.join(", ")}`,
      );
    }

    const report = await Report.findById(reportId);
    if (!report) return sendError(res, 404, "Report not found");
    if (report.status !== "pending") {
      return sendError(res, 400, "Report already reviewed");
    }

    report.status = status;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    await report.save();

    // Optionally ban the reported user
    if (banUser && status === "resolved") {
      await User.findByIdAndUpdate(report.reported, {
        $set: { isBanned: true, isActive: false },
      });
      console.log(`🔨 User ${report.reported} banned by admin ${req.user._id}`);
    }

    const populated = await Report.findById(reportId)
      .populate("reporter", "name email")
      .populate("reported", "name email isBanned");

    return sendSuccess(res, 200, "Report reviewed", { report: populated });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Ban a user directly (admin)
// @route   PUT /api/reports/admin/ban/:userId
// @access  Admin
// ─────────────────────────────────────────────────────────
export const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) return sendError(res, 404, "User not found");
    if (user.role === "admin") {
      return sendError(res, 403, "Cannot ban an admin account");
    }

    user.isBanned = true;
    user.isActive = false;
    await user.save();

    console.log(
      `🔨 User ${userId} banned by admin ${req.user._id}. Reason: ${reason || "Not specified"}`,
    );

    return sendSuccess(
      res,
      200,
      `User ${user.name || user.email} has been banned`,
    );
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Unban a user (admin)
// @route   PUT /api/reports/admin/unban/:userId
// @access  Admin
// ─────────────────────────────────────────────────────────
export const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return sendError(res, 404, "User not found");

    user.isBanned = false;
    user.isActive = true;
    await user.save();

    return sendSuccess(
      res,
      200,
      `User ${user.name || user.email} has been unbanned`,
    );
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Get all users (admin dashboard)
// @route   GET /api/reports/admin/users
// @access  Admin
// ─────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isBanned, isActive } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { role: "user" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (isBanned !== undefined) query.isBanned = isBanned === "true";
    if (isActive !== undefined) query.isActive = isActive === "true";

    const [users, total] = await Promise.all([
      User.find(query)
        .select(
          "name email phone age gender isActive isBanned profileComplete createdAt lastActive photos",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    // Summary stats
    const [totalUsers, bannedCount, activeCount, flaggedCount] =
      await Promise.all([
        User.countDocuments({ role: "user" }),
        User.countDocuments({ role: "user", isBanned: true }),
        User.countDocuments({ role: "user", isActive: true }),
        User.countDocuments({ role: "user", isActive: false, isBanned: false }),
      ]);

    return sendSuccess(res, 200, "Users fetched", {
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
      stats: {
        totalUsers,
        bannedCount,
        activeCount,
        flaggedCount,
      },
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};
