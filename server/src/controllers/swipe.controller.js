import Swipe from "../models/Swipe.model.js";
import Match from "../models/Match.model.js";
import User from "../models/User.model.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";

// ─────────────────────────────────────────────────────────
// @desc    Like or Pass a user
// @route   POST /api/swipes
// @access  Private
// ─────────────────────────────────────────────────────────
export const swipeUser = async (req, res) => {
  try {
    const { targetUserId, action } = req.body;
    const swiperId = req.user._id;

    // ── Validations ───────────────────────────────────────
    if (!targetUserId || !action) {
      return sendError(res, 400, "targetUserId and action are required");
    }
    if (!["like", "pass"].includes(action)) {
      return sendError(res, 400, "Action must be like or pass");
    }
    if (targetUserId === swiperId.toString()) {
      return sendError(res, 400, "You cannot swipe on yourself");
    }

    // Check target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser || !targetUser.isActive || targetUser.isBanned) {
      return sendError(res, 404, "User not found");
    }

    // Check if current user blocked target or vice versa
    const currentUser = await User.findById(swiperId);
    if (currentUser.blockedUsers.includes(targetUserId)) {
      return sendError(res, 403, "You have blocked this user");
    }

    // Check if already swiped
    const existingSwipe = await Swipe.findOne({
      swiper: swiperId,
      swiped: targetUserId,
    });
    if (existingSwipe) {
      return sendError(res, 409, "You have already swiped on this user");
    }

    // ── Record the swipe ──────────────────────────────────
    await Swipe.create({
      swiper: swiperId,
      swiped: targetUserId,
      action,
    });

    // ── If pass, return early ─────────────────────────────
    if (action === "pass") {
      return sendSuccess(res, 200, "Passed", { matched: false });
    }

    // ── Check for mutual like (match!) ────────────────────
    const mutualLike = await Swipe.findOne({
      swiper: targetUserId,
      swiped: swiperId,
      action: "like",
    });

    if (!mutualLike) {
      return sendSuccess(res, 200, "Liked", { matched: false });
    }

    // ── It's a Match! ─────────────────────────────────────
    // Prevent duplicate matches
    const existingMatch = await Match.findOne({
      users: { $all: [swiperId, targetUserId] },
    });
    if (existingMatch) {
      return sendSuccess(res, 200, "Already matched", {
        matched: true,
        matchId: existingMatch._id,
      });
    }

    const match = await Match.create({
      users: [swiperId, targetUserId],
    });

    // Populate match with both users' basic info
    const populatedMatch = await Match.findById(match._id).populate(
      "users",
      "name age photos bio",
    );

    return sendSuccess(res, 201, "🎉 It's a Match!", {
      matched: true,
      match: populatedMatch,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Get swipe history (who I swiped on)
// @route   GET /api/swipes/history
// @access  Private
// ─────────────────────────────────────────────────────────
export const getSwipeHistory = async (req, res) => {
  try {
    const { action, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { swiper: req.user._id };
    if (action && ["like", "pass"].includes(action)) {
      query.action = action;
    }

    const [swipes, total] = await Promise.all([
      Swipe.find(query)
        .populate("swiped", "name age photos")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Swipe.countDocuments(query),
    ]);

    return sendSuccess(res, 200, "Swipe history fetched", {
      swipes,
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
// @desc    Get users who liked me (incoming likes)
// @route   GET /api/swipes/likes-me
// @access  Private
// ─────────────────────────────────────────────────────────
export const getUsersWhoLikedMe = async (req, res) => {
  try {
    // Find users who liked me but I haven't swiped on yet
    const mySwipes = await Swipe.find({ swiper: req.user._id }).select(
      "swiped",
    );
    const alreadySwiped = mySwipes.map((s) => s.swiped);

    const likes = await Swipe.find({
      swiped: req.user._id,
      action: "like",
      swiper: { $nin: alreadySwiped },
    }).populate("swiper", "name age photos bio");

    return sendSuccess(res, 200, "Incoming likes fetched", {
      likes,
      count: likes.length,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};
